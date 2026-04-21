import { Controller, Get } from '@nestjs/common';
import { GetSystemHealthUseCase } from '../../application/use-cases/get-system-health.use-case';
import { PingOracleUseCase } from '../../application/use-cases/ping-oracle.use-case';
import { AppService } from '../app.service';
import { SystemHealth } from '../../application/models/system-health';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly getSystemHealthUseCase: GetSystemHealthUseCase,
    private readonly pingOracleUseCase: PingOracleUseCase,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): SystemHealth {
    return this.getSystemHealthUseCase.execute();
  }

  @Get('oracle/ping')
  async pingOracle(): Promise<{ status: string; databaseVersion: string }> {
    return this.pingOracleUseCase.execute();
  }
}
