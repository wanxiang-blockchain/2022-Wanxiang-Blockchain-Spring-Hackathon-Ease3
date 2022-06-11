import { Connection } from 'typeorm';
import { RepositoryConsts } from '../repositoryConsts';
import { NotifyHistory } from 'src/common/entity/SmartNotifyModule/NotifyHistory.entity';


export const repositoryProviders_smart_notify = [

  {
    provide: RepositoryConsts.SMART_NOTIFY_NOTIFY_HISTORY_REPOSITORY,
    useFactory: (connection: Connection) => {
      return connection.getRepository(NotifyHistory);
    },
    inject: [RepositoryConsts.DATABASE_CONNECTION_SMART_NOTIFY],
  },

]; 