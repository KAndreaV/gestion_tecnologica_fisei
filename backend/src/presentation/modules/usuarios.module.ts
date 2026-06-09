import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from '../../application/services/usuarios.service';
import { UsuariosController } from '../controllers/usuarios.controller';
import { UsuarioOrm } from '../../infrastructure/orm/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioOrm])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
