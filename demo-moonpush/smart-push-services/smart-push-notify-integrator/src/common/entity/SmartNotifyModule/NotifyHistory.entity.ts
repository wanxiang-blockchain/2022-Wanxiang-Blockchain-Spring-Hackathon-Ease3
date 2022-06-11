import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['id'])
export class NotifyHistory {
    @ApiProperty()
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ApiProperty()
    @Column({ type: 'bigint', comment: 'the id refer to SmartTrigger.id' })
    trigger_id: number;

    @ApiProperty()
    @Column({ comment: 'the type of trigger such as : wallet-monitor, gas, etc.', default: '' })
    trigger_type: string = "";

    @ApiProperty()
    @Column({ type: 'bigint', comment: 'the id refer to SmartTriggerNotifyChannelParameter.id' })
    notify_channel_id: number;

    @ApiProperty()
    @Column({ comment: 'nonce of trigger event, the same nonce means the same event', default: '' })
    nonce: string = "";

    @ApiProperty()
    @Column({ comment: 'the content of json string' })
    content: string = "";


    @ApiProperty()
    @Column({ comment: 'the chain name , such as: moonriver', nullable: true })
    chain: string;

    @ApiProperty()
    @Column({ comment: 'block_number', nullable: true })
    block_number: number;

    @ApiProperty()
    @Column({ comment: 'transaction', nullable: true })
    tx: string;

    @ApiProperty()
    @Column({ type: 'timestamp without time zone', comment: 'creatd time', default: '2022-01-01' })
    created_time: Date;


    @ApiProperty()
    @Column({ type: 'bigint', nullable: true })
    user_id: number;
}