import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { GetSystemHealthUseCase } from './use-cases/get-system-health.use-case';
import { PingOracleUseCase } from './use-cases/ping-oracle.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [GetSystemHealthUseCase, PingOracleUseCase],
  exports: [GetSystemHealthUseCase, PingOracleUseCase],
})
export class ApplicationModule {}
