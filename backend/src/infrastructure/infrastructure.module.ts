import { Module } from '@nestjs/common';
import { OracleModule } from './oracle/oracle.module';

@Module({
  imports: [OracleModule],
  exports: [OracleModule],
})
export class InfrastructureModule {}
