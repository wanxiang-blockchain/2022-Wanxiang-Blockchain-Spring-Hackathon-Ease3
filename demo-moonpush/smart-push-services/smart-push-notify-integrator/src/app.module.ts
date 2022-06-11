import { Module } from '@nestjs/common';
import { StatusMonitorModule } from 'nestjs-status-monitor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { NotifyModule } from './notify-process/notify.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(), StatusMonitorModule.forRoot(),
    ScheduleModule.forRoot(),
    NotifyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
