import { Controller, Get } from '@nestjs/common';
import { CompatibilityService } from './compatibility.service';
@Controller('compatibility/profiles') export class CompatibilityController {constructor(private readonly service:CompatibilityService){} @Get() list(){return this.service.list();}}
