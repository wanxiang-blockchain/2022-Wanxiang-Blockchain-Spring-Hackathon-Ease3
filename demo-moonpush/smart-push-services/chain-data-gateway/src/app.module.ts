import { Module } from '@nestjs/common';
import { StatusMonitorModule } from 'nestjs-status-monitor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DataInterchangeModule } from './data-interchange/data-interchange.module';

@Module({
  imports: [
    StatusMonitorModule.forRoot(),
    ScheduleModule.forRoot(),
    DataInterchangeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
