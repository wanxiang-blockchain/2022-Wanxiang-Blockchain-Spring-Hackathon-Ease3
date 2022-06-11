import { ApiProperty } from "@nestjs/swagger";

export class TelegramBotMessage {
    @ApiProperty()
    bot_token: string;

    @ApiProperty()
    chat_id: string;

    @ApiProperty()
    text: string;

    @ApiProperty()
    parse_mode: string = 'HTML';
}