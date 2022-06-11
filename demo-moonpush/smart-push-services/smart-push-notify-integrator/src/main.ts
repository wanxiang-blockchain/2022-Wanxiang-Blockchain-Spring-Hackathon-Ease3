import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfig } from './common/setting/appConfig';

async function bootstrap() {
  if (process.env) {
    console.log(`process.env:`, process.env);
  }
  AppConfig.initilize();
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose', 'log']
  });
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('notify-service')
    .setDescription('')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, document);
  await app.listen(process.env.PORT || 30000);
}
bootstrap();

