import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { DatabaseGateway, DatabasePingResult, DatabaseStatus } from '../../domain/ports/database-gateway.port';

@Injectable()
export class OracleService implements DatabaseGateway, OnModuleDestroy {
  private pool: oracledb.Pool | null = null;

  private get user(): string {
    return process.env.ORACLE_USER ?? 'gestionfisei';
  }

  private get password(): string {
    return process.env.ORACLE_PASSWORD ?? 'gestionfisei';
  }

  private get connectionString(): string {
    return process.env.ORACLE_CONNECTION_STRING ?? 'localhost/XEPDB1';
  }

  getStatus(): DatabaseStatus {
    return {
      user: this.user,
      connectionString: this.connectionString,
      thin: true,
    };
  }

  private async getPool(): Promise<oracledb.Pool> {
    if (!this.pool) {
      this.pool = await oracledb.createPool({
        user: this.user,
        password: this.password,
        connectionString: this.connectionString,
        poolMin: 0,
        poolMax: 4,
        poolIncrement: 1,
      });
    }

    return this.pool;
  }

  async ping(): Promise<DatabasePingResult> {
    const pool = await this.getPool();
    const connection = await pool.getConnection();

    try {
      await connection.execute('SELECT 1 AS ok FROM dual');

      return {
        ok: true,
        databaseVersion: 'Oracle connection OK',
      };
    } finally {
      await connection.close();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.close(0);
      this.pool = null;
    }
  }
}
