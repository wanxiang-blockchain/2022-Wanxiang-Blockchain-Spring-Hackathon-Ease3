export class AppConfig {

  public static postgresConnection = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: process.env.POSTGRES_SYNCHRONIZE || false,
    logging: process.env.POSTGRES_LOGGING || false,
  }

  public static typeOrmOption4SmartNotifyDB = {
    ...this.postgresConnection,
    database: process.env.POSTGRES_DATABASE,
  };

  public static initilize() {
    console.log(AppConfig);
  }

}

