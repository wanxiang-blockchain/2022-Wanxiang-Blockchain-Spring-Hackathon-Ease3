import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { W3Logger } from "src/common/log/logger.service";
import { SandboxService } from "src/common/sandbox/sandbox.service";
import { StopWatch } from 'stopwatch-node';
import { NotifyEventPayload } from "src/smart-notify-base-shared/event/notify.event.payload";
import { TriggerWorkerSupported } from "src/smart-notify-base-shared/smart-trigger-worker/trigger.worker.supported";
import { ITriggerWorker } from "../trigger.worker";
import { TriggerPool } from "src/data-process/trigger-ppol/trigger.pool";
import { timestamp } from "rxjs";

@Injectable()
export class BlockWorker implements ITriggerWorker {

    protected logger: W3Logger;
    public name: string;
    public eventEmitter: EventEmitter2;
    public worker: TriggerWorkerSupported;

    constructor(name: string = 'BlockWorker', worker: TriggerWorkerSupported = TriggerWorkerSupported.BLOCK) {
        this.logger = new W3Logger(name);
        this.name = name;
        this.worker = worker;
    }

    async process(msg: string): Promise<any> {

        // this.logger.debug(msg);
        let triggers = TriggerPool.INSTANCE.getTriggers(this.worker);

        if (!triggers || triggers.length == 0) {
            this.logger.warn(`empty triggers for [${this.worker.toString()}], just ignore`);
            return 0;
        }
        this.logger.debug(`get ${triggers.length} triggers`);

        const sw = new StopWatch('sw' + this.name);
        sw.start(this.name);
        for (const trigger of triggers) {
            // await FunctionExt.sleep(1000);
            this.logger.debug(`trigger:${trigger.info.name}`);

            let runResult = SandboxService.run(JSON.parse(msg), trigger.hash, trigger.execution.script, trigger.execution.trigger_parameter);
            //this.logger.debug(`SandboxService.run result ${JSON.stringify(runResult)}`);
            if (runResult && runResult.matched === true) {
                this.logger.warn(`matched trigger:${trigger.info.name}`);
                let evt_timestamp = new Date();
                let payload: NotifyEventPayload = {
                    timestamp: evt_timestamp,
                    nonce: evt_timestamp.getTime().toString(),
                    notify_channels: trigger.notify_channels,
                    trigger_info: {
                        ...trigger.info
                    },
                    trigger_parameter: trigger.execution.trigger_parameter,
                    data: {
                        matched: runResult.matched,
                        result: runResult.result
                    }
                }

                this.eventEmitter.emit(
                    'worker.event',
                    payload
                );

                if (process.env.DUMP_MESSAGE_WHEN_TRIGGER && process.env.DUMP_MESSAGE_WHEN_TRIGGER.toLowerCase() === 'true') {
                    this.dump(msg, 'dump/dump_' + (trigger.info.id || '') + '_' + trigger.hash + '_' + payload.timestamp.getTime() + '.json');
                }
            }
        }
        sw.stop();
        sw.prettyPrint();

        return 0;
    }
    dump(data, dum_file_name) {
        let fs = require('fs');
        fs.writeFile(dum_file_name, data, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('dump ok.');
            }
        });
    }
}

