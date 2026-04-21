import { Module } from '@nestjs/common';
import { DATABASE_GATEWAY } from '../../domain/ports/database-gateway.port';
import { OracleService } from './oracle.service';

@Module({
  providers: [
    OracleService,
    {
      provide: DATABASE_GATEWAY,
      useExisting: OracleService,
    },
  ],
  exports: [DATABASE_GATEWAY],
})
export class OracleModule {}
