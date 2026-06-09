import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosService } from '../../application/services/movimientos.service';
import { MovimientoOrm } from '../../infrastructure/orm/entities/movimiento.entity';
import { MovimientosController } from '../controllers/movimientos.controller';
import { AuditoriaModule } from './auditoria.module';
import { NotificacionesModule } from './notificaciones.module';

/**
 * Modulo de Movimientos
 * Agrupa las funcionalidades relacionadas con movimientos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MovimientoOrm]),
    AuditoriaModule,
    NotificacionesModule,
  ],
  providers: [MovimientosService],
  controllers: [MovimientosController],
  exports: [MovimientosService],
})
export class MovimientosModule {}
