import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from '../../application/services/usuarios.service';
import { CreateUsuarioDto } from '../../application/dtos/create-usuario.dto';
import { UpdateUsuarioDto } from '../../application/dtos/update-usuario.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
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
  @UseGuards(RolesGuard)
  @Roles(1) // Sólo Administradores
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const data = await this.usuariosService.create(createUsuarioDto);
    return {
      success: true,
      message: 'Usuario creado correctamente',
      data,
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(1) // Sólo Administradores
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
  @UseGuards(RolesGuard)
  @Roles(1) // Sólo Administradores
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usuariosService.delete(id);
    return {
      success: true,
      message: result.message,
    };
  }
}

