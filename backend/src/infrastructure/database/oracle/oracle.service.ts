import { Injectable, OnModuleInit } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { ConfigService } from '@nestjs/config';
import type { Pool } from 'oracledb';

@Injectable()
export class OracleService implements OnModuleInit {
  private pool: any;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    oracledb.initOracleClient({
      libDir: this.config.get<string>('ORACLE_CLIENT_LIB_DIR'),
    });

    this.pool = await oracledb.createPool({
      user: this.config.get<string>('ORACLE_USER'),
      password: this.config.get<string>('ORACLE_PASSWORD'),
      connectString: this.config.get<string>('ORACLE_CONNECTION_STRING'),
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });

    console.log('🟢 Oracle conectado correctamente');
  }

  async getConnection() {
    return await this.pool.getConnection();
  }
  async testConnection() {
  const conn = await this.getConnection();

  const result = await conn.execute(`SELECT SYSDATE FROM dual`);

  await conn.close();

  return result.rows;
}
}