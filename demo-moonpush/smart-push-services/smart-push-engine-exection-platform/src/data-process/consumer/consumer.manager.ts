import { Injectable } from "@nestjs/common"; 
import { TriggerWorkerSupported } from "src/smart-notify-base-shared/smart-trigger-worker/trigger.worker.supported";
import { WorkerManager } from "../worker/worker.manager"; 
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
        this.consumers = [{
            channel_config: {
                identity: "consumer-Moonriver-block-simple-worker",
                exchange: 'Moonriver-block',
                exchange_type: 'direct',
                queue: 'Moonriver-block-simple',
                routing_key: 'Moonriver-block',
                auto_create_exchange: false,
                auto_create_queue_and_bind: true
            },
            worker: await this.workerManager.getWorker(TriggerWorkerSupported.BLOCK, 'consumer-Moonriver-block-simple-worker')
        },
        {
            channel_config: {
                identity: "consumer-Moonriver-extrinsic-simple-worker",
                exchange: 'Moonriver-extrinsic',
                exchange_type: 'direct',
                queue: 'Moonriver-extrinsic-simple',
                routing_key: 'Moonriver-extrinsic',
                auto_create_exchange: false,
                auto_create_queue_and_bind: true
            },
            worker: await this.workerManager.getWorker(TriggerWorkerSupported.EXTRINSIC, 'consumer-Moonriver-extrinsic-simple-worker')
        }
        ];
    }
}