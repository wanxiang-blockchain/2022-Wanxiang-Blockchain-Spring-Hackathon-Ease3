import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { W3Logger } from "src/common/log/logger.service";
import { INotifyWorker } from "../worker";
import { StopWatch } from 'stopwatch-node';
import { NotifyEventPayload } from "src/smart-notify-base-shared/event/notify.event.payload";
import { NotifyChannelType } from "src/smart-notify-base-shared/event/notify.channel.type";
import { NotifyFormatter } from "../notify.formater";
@Injectable()
export class WebhookWorker implements INotifyWorker {

    private logger: W3Logger;
    public name: string;
    public eventEmitter: EventEmitter2;

    constructor(name: string = 'WebhookWorker') {
        this.logger = new W3Logger(name);
        this.name = name;
    }

    async process(evt: NotifyEventPayload): Promise<Number> {

        if (!evt) {
            return 0;
        }

        const axios = require('axios');
        const sw = new StopWatch('sw');
        let sendCount = 0;
        for (const notify_channel of evt.notify_channels) {
            if (notify_channel.channel_type != NotifyChannelType.WEBHOOK) {
                continue;
            }

            let target = notify_channel.target;
            let webhookMessage = NotifyFormatter.formatWebhookMessage(evt, target);

            sw.start(this.name);
            try {
                let resp = await axios.post(webhookMessage.api, webhookMessage.msg);
                this.logger.debug(resp.status);
                // console.log(resp);
                sendCount++;
            } catch (error) {
                console.log(error);
            }

        }
        sw.stop();
        sw.prettyPrint();

        return sendCount;

    }

}

