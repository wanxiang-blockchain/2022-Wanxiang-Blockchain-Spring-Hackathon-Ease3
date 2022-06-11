import { MQChannelConfig } from "src/common/mq/mq.channel.config";
import { INotifyWorker } from "../notify-worker/worker";

export class ConsumerConfig {

    channel_config: MQChannelConfig;

    worker: INotifyWorker;
}
