import { MQChannelConfig } from "src/common/mq/mq.channel.config";
import { ITriggerWorker } from "../worker/trigger.worker";


export class ConsumerConfig {

    channel_config: MQChannelConfig;

    worker: ITriggerWorker;
}
