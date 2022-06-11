import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataProcessService } from './data-process.service';

@ApiTags('data-process')
@Controller('api/v1/')
export class DataProcessController {
  constructor(private readonly service: DataProcessService) { }


  @Post('/start')
  @ApiOperation({ summary: 'start the data process' })
  start(
  ): Promise<void> {
    return this.service.start();
  }

  @Post('/stop')
  @ApiOperation({ summary: 'stop the data process' })
  stop(
  ): Promise<void> {
    return this.service.stop();
  }
}


