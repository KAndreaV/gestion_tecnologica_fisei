import { Module, Logger, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticuloOrm } from '../orm/entities/articulo.entity';
import { PrestamoOrm } from '../orm/entities/prestamo.entity';
import { MovimientoOrm } from '../orm/entities/movimiento.entity';
import { AuditoriaOrm } from '../orm/entities/auditoria.entity';
import { NotificacionOrm } from '../orm/entities/notificacion.entity';

const logger = new Logger('DatabaseModule');

/**
 * DatabaseModule - Conexión a Oracle Database
 * Se carga automáticamente sin necesidad de flag
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectString = configService.get<string>('ORACLE_CONNECTION_STRING') || 'localhost:1521/xe';
        logger.log(`🔄 Conectando a Oracle: ${connectString}`);
        
        return {
          type: 'oracle' as const,
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
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DatabaseModule {
  constructor() {
    logger.log('✅ Database module loaded - connecting to Oracle');
  }
}
