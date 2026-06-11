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
import { CreateMantenimientoDto } from '../../application/dtos/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from '../../application/dtos/update-mantenimiento.dto';
import { MantenimientosService } from '../../application/services/mantenimientos.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('mantenimientos')
@UseGuards(JwtAuthGuard)
export class MantenimientosController {
  constructor(
    private readonly mantenimientosService: MantenimientosService,
  ) {}

  // =========================================
  // GET ALL
  // =========================================
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.mantenimientosService.findAll();

    return {
      success: true,
      data,
      total: data.length,
    };
  }

  // =========================================
  // GET BY ID
  // =========================================
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.mantenimientosService.findOne(id);

    return {
      success: true,
      data,
    };
  }

  // =========================================
  // POST
  // =========================================
  @Post()
  @UseGuards(RolesGuard)
  @Roles(1, 4) // Administradores y Técnicos
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateMantenimientoDto) {
    const data = await this.mantenimientosService.create(createDto);

    return {
      success: true,
      message: 'Mantenimiento creado correctamente',
      data,
    };
  }

  // =========================================
  // PUT
  // =========================================
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(1, 4) // Administradores y Técnicos
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMantenimientoDto,
  ) {
    const data = await this.mantenimientosService.update(id, updateDto);

    return {
      success: true,
      message: 'Mantenimiento actualizado correctamente',
      data,
    };
  }

  // =========================================
  // DELETE
  // =========================================
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(1, 4) // Administradores y Técnicos
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.mantenimientosService.delete(id);

    return {
      success: true,
      message: 'Mantenimiento eliminado correctamente',
    };
  }
}

