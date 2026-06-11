import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UbicacionesService } from '../../application/services/ubicaciones.service';
import { CreateUbicacionDto } from '../../application/dtos/create-ubicacion.dto';
import { UpdateUbicacionDto } from '../../application/dtos/update-ubicacion.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('ubicaciones')
@UseGuards(JwtAuthGuard)
export class UbicacionesController {
  constructor(private readonly ubicacionesService: UbicacionesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.ubicacionesService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.ubicacionesService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(1) // Sólo Administradores
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateUbicacionDto) {
    const data = await this.ubicacionesService.create(createDto);
    return { success: true, data };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(1) // Sólo Administradores
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUbicacionDto,
  ) {
    const data = await this.ubicacionesService.update(id, updateDto);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(1) // Sólo Administradores
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.ubicacionesService.delete(id);
    return { success: true, message: 'Ubicación eliminada correctamente' };
  }
}

