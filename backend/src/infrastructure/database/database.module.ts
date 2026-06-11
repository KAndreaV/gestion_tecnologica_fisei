import { Module, Logger, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticuloOrm } from '../orm/entities/articulo.entity';
import { UsuarioOrm } from '../orm/entities/usuario.entity';
import { PrestamoOrm } from '../orm/entities/prestamo.entity';
import { DetallePrestamoOrm } from '../orm/entities/detalle-prestamo.entity';
import { MovimientoOrm } from '../orm/entities/movimiento.entity';
import { AuditoriaOrm } from '../orm/entities/auditoria.entity';
import { NotificacionOrm } from '../orm/entities/notificacion.entity';
import { CategoriaOrm } from '../orm/entities/categoria.entity';
import { DepartamentoOrm } from '../orm/entities/departamento.entity';
import { EstadoOrm } from '../orm/entities/estado.entity';
import { UbicacionOrm } from '../orm/entities/ubicacion.entity';
import { MantenimientoOrm } from '../orm/entities/mantenimiento.entity';

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
        const username = configService.get<string>('ORACLE_USER') || 'gestionfisei';
        logger.log(`🔄 Conectando a Oracle: ${connectString} como usuario: ${username}`);
        
        return {
          type: 'oracle' as const,
          connectString,
          username: configService.get<string>('ORACLE_USER') || 'gestionfisei',
          password: configService.get<string>('ORACLE_PASSWORD') || 'gestionfisei',
          entities: [
            ArticuloOrm,
            UsuarioOrm,
            PrestamoOrm,
            DetallePrestamoOrm,
            MovimientoOrm,
            AuditoriaOrm,
            NotificacionOrm,
            CategoriaOrm,
            DepartamentoOrm,
            EstadoOrm,
            UbicacionOrm,
            MantenimientoOrm,
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
