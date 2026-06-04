import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateAuditoriaDto } from '../dtos/create-auditoria.dto';
import { AuditoriaOrm } from '../../infrastructure/orm/entities/auditoria.entity';

/**
 * Servicio de Auditoria
 * Registra acciones importantes del sistema
 */
@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(AuditoriaOrm)
    private readonly auditoriaRepository: Repository<AuditoriaOrm>,
  ) {
    this.logger.log('AuditoriaService initialized with Database connection');
  }

  async findAll(): Promise<AuditoriaOrm[]> {
    try {
      return await this.auditoriaRepository.query(
        'SELECT * FROM AUDITORIA ORDER BY FEC_AUD DESC, ID_AUD DESC',
      );
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException('Error al obtener auditoria');
    }
  }

  async findOne(id: number): Promise<AuditoriaOrm> {
    try {
      const result = await this.auditoriaRepository.query(
        'SELECT * FROM AUDITORIA WHERE ID_AUD = :1',
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Auditoria con ID ${id} no encontrada`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al buscar auditoria');
    }
  }

  async create(dto: CreateAuditoriaDto, manager?: EntityManager): Promise<unknown> {
    try {
      if (manager) {
        return await this.insertAuditoria(dto, manager);
      }

      return await this.auditoriaRepository.manager.transaction(
        async (transactionalEntityManager) =>
          await this.insertAuditoria(dto, transactionalEntityManager),
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al crear auditoria');
    }
  }

  private async insertAuditoria(
    dto: CreateAuditoriaDto,
    manager: EntityManager,
  ): Promise<unknown> {
    await manager.query('LOCK TABLE AUDITORIA IN EXCLUSIVE MODE');

    const result = await manager.query(
      'SELECT NVL(MAX(ID_AUD), 0) + 1 AS ID FROM AUDITORIA',
    );

    const nextId = result[0].ID;

    await manager.query(
      `
      INSERT INTO AUDITORIA (
        ID_AUD,
        TABLA_AFECTADA,
        ACCION,
        DESCRIPCION,
        FECHA_AUD
      ) VALUES (
        :1,
        :2,
        :3,
        :4,
        SYSDATE
      )
      `,
      [
        nextId,
        dto.tablaAfectada,
        dto.accion,
        dto.descripcion ?? null,
      ],
    );

    return {
      ID_AUD: nextId,
      TABLA_AFECTADA: dto.tablaAfectada,
      ACCION: dto.accion,
      DESCRIPCION: dto.descripcion ?? null,
    };
  }
}
