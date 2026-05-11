import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosService } from '../../application/services/prestamos.service';
import { PrestamoOrm } from '../../infrastructure/orm/entities/prestamo.entity';
import { PrestamosController } from '../controllers/prestamos.controller';

/**
 * Modulo de Prestamos
 * Agrupa todas las funcionalidades relacionadas con prestamos
 * Importa TypeOrmModule para acceso a BD
 */
@Module({
  imports: [TypeOrmModule.forFeature([PrestamoOrm])],
  providers: [PrestamosService],
  controllers: [PrestamosController],
  exports: [PrestamosService],
})
export class PrestamosModule {}
