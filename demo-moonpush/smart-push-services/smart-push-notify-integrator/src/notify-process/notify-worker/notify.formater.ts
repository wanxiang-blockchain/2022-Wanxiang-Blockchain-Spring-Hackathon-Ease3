import { NotifyEventPayload } from "src/smart-notify-base-shared/event/notify.event.payload";
import { WebhookMessage } from "src/notify-process/notify-worker/message/webhook.message";
import { EmailMessage } from "./message/email.message";
import { TelegramBotMessage } from "./message/telegram.bot.message";

export class NotifyFormatter {

    static formatWebhookMessage(evt: NotifyEventPayload, target: Object): WebhookMessage {
        let content = '';
        let api = '';
        if (target) {
            api = (target as any).api || '';
            content = (target as any).format_content || '';
            if (content && evt.data.result && typeof evt.data.result === 'object') {
                let d = evt.data.result;
                for (const x in d) {
                    let reg = new RegExp("\\${" + x + "}", "g");
                    content = content.replace(reg, d[x]);
                }
            }
        }
        let webhookMessage: WebhookMessage = {
            api: api,
            msg: content ? content : evt
        }
        return webhookMessage;
    }

    static formatEmailMessage(evt: NotifyEventPayload, target: object): EmailMessage {
        let subject = `[${evt.trigger_info.chain}] ${evt.trigger_info.name} ${evt.timestamp}`;

        let email = (target as any).email || '';

        let html = (target as any).format_content || '';
        if (evt.data.result && typeof evt.data.result === 'object') {
            if (html) {
                let d = evt.data.result;
                for (const x in d) {
                    let reg = new RegExp("\\${" + x + "}", "g");
                    html = html.replace(reg, d[x]);
                }
            } else {
                let d = evt.data.result;
                for (var p in d) {
                    html += p + ':' + d[p];
                    html += '<br>';
                }
            }
        }

        return {
            subject,
            email,
            html
        }
    }

    static formatTelegramBotMessage(evt: NotifyEventPayload, target: object): TelegramBotMessage {

        let bot_token = (target as any).bot_token || '';
        let chat_id = (target as any).chat_id || '';
        let parse_mode = (target as any).parse_mode || 'HTML';

        let text = ``;

        let content = (target as any).format_content || '';
        if (evt.data.result && typeof evt.data.result === 'object') {
            if (content) {
                let d = evt.data.result;
                for (const x in d) {
                    let reg = new RegExp("\\${" + x + "}", "g");
                    content = content.replace(reg, d[x]);
                }
            } else {
                let d = evt.data.result;
                for (var p in d) {
                    content += `${p}: ${d[p]}`;
                    content += '\n';
                }
            }
        }
        text += content;

        return {
            bot_token: bot_token,
            chat_id: chat_id,
            text: text,
            parse_mode: parse_mode
        }
    }
}