import { Body, CacheTTL, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublishMessage } from 'src/viewModel/publishMessage';
import { DataInterchangeService } from './data-interchange.service';

@ApiTags('data-interchange')
@Controller('api/v1/')
export class DataInterchangeController {
  constructor(private readonly service: DataInterchangeService) { }

  @CacheTTL(0)
  @Post('/publish_data')
  @ApiOperation({ summary: '' })
  publish_data(
    @Body() request: PublishMessage,
  ): Promise<any> {
    // console.log(request);
    return this.service.transferData(request);

  }
}


