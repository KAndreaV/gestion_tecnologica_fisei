import { InjectionToken } from '@nestjs/common';

export const DATABASE_GATEWAY: InjectionToken = Symbol('DATABASE_GATEWAY');

export type DatabaseStatus = {
  user: string;
  connectionString: string;
  thin: boolean;
};

export type DatabasePingResult = {
  ok: boolean;
  databaseVersion: string;
};

export interface DatabaseGateway {
  getStatus(): DatabaseStatus;
  ping(): Promise<DatabasePingResult>;
}
