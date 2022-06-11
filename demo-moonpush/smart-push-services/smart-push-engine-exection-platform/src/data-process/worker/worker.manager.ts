import { Injectable } from "@nestjs/common";
import { BlockWorker } from "./implement/block.worker";
import { DefaultWorker } from "./implement/default.worker";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BlockExtrinsicWorker } from "./implement/blockextrinsic.worker";
import { TriggerWorkerSupported } from "src/smart-notify-base-shared/smart-trigger-worker/trigger.worker.supported";
import { ITriggerWorker } from "./trigger.worker";



@Injectable()
export class WorkerManager {

    constructor(private eventEmitter: EventEmitter2) {
    }

    async getWorker(worker: TriggerWorkerSupported, name: string): Promise<ITriggerWorker> {

        let workerInstance: ITriggerWorker;
        switch (worker) {
            case TriggerWorkerSupported.BLOCK:
                workerInstance = new BlockWorker(name, worker);
                break;
            case TriggerWorkerSupported.EXTRINSIC:
                workerInstance = new BlockExtrinsicWorker(name, worker);
                break;
            default:
                workerInstance = new DefaultWorker(name, worker);
                break;
        }

        workerInstance.eventEmitter = this.eventEmitter;
        return workerInstance;
    }
}