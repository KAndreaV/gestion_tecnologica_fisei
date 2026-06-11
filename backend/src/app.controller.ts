import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly dataSource: DataSource) {}

  @Get()
  getHome(): object {
    return this.appService.getHome();
  }

  @Get('health')
  getHealth(): object {
    return this.appService.getHealth();
}
