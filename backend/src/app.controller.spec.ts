import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { GetSystemHealthUseCase } from './application/use-cases/get-system-health.use-case';
import { PingOracleUseCase } from './application/use-cases/ping-oracle.use-case';
import { AppController } from './presentation/http/app.controller';
import { AppService } from './presentation/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const getSystemHealthUseCaseMock = {
      execute: jest.fn(() => ({
        status: 'ok' as const,
        service: 'backend-gestion-tecnologica-fisei',
        oracle: {
          user: 'gestionfisei',
          connectionString: 'localhost/XEPDB1',
          thin: true,
        },
      })),
    };

    const pingOracleUseCaseMock = {
      execute: jest.fn(async () => ({
        status: 'ok',
        databaseVersion: 'Oracle connection OK',
      })),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: GetSystemHealthUseCase,
          useValue: getSystemHealthUseCaseMock,
        },
        {
          provide: PingOracleUseCase,
          useValue: pingOracleUseCaseMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the backend greeting', () => {
      expect(appController.getHello()).toBe('Backend de gestion tecnologica FISEI');
    });

    it('should return health information', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
        service: 'backend-gestion-tecnologica-fisei',
        oracle: {
          user: 'gestionfisei',
          connectionString: 'localhost/XEPDB1',
          thin: true,
        },
      });
    });

    it('should ping oracle via use case', async () => {
      await expect(appController.pingOracle()).resolves.toEqual({
        status: 'ok',
        databaseVersion: 'Oracle connection OK',
      });
    });
  });
});
