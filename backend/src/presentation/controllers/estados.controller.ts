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
import { EstadosService } from '../../application/services/estados.service';
import { CreateEstadoDto } from '../../application/dtos/create-estado.dto';
import { UpdateEstadoDto } from '../../application/dtos/update-estado.dto';

@Controller('estados')
export class EstadosController {
  constructor(private readonly estadosService: EstadosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.estadosService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.estadosService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateEstadoDto) {
    const data = await this.estadosService.create(createDto);
    return { success: true, data };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEstadoDto,
  ) {
    const data = await this.estadosService.update(id, updateDto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.estadosService.delete(id);
    return { success: true, message: 'Estado eliminado correctamente' };
  }
}
