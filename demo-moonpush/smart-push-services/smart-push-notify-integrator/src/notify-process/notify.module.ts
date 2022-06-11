import { Module, CacheModule } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { MQManager } from '../common/mq/mq.manager';
import { ConsumerManager } from './consumer/consumer.manager';
import { WorkerManager } from './notify-worker/worker.manager';
import { databaseProviders_smart_notify } from 'src/common/orm/database.providers.v2';
import { repositoryProviders_smart_notify } from 'src/common/orm/repository.providers.v2';

@Module({
  imports: [CacheModule.register()],
  controllers: [NotifyController],
  providers: [
    ...databaseProviders_smart_notify,
    ...repositoryProviders_smart_notify,
    MQManager,
    ConsumerManager,
    WorkerManager, NotifyService,
  ],
  exports: []
})
export class NotifyModule { } 
