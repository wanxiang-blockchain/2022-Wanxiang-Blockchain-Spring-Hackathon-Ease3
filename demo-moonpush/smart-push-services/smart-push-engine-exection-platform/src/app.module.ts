import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StatusMonitorModule } from 'nestjs-status-monitor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DataProcessModule } from './data-process/data-process.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    StatusMonitorModule.forRoot(),
    ScheduleModule.forRoot(),
    DataProcessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
