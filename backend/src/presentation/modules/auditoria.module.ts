import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from '../../application/services/auditoria.service';
import { AuditoriaOrm } from '../../infrastructure/orm/entities/auditoria.entity';
import { AuditoriaController } from '../controllers/auditoria.controller';

/**
 * Modulo de Auditoria
 * Agrupa la consulta y registro de auditoria del sistema
 */
@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaOrm])],
  providers: [AuditoriaService],
  controllers: [AuditoriaController],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
