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
import { CreateDetallePrestamoDto } from '../../application/dtos/create-detalle-prestamo.dto';
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
  // POST DETALLE
  // =========================================
  @Post(':id/detalles')
  @HttpCode(HttpStatus.CREATED)
  async addDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDetalleDto: CreateDetallePrestamoDto,
  ) {
    const data = await this.prestamosService.addDetalle(id, createDetalleDto);

    return {
      success: true,
      message: 'Detalle de prestamo agregado correctamente',
      data,
    };
  }

  // =========================================
  // GET DETALLES
  // =========================================
  @Get(':id/detalles')
  @HttpCode(HttpStatus.OK)
  async getDetalles(@Param('id', ParseIntPipe) id: number) {
    const data = await this.prestamosService.getDetalles(id);

    return {
      success: true,
      data,
      total: data.length,
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
  // PUT DETALLE
  // =========================================
  @Put(':id/detalles/:idArt')
  @HttpCode(HttpStatus.OK)
  async updateDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Param('idArt', ParseIntPipe) idArt: number,
    @Body() body: { canPre: number },
  ) {
    const data = await this.prestamosService.updateDetalle(
      id,
      idArt,
      body.canPre,
    );

    return {
      success: true,
      message: 'Detalle de prestamo actualizado correctamente',
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

  // =========================================
  // DELETE DETALLE
  // =========================================
  @Delete(':id/detalles/:idArt')
  @HttpCode(HttpStatus.OK)
  async removeDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Param('idArt', ParseIntPipe) idArt: number,
  ) {
    await this.prestamosService.removeDetalle(id, idArt);

    return {
      success: true,
      message: 'Detalle de prestamo eliminado correctamente',
    };
  }
}
