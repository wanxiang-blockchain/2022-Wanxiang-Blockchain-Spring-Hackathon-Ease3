import { Injectable } from '@nestjs/common';
import { W3Logger } from 'src/common/log/logger.service';
import { MQManager, } from '../common/mq/mq.manager';
import { AMQPChannel, AMQPQueue } from '@cloudamqp/amqp-client';
import { ConsumerManager } from './consumer/consumer.manager';
import { CronConstants } from 'src/cron.constants';
import { ConsumerConfig } from './consumer/consumer.config';
import { Cron } from '@nestjs/schedule';
import { OnEvent } from "@nestjs/event-emitter";
import { TriggerPool } from './trigger-ppol/trigger.pool';
import { MQChannel } from 'src/common/mq/mq.channel';
import { MQChannelConfig } from 'src/common/mq/mq.channel.config';
import { NotifyEventPayload } from 'src/smart-notify-base-shared/event/notify.event.payload';

export class ConsumerQueueConfig {
  queue: AMQPQueue;
  config: ConsumerConfig;
}

@Injectable()
export class DataProcessService {
  private isRunning = false;
  private logger: W3Logger;
  private consumer_pool: Map<string, ConsumerQueueConfig> = new Map();
  constructor(
    private readonly mqManager: MQManager,
    private readonly consumerManager: ConsumerManager,
    private readonly triggerPool: TriggerPool
  ) {
    this.logger = new W3Logger('DataProcessService');
    TriggerPool.INSTANCE = this.triggerPool;
    // TriggerPool.INSTANCE.load();

    setTimeout(() => {
      this.start();
    }, 3000);
    this.logger.verbose('will start data process in 3000 milliseconds later');
  }
  async start() {
    await this.consumerManager.load();

    let consumers = this.consumerManager.Consumers;
    if (consumers) {
      this.logger.log(`got consumers ${consumers.length}`);
    }
    for (const consumer of consumers) {
      await this.initConsumerQueue(consumer);
    }
  }
  async initConsumerQueue(consumer: ConsumerConfig) {
    this.logger.log(`initConsumerQueue ${consumer.channel_config.identity}`);
    let mq_channel = await this.mqManager.getChannel(consumer.channel_config);
    let amq_channel: AMQPChannel = mq_channel.channel;

    let queue = await amq_channel.queue(consumer.channel_config.queue);
    this.logger.log(`bind queue ${queue.name}`);

    this.consumer_pool.set(consumer.channel_config.identity, { queue: queue, config: consumer });

  }

  async stop(key: string = '') {
    this.logger.warn(`stop ${key}`);
    if (this.consumer_pool) {
      if (key) {
        const queue = this.consumer_pool.get(key);
        if (queue) {
          try {
            await this.mqManager.disConnect(queue.config.channel_config);
          } catch (error) {
            this.logger.error(error);
          }
        }
        this.consumer_pool.delete(key);
      } else {

        for (const iterator of this.consumer_pool) {
          const queue = iterator[1];
          if (queue) {
            try {
              await this.mqManager.disConnect(queue.config.channel_config);
            } catch (error) {
              this.logger.error(error);
            }
          }
        }
        this.consumer_pool.clear();
      }
    }
  }

  getConsumers(): string[] {
    let keys: string[] = [];
    for (const iterator of this.consumer_pool) {
      keys.push(iterator[0]);
    }
    return keys;
  }

  @Cron(CronConstants.QUEUE_FETCH_INTERVAL)
  async queueFetch(): Promise<any> {

    if (this.isRunning) {
      this.logger.warn('queue fetch is running, aborting new job');
      return;
    } else {
      // console.log(this.consumer_pool.size);

      if (this.consumer_pool && this.consumer_pool.size > 0) {
        this.isRunning = true;
        // this.logger.log('queue fetch start');
      } else {
        this.logger.warn(`queue is not started yet, ignore`);
        return;
      }
    }

    try {
      for (const consumer of this.consumer_pool) {
        let config = consumer[1].config;
        let queue = consumer[1].queue;
        try {

          let msg = await queue.get({ noAck: false });

          while (msg) {
            let msgStr = msg.bodyToString();
            if (config && config.worker) {
              await config.worker.process(msgStr);
              this.logger.debug(`[${config.worker.name}] worker.process finished`);
            }
            await msg.ack();

            this.logger.debug(`queue msg ack at`, new Date());
            msg = await queue.get({ noAck: false });
            this.logger.debug(`queue get msg at`, new Date());
          }
          if (!msg) {
            this.logger.warn(`queue[${queue.name}] got no message`);
            continue;
          }
        } catch (error) {
          console.log(`[${config.worker.name}] worker.process error`, error);

          await this.stop(consumer[0]);
          await this.initConsumerQueue(config);
        }
      }
    } catch (error) {
      console.log('worker.process outer error', error);
    }
    finally {
      this.isRunning = false;
    }
  }

  @OnEvent('worker.event', { async: true })
  async handleWorkerEvent(evtPayload: NotifyEventPayload) {
    let data = evtPayload.data;
    this.logger.debug(`handleWorkerEvent:${evtPayload.timestamp} payload:${JSON.stringify(data)}`);

    for (const notify_channel of evtPayload.notify_channels) {
      let evt: NotifyEventPayload = {
        timestamp: evtPayload.timestamp,
        nonce: evtPayload.nonce,
        trigger_info: evtPayload.trigger_info,
        trigger_parameter: evtPayload.trigger_parameter,
        notify_channels: [notify_channel],
        data: evtPayload.data
      }
      await this.publishEvent(evt);
    }

  }
  async publishEvent(evtPayload: NotifyEventPayload): Promise<boolean> {

    let identity = "Moonriver-Event-" + (evtPayload.notify_channels[0].channel_type || 'UNKNOWN-CHANNEL');
    let mqConfig: MQChannelConfig = {
      identity: identity,
      exchange: identity,
      routing_key: identity,
      exchange_type: 'direct',
      queue: identity,
      auto_create_exchange: true,
      auto_create_queue_and_bind: true
    };
    try {
      let mq_channel: MQChannel = await this.mqManager.getChannel(mqConfig);
      let data = JSON.stringify(evtPayload);
      let confirmed = await mq_channel.channel.basicPublish(mqConfig.exchange, mqConfig.routing_key, data);
      this.logger.debug(`publishEvent confirmed:${confirmed}, identity:${mqConfig.identity}`);
      return true;
    } catch (error) {
      console.error(error);
      this.logger.error("publishEvent error");
      await this.mqManager.disConnect(mqConfig);
      return false;
    }
  }

}
