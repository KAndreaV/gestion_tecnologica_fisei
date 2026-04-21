import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_GATEWAY } from '../../domain/ports/database-gateway.port';
import type { DatabaseGateway } from '../../domain/ports/database-gateway.port';

@Injectable()
export class PingOracleUseCase {
  constructor(@Inject(DATABASE_GATEWAY) private readonly databaseGateway: DatabaseGateway) {}

  async execute(): Promise<{ status: string; databaseVersion: string }> {
    const result = await this.databaseGateway.ping();

    return {
      status: result.ok ? 'ok' : 'error',
      databaseVersion: result.databaseVersion,
    };
  }
}
