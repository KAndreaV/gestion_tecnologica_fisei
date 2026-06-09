import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';

import { ArticulosService } from '../../application/services/articulos.service';
import { CreateArticuloDto } from '../../application/dtos/create-articulo.dto';
import { UpdateArticuloDto } from '../../application/dtos/update-articulo.dto';

@Controller('articulos')
export class ArticulosController {
  constructor(
    private readonly articulosService: ArticulosService,
  ) {}

  // =========================================
  // GET ALL
  // =========================================
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.articulosService.findAll();

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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.articulosService.findOne(id);

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
  async create(
    @Body() createDto: CreateArticuloDto,
  ) {
    const data = await this.articulosService.create(createDto);

    return {
      success: true,
      message: 'Artículo creado correctamente',
      data,
    };
  }

  // =========================================
  // PUT / PATCH
  // =========================================
  @Patch(':id')
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateArticuloDto,
  ) {
    const data = await this.articulosService.update(id, updateDto);

    return {
      success: true,
      message: 'Artículo actualizado correctamente',
      data,
    };
  }

  // =========================================
  // DELETE
  // =========================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.articulosService.delete(id);

    return {
      success: true,
      message: 'Artículo eliminado correctamente',
    };
  }
}
