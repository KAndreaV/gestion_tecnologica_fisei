import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuariosService } from '../../application/services/usuarios.service';
import { CreateUsuarioDto } from '../../application/dtos/create-usuario.dto';
import { UpdateUsuarioDto } from '../../application/dtos/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async findAll() {
    const data = await this.usuariosService.findAll();
    return {
      success: true,
      message: 'Usuarios obtenidos correctamente',
      data,
      total: data.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usuariosService.findOne(id);
    return {
      success: true,
      message: 'Usuario obtenido correctamente',
      data,
    };
  }

  @Post()
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const data = await this.usuariosService.create(createUsuarioDto);
    return {
      success: true,
      message: 'Usuario creado correctamente',
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const data = await this.usuariosService.update(id, updateUsuarioDto);
    return {
      success: true,
      message: 'Usuario actualizado correctamente',
      data,
    };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usuariosService.delete(id);
    return {
      success: true,
      message: result.message,
    };
  }
}
