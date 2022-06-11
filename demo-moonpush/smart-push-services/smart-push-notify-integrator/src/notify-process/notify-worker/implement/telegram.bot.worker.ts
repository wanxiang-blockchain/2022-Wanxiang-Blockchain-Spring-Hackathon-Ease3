import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { W3Logger } from "src/common/log/logger.service";
import { INotifyWorker } from "../worker";
import { StopWatch } from 'stopwatch-node';
import { NotifyEventPayload } from "src/smart-notify-base-shared/event/notify.event.payload";
import { NotifyChannelType } from "src/smart-notify-base-shared/event/notify.channel.type";
import { NotifyFormatter } from "../notify.formater";

@Injectable()
export class TelegramBotWorker implements INotifyWorker {

    private logger: W3Logger;
    public name: string;
    public eventEmitter: EventEmitter2;

    constructor(name: string = 'TelegramBotWorker') {
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
            if (notify_channel.channel_type != NotifyChannelType.TELEGRAM) {
                continue;
            }
            let target = notify_channel.target;
            let tg_message = NotifyFormatter.formatTelegramBotMessage(evt, target);

            console.log('tg_message:', tg_message);

            sw.start(this.name);
            try {
                const { TelegramClient } = require('messaging-api-telegram');
                const client = new TelegramClient({
                    accessToken: tg_message.bot_token,
                });
                const response = await client.sendMessage(tg_message.chat_id, tg_message.text, {
                    parseMode: tg_message.parse_mode
                });
                console.log('tg_message response:', response);
                this.logger.debug(response);
                sendCount++;
            } catch (error) {
                console.log(error);
            }

        }
        sw.stop();
        sw.prettyPrint();
        console.log('tg_message sendCount:', sendCount);
        return sendCount;

    }

}

