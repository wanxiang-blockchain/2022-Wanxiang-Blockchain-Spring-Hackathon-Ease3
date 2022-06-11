import { Injectable } from "@nestjs/common";
import { NotifyChannelType } from "src/smart-notify-base-shared/event/notify.channel.type";
import { WorkerManager } from "../notify-worker/worker.manager";
import { ConsumerConfig } from "./consumer.config";
@Injectable()
export class ConsumerManager {

    private consumers: ConsumerConfig[] = [];
    public get Consumers(): ConsumerConfig[] {
        return this.consumers;
    }

    constructor(private readonly workerManager: WorkerManager) {
    }
    async load(): Promise<void> {

        let identity_prefix = "Moonriver-Event-";

        let consume_array = [
            {
                channel_type: NotifyChannelType.WEBHOOK,

            },
            {
                channel_type: NotifyChannelType.EMAIL,

            },
            {
                channel_type: NotifyChannelType.TELEGRAM,
            }
        ]


        for (const c of consume_array) {
            let identity = identity_prefix + c.channel_type;
            this.consumers.push({
                channel_config: {
                    identity: identity,
                    exchange: identity,
                    routing_key: identity,
                    exchange_type: 'direct',
                    queue: identity,
                    auto_create_exchange: true,
                    auto_create_queue_and_bind: true
                },
                worker: await this.workerManager.getWorker(c.channel_type, 'Notify-' + c.channel_type)
            })
        }

    }
}