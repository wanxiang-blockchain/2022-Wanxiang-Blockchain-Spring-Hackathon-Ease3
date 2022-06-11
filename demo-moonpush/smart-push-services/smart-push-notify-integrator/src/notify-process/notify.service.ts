import { Inject, Injectable } from '@nestjs/common';
import { W3Logger } from 'src/common/log/logger.service';
import { MQManager, } from '../common/mq/mq.manager';
import { AMQPChannel, AMQPQueue } from '@cloudamqp/amqp-client';
import { ConsumerManager } from './consumer/consumer.manager';
import { ConsumerConfig } from './consumer/consumer.config';
import { CronConstants } from 'src/cron.constants';
import { Cron } from '@nestjs/schedule';
import { NotifyEventPayload } from 'src/smart-notify-base-shared/event/notify.event.payload';
import { RepositoryConsts } from 'src/common/orm/repositoryConsts';
import { Repository } from 'typeorm';
import { NotifyHistory } from 'src/common/entity/SmartNotifyModule/NotifyHistory.entity';

import { NotifyLimitCheck } from 'src/smart-notify-base-shared/notify/notify.limit.check';

export class ConsumerQueueConfig {
  queue: AMQPQueue;
  config: ConsumerConfig;
}

@Injectable()
export class NotifyService {
  private logger: W3Logger;
  private isRunning = false;
  private consumer_pool: Map<string, ConsumerQueueConfig> = new Map();

  constructor(
    private readonly mqManager: MQManager,
    private readonly consumerManager: ConsumerManager,

    @Inject(RepositoryConsts.SMART_NOTIFY_NOTIFY_HISTORY_REPOSITORY)
    private nhRepository: Repository<NotifyHistory>,
  ) {
    this.logger = new W3Logger('NotifyService');

    setTimeout(() => {
      this.start();
    }, 3000);
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

  @Cron(CronConstants.QUEUE_FETCH_INTERVAL)
  async queueFetch(): Promise<any> {

    if (this.isRunning) {
      this.logger.warn('queue fetch is running, aborting new job');
      return;
    } else {
      // console.log(this.consumer_pool.size);

      if (this.consumer_pool && this.consumer_pool.size > 0) {
        this.isRunning = true;
        this.logger.log('queue fetch start');
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
          let mq_msg = await queue.get({ noAck: false });
          while (mq_msg) {
            let content = mq_msg.bodyToString();
            this.logger.debug(content);

            let evt = new NotifyEventPayload();
            Object.assign(evt, JSON.parse(content));
            if (evt) {
              await this.addNotifyHistory(evt);
            }
            await mq_msg.ack();

            let check_over_limit: NotifyLimitCheck = await this.checkNotifyOverLimitation(evt);
            this.logger.debug(`check_over_limit ${JSON.stringify(check_over_limit)}`);
            if (check_over_limit.over === false) {
              if (config && config.worker) {
                this.logger.debug('worker.process start');
                await config.worker.process(evt);
                this.logger.debug('worker.process finished');
              }
            }
            else {
              this.logger.warn(`notify over limit for ${JSON.stringify(check_over_limit)}`);
            }


            mq_msg = await queue.get({ noAck: false });
          }
          if (!mq_msg) {
            this.logger.warn(`queue[${queue.name}] got no message`);
            continue;
          }
        } catch (error) {
          console.log('worker.process error', error);

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

  async addNotifyHistory(evt: NotifyEventPayload) {

    let history: NotifyHistory = new NotifyHistory();
    history.created_time = evt.timestamp;
    history.nonce = evt.nonce;

    if (evt.trigger_info) {
      history.chain = evt.trigger_info.chain;
      history.trigger_id = evt.trigger_info.id || 0;
      history.trigger_type = evt.trigger_info.trigger_type;
      history.user_id = evt.trigger_info.user_id || 0;
    }
    if (evt.notify_channels) {
      history.notify_channel_id = evt.notify_channels[0].id || 0;
    }
    if (evt.data) {
      history.content = JSON.stringify(evt.data);

      if (evt.data.result) {
        let block_number = evt.data.result.blockNumber || evt.data.result.block_number;
        history.block_number = block_number;

        let tx = evt.data.result.tx || evt.data.result.transaction;
        history.tx = tx;
      }

    }

    await this.nhRepository.save(history);
    this.logger.debug(`save NotifyHistory with id=${history.id}`)
  }

  async checkNotifyOverLimitation(evt: NotifyEventPayload): Promise<NotifyLimitCheck> {

    //TODO  notify check limitation
    let check: NotifyLimitCheck = new NotifyLimitCheck();
    if (evt.trigger_info) {
      check.trigger_id = evt.trigger_info.id;
      check.user_id = evt.trigger_info.user_id;
    }
    check.over = false;
    check.max = 999999;
    check.count = 1;
    check.user_id = 0;
    return check;
  }

  //TODO notify statistic

}
