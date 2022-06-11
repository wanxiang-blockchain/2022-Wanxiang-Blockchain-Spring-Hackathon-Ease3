import { Injectable } from "@nestjs/common";
import { W3Logger } from "src/common/log/logger.service";
import { TriggerWorkerSupported } from "src/smart-notify-base-shared/smart-trigger-worker/trigger.worker.supported";
import { Trigger } from "src/smart-notify-base-shared/smart-trigger/trigger";

@Injectable()
export class TriggerPool {
    logger: W3Logger;

    constructor() {
        this.logger = new W3Logger('TriggerPool');
    }
    public static INSTANCE: TriggerPool;
    private triggers: Trigger[] = [];

    private triggers_dump_file: string = 'triggers_dump.txt';
    public allTriggers(): Trigger[] {
        return this.triggers;
    }

    getTriggers(worker: TriggerWorkerSupported): Trigger[] {
        let resp: Trigger[] = [];
        this.triggers.forEach(r => {
            if (r.execution.worker === worker) {
                resp.push(r);
            }
        });
        return resp;
    }

    addTriggers(triggers : Trigger[]): Number{
        let count =0;
        this.logger.log(`add all triggers ${JSON.stringify(triggers)}`)
        for (const trigger of triggers){
            if(this.addTrigger(trigger)){
                count++;
            }
        }
        this.logger.log(`add count ${count}`)
        return count;
    }

    addTrigger(trigger: Trigger): boolean {

        let trigger_id = trigger.info.id || 0;
        let trigger_hash = trigger.hash || '';
        let findExist: Trigger = null;
        if (trigger_id === 0) {
            findExist = this.triggers.find(t => t.hash === trigger_hash);
        }
        else {
            findExist = this.triggers.find(t => t.info.id === trigger_id);
        }

        if (findExist) {
            let msg = `find exist trigger trigger_id:${trigger_id} trigger_hash:${trigger_hash}`;
            this.logger.warn(msg);
            findExist = trigger;
        } else {
            this.logger.log(`new trigger trigger_id:${trigger_id}, trigger_hash:${trigger_hash}`);
            this.triggers.push(trigger);
        }
        // this.dump();
        return true;
    }
    removeTrigger(trigger_id: number, trigger_hash: string): Trigger[] {
        let result = [];
        this.logger.log(`removeTrigger trigger_id:${trigger_id} trigger_hash:${trigger_hash}`);

        let findIndex = this.triggers.findIndex(t => t.hash === trigger_hash && t.info.id === trigger_id);
        if (findIndex > -1) {
            result = this.triggers.splice(findIndex, 1);
        }
        // this.dump();
        return result;
    }

    load() {
        let fs = require('fs');
        let self = this;
        fs.readFile(self.triggers_dump_file, 'utf-8', function (err, data) {
            if (err) {
                self.logger.error(err);
            } else {
                //  console.log('load triggers_dump:',data);
                let Triggers = JSON.parse(data);
                Triggers.forEach(trigger => {
                    self.addTrigger(trigger);
                });
                self.logger.log('load triggers_dump ok');
            }
        });
    }
    dump() {
        let self = this;
        let fs = require('fs');
        let data = JSON.stringify(this.triggers);
        fs.writeFile(this.triggers_dump_file, data, function (err) {
            if (err) {
                self.logger.error(err);
            } else {
                self.logger.log('triggers_dump ok.');
            }
        });
    }
}