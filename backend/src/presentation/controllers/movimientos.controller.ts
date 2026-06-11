import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateMovimientoDto } from '../../application/dtos/create-movimiento.dto';
import { MovimientosService } from '../../application/services/movimientos.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('movimientos')
@UseGuards(JwtAuthGuard)
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.movimientosService.findAll();

    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.movimientosService.findOne(id);

    return {
      success: true,
      data,
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(1) // Sólo Administradores
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateMovimientoDto) {
    const data = await this.movimientosService.create(createDto);

    return {
      success: true,
      message: 'Movimiento creado correctamente',
      data,
    };
  }
}

