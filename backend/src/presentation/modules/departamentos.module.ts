import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentoOrm } from '../../infrastructure/orm/entities/departamento.entity';
import { DepartamentosService } from '../../application/services/departamentos.service';
import { DepartamentosController } from '../controllers/departamentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DepartamentoOrm])],
  providers: [DepartamentosService],
  controllers: [DepartamentosController],
  exports: [DepartamentosService],
})
export class DepartamentosModule {}
