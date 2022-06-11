
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NotifyEventPayload } from "src/smart-notify-base-shared/event/notify.event.payload";

export interface INotifyWorker {
    name: string;
    eventEmitter: EventEmitter2;

    process(evt: NotifyEventPayload): Promise<Number>;

}