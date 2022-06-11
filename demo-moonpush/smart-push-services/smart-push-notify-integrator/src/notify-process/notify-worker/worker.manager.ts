import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NotifyChannelType } from "src/smart-notify-base-shared/event/notify.channel.type";
import { EmailWorker } from "./implement/email.worker";
import { TelegramBotWorker } from "./implement/telegram.bot.worker";
import { WebhookWorker } from "./implement/webhook.worker";
import { INotifyWorker } from "./worker";

@Injectable()
export class WorkerManager {

    constructor(private eventEmitter: EventEmitter2) {
    }

    async getWorker(notify_channel_type: NotifyChannelType, name: string): Promise<INotifyWorker> {

        let workerInstance: INotifyWorker;
        switch (notify_channel_type) {
            case NotifyChannelType.WEBHOOK:
                workerInstance = new WebhookWorker(name);
                break;

            case NotifyChannelType.EMAIL:
                workerInstance = new EmailWorker(name);
                break;
            case NotifyChannelType.TELEGRAM:
                workerInstance = new TelegramBotWorker(name);
                break;


            default:
                throw new Error("unsupported worker");
        }

        workerInstance.eventEmitter = this.eventEmitter;
        return workerInstance;
    }
}