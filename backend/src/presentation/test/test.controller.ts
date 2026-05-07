import { Controller, Get } from '@nestjs/common';
import { OracleService } from '../../infrastructure/database/oracle/oracle.service';

@Controller()
export class TestController {
  constructor(private oracle: OracleService) {}

  @Get()
  hello() {
    return {
      message: 'Backend funcionando 🚀',
    };
  }

  @Get('db')
  async db() {
    return await this.oracle.testConnection();
  }
}