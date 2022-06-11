import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { W3Logger } from "src/common/log/logger.service";
import { MQChannel } from "src/common/mq/mq.channel";
import { MQChannelConfig } from "src/common/mq/mq.channel.config";
import { MQManager } from "src/common/mq/mq.manager";
import { SyncTriggerRequest } from "src/smart-notify-base-shared/smart-trigger-sync/trigger.sync";


@Injectable()
export class DataProcessInit implements OnApplicationBootstrap {

    private logger: W3Logger;
    constructor(private readonly mqManager: MQManager) {
        this.logger = new W3Logger("DataProcessInit");
    }

    // do something when app starts
    onApplicationBootstrap() {
        // send trigger sync message to rabbitmq
        this.sendSyncMsg()
    }

    async sendSyncMsg(): Promise<any> {
        this.logger.log("send sync trigger info message to rabbitmq");
        let mqConfig = this.getMQChannelConfig();
        this.logger.debug(`identity:${mqConfig.identity}`);

        try {
            let mq_channel: MQChannel = await this.mqManager.getChannel(mqConfig);
            let data = JSON.stringify(this.getSyncMessage());
            let confirmed = await mq_channel.channel.basicPublish(mqConfig.exchange, mqConfig.routing_key, data);

            this.logger.debug(`publish confirmed:${confirmed}, identity:${mqConfig.identity}`);
            return true;
        } catch (error) {
            console.error(error);
            console.error(error.code);
            this.logger.error("transferData error");
            await this.mqManager.disConnect(mqConfig);
            return false;
        }
    }

    getSyncMessage(): SyncTriggerRequest {
        let request = new SyncTriggerRequest();
        request.timestamp = new Date();
        request.enabled = true;
        return request;
    }


    getMQChannelConfig(): MQChannelConfig {
        let identity = 'Trigger-Info-sync';
        return {
            exchange: identity,
            routing_key: identity,
            exchange_type: 'direct',
            identity: identity,
            auto_create_exchange: true,
            queue: identity,
            auto_create_queue_and_bind: true
        }
    }
}