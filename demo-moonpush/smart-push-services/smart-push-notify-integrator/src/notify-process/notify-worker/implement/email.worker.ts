import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { W3Logger } from "src/common/log/logger.service";
import { INotifyWorker } from "../worker";
import { StopWatch } from 'stopwatch-node';
import { WebhookMessage } from "src/notify-process/notify-worker/message/webhook.message";
import { NotifyEventPayload } from "src/smart-notify-base-shared/event/notify.event.payload";
import { NotifyChannelType } from "src/smart-notify-base-shared/event/notify.channel.type";
import { Mailer } from "src/common/email-support/mailer";
import { NotifyFormatter } from "../notify.formater";
@Injectable()
export class EmailWorker implements INotifyWorker {

    private logger: W3Logger;
    public name: string;
    public eventEmitter: EventEmitter2;

    constructor(name: string = 'EmailWorker') {
        this.logger = new W3Logger(name);
        this.name = name;
    }

    async process(evt: NotifyEventPayload): Promise<Number> {

        if (!evt) {
            return 0;
        }

        const sw = new StopWatch('sw');
        let sendCount = 0;
        for (const notify_channel of evt.notify_channels) {
            if (notify_channel.channel_type != NotifyChannelType.EMAIL) {
                continue;
            }

            let target = notify_channel.target;
            let emailObj = NotifyFormatter.formatEmailMessage(evt, target);

            sw.start(this.name);
            try {
                let send_result = await this.sendEmail(emailObj.email, emailObj.subject, emailObj.html);
                if (send_result) {
                    this.logger.debug(`send email success`);
                } else {
                    this.logger.error(`send email failed`);
                }
                sendCount++;
            } catch (error) {
                console.log(error);

            }

        }
        sw.stop();
        sw.prettyPrint();
        return sendCount;

    }

    async sendEmail(email: string, subject: string, html: string): Promise<boolean> {
        let mailer = new Mailer();
        await mailer.send({
            to: email,
            subject: subject,
            html: html
        });
        return true;
    }
}

