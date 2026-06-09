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
} from '@nestjs/common';
import { CreateMantenimientoDto } from '../../application/dtos/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from '../../application/dtos/update-mantenimiento.dto';
import { MantenimientosService } from '../../application/services/mantenimientos.service';

@Controller('mantenimientos')
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
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.mantenimientosService.delete(id);

    return {
      success: true,
      message: 'Mantenimiento eliminado correctamente',
    };
  }
}
