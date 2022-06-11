import { Injectable } from "@nestjs/common";
import { W3Logger } from "src/common/log/logger.service";
import { EventEmitter2 } from "eventemitter2";
import { TriggerWorkerSupported } from "src/smart-notify-base-shared/smart-trigger-worker/trigger.worker.supported";
import { ITriggerWorker } from "../trigger.worker";


@Injectable()
export class DefaultWorker implements ITriggerWorker {
    private logger: W3Logger;
    public name: string;
    public eventEmitter: EventEmitter2;
    public worker: TriggerWorkerSupported;

    constructor(name: string = 'DefaultWorker', worker: TriggerWorkerSupported = TriggerWorkerSupported.DEFAULT) {
        this.logger = new W3Logger(name);
        this.name = name;
        this.worker = worker;
    }

    async process(msg: string): Promise<any> {
        this.logger.log('[DEFAULT]' + msg);
        return 0;
    }




}