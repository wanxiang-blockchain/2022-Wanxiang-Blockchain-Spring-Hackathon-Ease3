import { createConnection } from 'typeorm';
import { join } from 'path';
import { RepositoryConsts } from '../repositoryConsts';
import { AppConfig } from '../../setting/appConfig';

export const databaseProviders_smart_notify = [
  {
    provide: RepositoryConsts.DATABASE_CONNECTION_SMART_NOTIFY,
    useFactory: async () => {
      let connectionOption: any = {
        ...AppConfig.typeOrmOption4SmartNotifyDB,
        entities: [
          join(
            __dirname,
            '../..',
            'entity',
            'SmartNotifyModule',
            '*.{js,ts}',
          )
        ],
      };
      return await createConnection(connectionOption);
    },
  },
];
