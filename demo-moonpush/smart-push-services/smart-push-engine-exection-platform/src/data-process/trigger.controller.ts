import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Trigger } from 'src/smart-notify-base-shared/smart-trigger/trigger';
import { TriggerBuilder, TriggerBuildRequest } from 'src/smart-notify-base-shared/smart-trigger/trigger.builder';
import { RemoveTriggerRequest } from 'src/viewModel/RemoveTriggerRequest';

import { TriggerPool } from './trigger-ppol/trigger.pool';

@ApiTags('trigger')
@Controller('api/v1/trigger')
export class TriggerController {
  constructor() { }


  @Get('/getTriggers')
  @ApiOperation({ summary: 'get all triggers which are active' })
  async getTriggers(
  ): Promise<Trigger[]> {
    let allTriggers = TriggerPool.INSTANCE.allTriggers();
    return allTriggers;
  }


  @Post('/loadTrigger')
  @ApiOperation({ summary: 'load full trigger data when started from manage service' })
  async loadTrigger(@Body() request: Trigger[]): Promise<any> {
    try {
      return TriggerPool.INSTANCE.addTriggers(request);
    } catch (error) {
      console.log(error)
      throw new BadRequestException(error.message)
    }
  }

  @Post('/publishTrigger')
  @ApiOperation({ summary: 'receieve the full trigger data from external manage service' })
  async publishTrigger(
    @Body() request: Trigger
  ): Promise<any> {
    try {
      return TriggerPool.INSTANCE.addTrigger(request);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Post('/removeTrigger')
  @ApiOperation({ summary: 'remove the specified trigger by the trigger_id and trigger_hash' })
  async removeTrigger(
    @Body() request: RemoveTriggerRequest
  ): Promise<any> {
    return TriggerPool.INSTANCE.removeTrigger(request.trigger_id, request.trigger_hash);
  }

}


