export class MQChannelConfig {
    identity: string;
    exchange: string;
    routing_key: string;
    exchange_type: string = 'direct';
    queue: string;
    auto_create_exchange: boolean;
    auto_create_queue_and_bind: boolean;
}