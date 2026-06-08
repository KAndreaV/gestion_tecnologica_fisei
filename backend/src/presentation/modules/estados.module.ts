import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoOrm } from '../../infrastructure/orm/entities/estado.entity';
import { EstadosService } from '../../application/services/estados.service';
import { EstadosController } from '../controllers/estados.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoOrm])],
  providers: [EstadosService],
  controllers: [EstadosController],
  exports: [EstadosService],
})
export class EstadosModule {}
