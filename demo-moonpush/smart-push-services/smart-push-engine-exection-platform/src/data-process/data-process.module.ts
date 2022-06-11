import { CacheModule, Module } from '@nestjs/common';
import { DataProcessController } from './data-process.controller';
import { DataProcessService } from './data-process.service';
import { MQManager } from '../common/mq/mq.manager';
import { ConsumerManager } from './consumer/consumer.manager';
import { WorkerManager } from './worker/worker.manager';
import { TriggerPool } from './trigger-ppol/trigger.pool';
import { TriggerController } from './trigger.controller';
import { DataProcessInit } from './producer/data.process.init';


@Module({
  imports: [CacheModule.register()],
  controllers: [DataProcessController, TriggerController],
  providers: [MQManager,
    ConsumerManager,
    TriggerPool,
    WorkerManager,
    DataProcessService,
    DataProcessInit],
  exports: []
})
export class DataProcessModule { }
