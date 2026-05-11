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
import { CreatePrestamoDto } from '../../application/dtos/create-prestamo.dto';
import { UpdatePrestamoDto } from '../../application/dtos/update-prestamo.dto';
import { PrestamosService } from '../../application/services/prestamos.service';

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  // =========================================
  // GET ALL
  // =========================================
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.prestamosService.findAll();

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
    const data = await this.prestamosService.findOne(id);

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
  async create(@Body() createDto: CreatePrestamoDto) {
    const data = await this.prestamosService.create(createDto);

    return {
      success: true,
      message: 'Prestamo creado correctamente',
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
    @Body() updateDto: UpdatePrestamoDto,
  ) {
    const data = await this.prestamosService.update(id, updateDto);

    return {
      success: true,
      message: 'Prestamo actualizado correctamente',
      data,
    };
  }

  // =========================================
  // DELETE
  // =========================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.prestamosService.delete(id);

    return {
      success: true,
      message: 'Prestamo eliminado correctamente',
    };
  }
}
