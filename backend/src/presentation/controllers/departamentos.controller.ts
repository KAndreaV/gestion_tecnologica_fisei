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
import { DepartamentosService } from '../../application/services/departamentos.service';
import { CreateDepartamentoDto } from '../../application/dtos/create-departamento.dto';
import { UpdateDepartamentoDto } from '../../application/dtos/update-departamento.dto';

@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.departamentosService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.departamentosService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateDepartamentoDto) {
    const data = await this.departamentosService.create(createDto);
    return { success: true, data };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDepartamentoDto,
  ) {
    const data = await this.departamentosService.update(id, updateDto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.departamentosService.delete(id);
    return { success: true, message: 'Departamento eliminado correctamente' };
  }
}
