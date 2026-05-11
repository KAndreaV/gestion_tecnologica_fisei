import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateMovimientoDto } from '../dtos/create-movimiento.dto';
import { MovimientoOrm } from '../../infrastructure/orm/entities/movimiento.entity';

/**
 * Servicio de Movimientos
 * Contiene la logica para registrar movimientos del sistema
 */
@Injectable()
export class MovimientosService {
  private readonly logger = new Logger(MovimientosService.name);

  constructor(
    @InjectRepository(MovimientoOrm)
    private readonly movimientoRepository: Repository<MovimientoOrm>,
  ) {
    this.logger.log('MovimientosService initialized with Database connection');
  }

  async findAll(): Promise<MovimientoOrm[]> {
    try {
      return await this.movimientoRepository.query(
        'SELECT * FROM MOVIMIENTO ORDER BY FECHA_MOV DESC, ID_MOV DESC',
      );
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException('Error al obtener movimientos');
    }
  }

  async findOne(id: number): Promise<MovimientoOrm> {
    try {
      const result = await this.movimientoRepository.query(
        'SELECT * FROM MOVIMIENTO WHERE ID_MOV = :1',
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al buscar movimiento');
    }
  }

  async create(
    dto: CreateMovimientoDto,
    manager?: EntityManager,
  ): Promise<unknown> {
    try {
      if (manager) {
        return await this.insertMovimiento(dto, manager);
      }

      return await this.movimientoRepository.manager.transaction(
        async (transactionalEntityManager) =>
          await this.insertMovimiento(dto, transactionalEntityManager),
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al crear movimiento');
    }
  }

  private async insertMovimiento(
    dto: CreateMovimientoDto,
    manager: EntityManager,
  ): Promise<unknown> {
    await manager.query('LOCK TABLE MOVIMIENTO IN EXCLUSIVE MODE');

    const result = await manager.query(
      'SELECT NVL(MAX(ID_MOV), 0) + 1 AS ID FROM MOVIMIENTO',
    );

    const nextId = result[0].ID;

    await manager.query(
      `
      INSERT INTO MOVIMIENTO (
        ID_MOV,
        ID_PRES,
        TIPO_MOV,
        DESCRIPCION,
        FECHA_MOV
      ) VALUES (
        :1,
        :2,
        :3,
        :4,
        SYSDATE
      )
      `,
      [nextId, dto.idPres, dto.tipoMov, dto.descripcion ?? null],
    );

    return {
      ID_MOV: nextId,
      ID_PRES: dto.idPres,
      TIPO_MOV: dto.tipoMov,
      DESCRIPCION: dto.descripcion ?? null,
    };
  }
}
