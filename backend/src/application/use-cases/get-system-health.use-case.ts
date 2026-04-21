import { Injectable } from '@nestjs/common';
import { SystemHealth } from '../models/system-health';
import { DATABASE_GATEWAY } from '../../domain/ports/database-gateway.port';
import type { DatabaseGateway } from '../../domain/ports/database-gateway.port';
import { Inject } from '@nestjs/common';

@Injectable()
export class GetSystemHealthUseCase {
  constructor(@Inject(DATABASE_GATEWAY) private readonly databaseGateway: DatabaseGateway) {}

  execute(): SystemHealth {
    return {
      status: 'ok',
      service: 'backend-gestion-tecnologica-fisei',
      oracle: this.databaseGateway.getStatus(),
    };
  }
}
