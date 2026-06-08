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
import { CategoriasService } from '../../application/services/categorias.service';
import { CreateCategoriaDto } from '../../application/dtos/create-categoria.dto';
import { UpdateCategoriaDto } from '../../application/dtos/update-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.categoriasService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoriasService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCategoriaDto) {
    const data = await this.categoriasService.create(createDto);
    return { success: true, data };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoriaDto,
  ) {
    const data = await this.categoriasService.update(id, updateDto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.categoriasService.delete(id);
    return { success: true, message: 'Categoría eliminada correctamente' };
  }
}
