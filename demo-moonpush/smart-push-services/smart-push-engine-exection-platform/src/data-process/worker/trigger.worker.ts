
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TriggerWorkerSupported } from "src/smart-notify-base-shared/smart-trigger-worker/trigger.worker.supported";

export interface ITriggerWorker {
    name: string;
    eventEmitter: EventEmitter2;
    worker: TriggerWorkerSupported;
    
    process(msg: string): Promise<any>;

}