import { AMQPChannel } from "@cloudamqp/amqp-client";

export class MQChannel {
    identity: string;
    channel: AMQPChannel;
}