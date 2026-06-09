import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateNotificacionDto } from '../dtos/create-notificacion.dto';
import { NotificacionOrm } from '../../infrastructure/orm/entities/notificacion.entity';

/**
 * Servicio de Notificaciones
 * Registra y consulta notificaciones del sistema
 */
@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(NotificacionOrm)
    private readonly notificacionRepository: Repository<NotificacionOrm>,
  ) {
    this.logger.log('NotificacionesService initialized with Database connection');
  }

  async findAll(): Promise<NotificacionOrm[]> {
    try {
      return await this.notificacionRepository.query(
        'SELECT * FROM NOTIFICACION ORDER BY FECHA_NOT DESC, ID_NOT DESC',
      );
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException('Error al obtener notificaciones');
    }
  }

  async findOne(id: number): Promise<NotificacionOrm> {
    try {
      const result = await this.notificacionRepository.query(
        'SELECT * FROM NOTIFICACION WHERE ID_NOT = :1',
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Notificacion con ID ${id} no encontrada`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al buscar notificacion');
    }
  }

  async create(
    dto: CreateNotificacionDto,
    manager?: EntityManager,
  ): Promise<unknown> {
    try {
      if (manager) {
        return await this.insertNotificacion(dto, manager);
      }

      return await this.notificacionRepository.manager.transaction(
        async (transactionalEntityManager) =>
          await this.insertNotificacion(dto, transactionalEntityManager),
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al crear notificacion');
    }
  }

  private async insertNotificacion(
    dto: CreateNotificacionDto,
    manager: EntityManager,
  ): Promise<unknown> {
    await manager.query('LOCK TABLE NOTIFICACION IN EXCLUSIVE MODE');

    const result = await manager.query(
      'SELECT NVL(MAX(ID_NOT), 0) + 1 AS ID FROM NOTIFICACION',
    );

    const nextId = result[0].ID;

    await manager.query(
      `
      INSERT INTO NOTIFICACION (
        ID_NOT,
        ID_USR,
        MENSAJE,
        TIPO_NOT,
        FECHA_NOT
      ) VALUES (
        :1,
        :2,
        :3,
        :4,
        SYSDATE
      )
      `,
      [nextId, dto.idUsr ?? null, dto.mensaje, dto.tipoNot],
    );

    return {
      ID_NOT: nextId,
      ID_USR: dto.idUsr ?? null,
      MENSAJE: dto.mensaje,
      TIPO_NOT: dto.tipoNot,
    };
  }
}
