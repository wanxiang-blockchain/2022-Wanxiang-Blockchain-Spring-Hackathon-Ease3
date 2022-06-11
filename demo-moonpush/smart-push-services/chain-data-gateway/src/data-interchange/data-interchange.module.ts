import { Module, CacheModule } from '@nestjs/common';
import { DataInterchangeController } from './data-interchange.controller';
import { DataInterchangeService } from './data-interchange.service';
import { MQManager } from '../common/mq/mq.manager';


@Module({
  imports: [CacheModule.register({
    ttl: 30
  })],
  controllers: [DataInterchangeController],
  providers: [MQManager, DataInterchangeService],
  exports: []
})
export class DataInterchangeModule { }
