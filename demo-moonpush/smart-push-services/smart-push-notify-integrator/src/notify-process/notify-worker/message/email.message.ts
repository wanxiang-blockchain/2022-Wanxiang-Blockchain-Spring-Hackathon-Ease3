import { ApiProperty } from "@nestjs/swagger";

export class EmailMessage {
    @ApiProperty()
    email: string;

    @ApiProperty()
    subject: string;

    @ApiProperty()
    html: string;


}