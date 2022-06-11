import { Injectable } from '@nestjs/common';
import { W3Logger } from 'src/common/log/logger.service';
import { MQChannel } from 'src/common/mq/mq.channel';
import { MQChannelConfig } from 'src/common/mq/mq.channel.config';
import { PublishMessage } from 'src/viewModel/publishMessage';
import { MQManager } from '../common/mq/mq.manager';

@Injectable()
export class DataInterchangeService {
  private logger: W3Logger;

  constructor(private readonly mqManager: MQManager) {
    this.logger = new W3Logger('DataInterchangeService');
  }


  async transferData(request: PublishMessage): Promise<boolean> {
    let mqConfig = this.getMQChannelConfig(request);
    this.logger.debug(`identity:${mqConfig.identity}`);

    try {
      let mq_channel: MQChannel = await this.mqManager.getChannel(mqConfig);
      let data = JSON.stringify(request);
      let confirmed = await mq_channel.channel.basicPublish(mqConfig.exchange, mqConfig.routing_key, data);

      let block_number = '';
      if (request && request.data && request.data.length > 0 && request.data[0]["block_number"]) {
        block_number = request.data[0]["block_number"];
      }
      this.logger.debug(`publish confirmed:${confirmed}, identity:${mqConfig.identity} block_number:${block_number}`);
      return true;
    } catch (error) {
      console.error(error);
      console.error(error.code);
      this.logger.error("transferData error");
      //if (error.code && error.code == 'ERR_STREAM_DESTROYED') {
      await this.mqManager.disConnect(mqConfig);
      //}
      return false;
    }
  }
  getMQChannelConfig(request: PublishMessage): MQChannelConfig {
    let exchange = request.chain + '-' + request.key;
    let routing_key = request.chain + '-' + request.key;
    return {
      exchange: exchange,
      routing_key: routing_key,
      exchange_type: 'direct',
      identity: 'producer-' + exchange,
      auto_create_exchange: true,
      queue: exchange,
      auto_create_queue_and_bind: false
    }
  }

}
