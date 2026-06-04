import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MantenimientosService } from '../../application/services/mantenimientos.service';
import { MantenimientoOrm } from '../../infrastructure/orm/entities/mantenimiento.entity';
import { MantenimientosController } from '../controllers/mantenimientos.controller';
import { AuditoriaModule } from './auditoria.module';
import { MovimientosModule } from './movimientos.module';

/**
 * Modulo de Mantenimientos
 * Agrupa todas las funcionalidades relacionadas con mantenimientos
 * Importa TypeOrmModule para acceso a BD
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MantenimientoOrm]),
    AuditoriaModule,
    MovimientosModule,
  ],
  providers: [MantenimientosService],
  controllers: [MantenimientosController],
  exports: [MantenimientosService],
})
export class MantenimientosModule {}
