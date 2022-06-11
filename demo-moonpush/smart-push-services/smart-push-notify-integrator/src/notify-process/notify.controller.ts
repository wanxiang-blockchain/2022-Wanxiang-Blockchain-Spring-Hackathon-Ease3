import { CacheTTL } from '@nestjs/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotifyService } from './notify.service';

@ApiTags('notify')
@Controller('api/v1/')
export class NotifyController {
  constructor(private readonly service: NotifyService) { }


}


