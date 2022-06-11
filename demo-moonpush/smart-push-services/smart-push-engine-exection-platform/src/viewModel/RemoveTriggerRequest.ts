import { ApiProperty } from "@nestjs/swagger";

export class RemoveTriggerRequest {

    @ApiProperty()
    trigger_id: number;

    @ApiProperty()
    trigger_hash: string;
}