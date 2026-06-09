import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UbicacionOrm } from '../../infrastructure/orm/entities/ubicacion.entity';
import { UbicacionesService } from '../../application/services/ubicaciones.service';
import { UbicacionesController } from '../controllers/ubicaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UbicacionOrm])],
  providers: [UbicacionesService],
  controllers: [UbicacionesController],
  exports: [UbicacionesService],
})
export class UbicacionesModule {}
