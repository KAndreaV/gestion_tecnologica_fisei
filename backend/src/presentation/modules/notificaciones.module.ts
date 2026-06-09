import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from '../../application/services/notificaciones.service';
import { NotificacionOrm } from '../../infrastructure/orm/entities/notificacion.entity';
import { NotificacionesController } from '../controllers/notificaciones.controller';

/**
 * Modulo de Notificaciones
 * Agrupa la consulta y registro de notificaciones del sistema
 */
@Module({
  imports: [TypeOrmModule.forFeature([NotificacionOrm])],
  providers: [NotificacionesService],
  controllers: [NotificacionesController],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
