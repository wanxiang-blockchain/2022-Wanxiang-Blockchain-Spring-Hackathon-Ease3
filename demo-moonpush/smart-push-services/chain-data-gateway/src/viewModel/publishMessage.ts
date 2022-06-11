import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";

export class PublishMessage {
    @ApiProperty({ description: 'data entities', default: [{ a: 1 }, { b: 2 }] })
    data: object[];

    @ApiProperty({ description: 'data routing key to match the target exchange. refer to PublishMessageKey. such as: block, extrinsic', default: 'test' })
    key: string;

    @ApiProperty({ description: 'chain name , such as:  Moonriver', default: 'test' })
    chain: string;
}


export enum PublishMessageKey {
    BLOCK = 'block',
    EXTRINSIC = 'extrinsic'
}