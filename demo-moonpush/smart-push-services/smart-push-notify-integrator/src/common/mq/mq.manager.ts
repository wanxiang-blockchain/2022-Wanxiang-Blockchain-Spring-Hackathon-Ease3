import { Injectable } from '@nestjs/common';
import { W3Logger } from 'src/common/log/logger.service';
import { AMQPChannel, AMQPClient } from '@cloudamqp/amqp-client';
import { AMQPBaseClient } from '@cloudamqp/amqp-client/types/amqp-base-client';
import { FunctionExt } from 'src/common/utility/functionExt';
import { MQChannel } from './mq.channel';
import { MQChannelConfig } from './mq.channel.config';



@Injectable()
export class MQManager {

  private logger: W3Logger;
  private mq_channels: Map<string, MQChannel> = new Map();
  private get_channel_lock_counter: number = 0;
  constructor() {
    this.logger = new W3Logger('MQManager');
  }

  async connect(config: MQChannelConfig): Promise<AMQPBaseClient> {

    try {
      this.disConnect(config);

      let url = process.env.AMQP_HOST || "amqp://localhost";
      this.logger.verbose(`mq connection[${config.identity}] to ${url}`);
      let amqp = new AMQPClient(url);
      amqp.name = config.identity;
      let mq_connection = await amqp.connect();
      this.logger.verbose(`mq connection[${config.identity}] ready`);

      return mq_connection;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async disConnect(config: MQChannelConfig) {
    try {
      if (this.mq_channels) {
        let channelExist = this.mq_channels.has(config.identity);
        if (channelExist) {
          let ch = this.mq_channels.get(config.identity);
          if (ch && !ch.channel.closed) {
            await ch.channel.close();
          }
          if (ch && ch.channel.connection && !ch.channel.connection.closed) {
            await ch.channel.connection.close();
          }
          this.mq_channels.delete(config.identity);
          this.logger.warn(`removed mq channel[${config.identity}] from pool`);

        }

        if (this.mq_channels && this.mq_channels.keys.length > 0) {
          console.log('mq_channels:');
          for (const iterator of this.mq_channels) {
            console.log(iterator[0], iterator[1].channel.id, iterator[1].channel.closed);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    finally {
    }
  }

  async getChannel(config: MQChannelConfig): Promise<MQChannel> {
    if (this.get_channel_lock_counter > 0) {
      this.logger.debug('get_channel_lock_counter sleep ');
      await FunctionExt.sleep(5000);
    };

    try {
      this.get_channel_lock_counter++;

      let find = this.mq_channels.get(config.identity);
      if (find && find.channel && !find.channel.closed) {
        this.logger.debug(`pick mq channel[${find.identity}-${find.channel.id}] from pool`);
        return find;
      }
      else {
        await this.disConnect(config);
      }

      let newChannel: AMQPChannel = await this.createChannel(config);
      if (!newChannel) {
        this.logger.error(`failed to create new mq channel[${config.identity}]`);
        throw new Error(`failed to create new mq channel[${config.identity}]`);
      }
      let newItem = { identity: config.identity, channel: newChannel };

      let find2 = this.mq_channels.get(config.identity);
      if (find2) {
        await this.disConnect(config);
      }
      this.mq_channels.set(config.identity, newItem);

      this.logger.verbose(`create new mq channel[${newItem.identity}-${newItem.channel.id}] into pool`);
      return newItem;
    } finally {
      this.get_channel_lock_counter--;
      if (this.get_channel_lock_counter < 0) {
        this.get_channel_lock_counter = 0;
      }
    }
  }

  async createChannel(config: MQChannelConfig): Promise<AMQPChannel> {

    let mq_connection = await this.connect(config);

    if (mq_connection) {
      let mq_channel = await mq_connection.channel();
      if (config.auto_create_exchange) {
        await mq_channel.exchangeDeclare(config.exchange, config.exchange_type);
      }
      if (config.auto_create_queue_and_bind) {
        await mq_channel.queueDeclare(config.queue);
        await mq_channel.queueBind(config.queue, config.exchange, config.routing_key);
      }

      return mq_channel;
    }
    return null;
  }
}
