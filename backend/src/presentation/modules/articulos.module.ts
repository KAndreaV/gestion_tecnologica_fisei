import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticuloOrm } from '../../infrastructure/orm/entities/articulo.entity';
import { ArticulosService } from '../../application/services/articulos.service';
import { ArticulosController } from '../controllers/articulos.controller';

/**
 * Módulo de Artículos
 * Agrupa todas las funcionalidades relacionadas con artículos
 * Importa TypeOrmModule para acceso a BD
 */
@Module({
  imports: [TypeOrmModule.forFeature([ArticuloOrm])],
  providers: [ArticulosService],
  controllers: [ArticulosController],
  exports: [ArticulosService],
})
export class ArticulosModule {}
