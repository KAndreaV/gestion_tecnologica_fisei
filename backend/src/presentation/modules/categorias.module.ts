import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaOrm } from '../../infrastructure/orm/entities/categoria.entity';
import { CategoriasService } from '../../application/services/categorias.service';
import { CategoriasController } from '../controllers/categorias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaOrm])],
  providers: [CategoriasService],
  controllers: [CategoriasController],
  exports: [CategoriasService],
})
export class CategoriasModule {}
