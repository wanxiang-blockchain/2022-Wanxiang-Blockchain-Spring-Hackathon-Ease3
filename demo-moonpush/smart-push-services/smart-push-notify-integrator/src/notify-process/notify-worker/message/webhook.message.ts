import { ApiProperty } from "@nestjs/swagger";

export class WebhookMessage {
    @ApiProperty({ default: 'web3go-notify' })
    api: string;

    @ApiProperty({ default: {} })
    msg: any;
}