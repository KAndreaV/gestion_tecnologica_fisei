import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ArticuloOrm } from '../orm/entities/articulo.entity';
import { PrestamoOrm } from '../orm/entities/prestamo.entity';
import { MovimientoOrm } from '../orm/entities/movimiento.entity';
import { AuditoriaOrm } from '../orm/entities/auditoria.entity';
import { NotificacionOrm } from '../orm/entities/notificacion.entity';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseProvider');

export const databaseProvider = {
  provide: DataSource,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<DataSource> => {
    const dbHost = configService.get<string>('DB_HOST') || 'localhost';
    const dbPort = configService.get<number>('DB_PORT') || 1521;
    const dbServiceName = configService.get<string>('DB_SERVICE_NAME') || 'xe';
    const connectString = `${dbHost}:${dbPort}/${dbServiceName}`;
    
    const dataSource = new DataSource({
      type: 'oracle',
      connectString,
      username: configService.get<string>('ORACLE_USER') || 'gestionfisei',
      password: configService.get<string>('ORACLE_PASSWORD') || 'gestionfisei',
      entities: [
        ArticuloOrm,
        PrestamoOrm,
        MovimientoOrm,
        AuditoriaOrm,
        NotificacionOrm,
      ],
      synchronize: false,
      logging: false,
    } as any);

    try {
      await dataSource.initialize();
      logger.log('✅ Oracle Database connected successfully');
      return dataSource;
    } catch (error: any) {
      logger.warn(`⚠️ Oracle Database connection failed: ${error.message}`);
      logger.warn('🔄 Starting application without database connection');
      logger.warn('📝 Note: Database endpoints will return mock data or errors until database is available');
      
      // Return a disconnected DataSource
      // This allows the app to start even if the database is unavailable
      return dataSource;
    }
  },
};
