import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateMantenimientoDto } from '../dtos/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from '../dtos/update-mantenimiento.dto';
import { MantenimientoOrm } from '../../infrastructure/orm/entities/mantenimiento.entity';
import { MovimientosService } from './movimientos.service';
import { AuditoriaService } from './auditoria.service';

/**
 * Servicio de Mantenimientos
 * Contiene la logica de negocio para operaciones CRUD
 */
@Injectable()
export class MantenimientosService {
  private readonly logger = new Logger(MantenimientosService.name);

  constructor(
    @InjectRepository(MantenimientoOrm)
    private readonly mantenimientoRepository: Repository<MantenimientoOrm>,
    private readonly auditoriaService: AuditoriaService,
    private readonly movimientosService: MovimientosService,
  ) {
    this.logger.log('MantenimientosService initialized with Database connection');
  }

  private async findMantenimientoForUpdate(
    manager: EntityManager,
    id: number,
  ): Promise<any> {
    const result = await manager.query(
      'SELECT * FROM MANTENIMIENTO WHERE ID_MAN = :1 FOR UPDATE',
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }

    return result[0];
  }

  private async findArticuloForUpdate(
    manager: EntityManager,
    articuloId: number,
  ): Promise<any> {
    const result = await manager.query(
      'SELECT * FROM ARTICULO WHERE ID_ART = :1 FOR UPDATE',
      [articuloId],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Articulo con ID ${articuloId} no encontrado`);
    }

    if (Number(result[0].EST_ART) !== 1) {
      throw new BadRequestException(`El articulo ${articuloId} esta inactivo`);
    }

    return result[0];
  }

  private validateTipoMantenimiento(tipoMan: string): void {
    if (!['PREVENTIVO', 'CORRECTIVO'].includes(tipoMan)) {
      throw new BadRequestException('El tipo de mantenimiento no es valido');
    }
  }

  /**
   * Obtener todos los mantenimientos
   * @returns Lista de mantenimientos
   */
  async findAll(): Promise<MantenimientoOrm[]> {
    this.logger.debug('Buscando todos los mantenimientos');

    try {
      return await this.mantenimientoRepository.query(
        'SELECT * FROM MANTENIMIENTO WHERE EST_MAN = 1',
      );
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(
        'Error al obtener los mantenimientos de la base de datos',
      );
    }
  }

  /**
   * Obtener un mantenimiento por ID
   * @param id ID del mantenimiento
   * @returns Mantenimiento encontrado
   */
  async findOne(id: number): Promise<MantenimientoOrm> {
    try {
      const result = await this.mantenimientoRepository.query(
        'SELECT * FROM MANTENIMIENTO WHERE ID_MAN = :1',
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al buscar mantenimiento');
    }
  }

  /**
   * Crear un nuevo mantenimiento
   * @param createDto Datos para crear el mantenimiento
   * @returns Mantenimiento creado
   */
  async create(createDto: CreateMantenimientoDto): Promise<MantenimientoOrm> {
    try {
      this.logger.debug('Creando nuevo mantenimiento');
      this.validateTipoMantenimiento(createDto.tipoMan);

      return await this.mantenimientoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.query(
            'LOCK TABLE MANTENIMIENTO IN EXCLUSIVE MODE',
          );

          const result = await transactionalEntityManager.query(
            'SELECT NVL(MAX(ID_MAN), 0) + 1 AS ID FROM MANTENIMIENTO',
          );

          const nextId = result[0].ID;

          await this.findArticuloForUpdate(
            transactionalEntityManager,
            createDto.idArt,
          );

          await transactionalEntityManager.query(
            `
            INSERT INTO MANTENIMIENTO (
              ID_MAN,
              FEC_MAN,
              TIPO_MAN,
              DESC_MAN,
              EST_MAN,
              ID_ART,
              ID_USR
            ) VALUES (
              :1,
              NVL(:2, SYSDATE),
              :3,
              :4,
              1,
              :5,
              :6
            )
            `,
            [
              nextId,
              createDto.fecMan ? new Date(createDto.fecMan) : null,
              createDto.tipoMan,
              createDto.descMan ?? null,
              createDto.idArt,
              createDto.idUsr,
            ],
          );

          await this.auditoriaService.create(
            {
              tablaAfectada: 'MANTENIMIENTO',
              accion: 'INSERT',
              descripcion: `Mantenimiento creado. ID_MAN: ${nextId}`,
            },
            transactionalEntityManager,
          );

          await this.movimientosService.create(
            {
              idPres: null as unknown as number,
              tipoMov: 'MANTENIMIENTO',
              descripcion: `Mantenimiento registrado. ID_ART: ${createDto.idArt}`,
            },
            transactionalEntityManager,
          );

          const created = await transactionalEntityManager.query(
            'SELECT * FROM MANTENIMIENTO WHERE ID_MAN = :1',
            [nextId],
          );

          return created[0];
        },
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error al crear mantenimiento:');
      this.logger.error(error);

      throw new BadRequestException(
        'Error al crear el mantenimiento en la base de datos',
      );
    }
  }

  /**
   * Actualizar un mantenimiento existente
   * @param id ID del mantenimiento
   * @param updateDto Datos a actualizar
   * @returns Mantenimiento actualizado
   */
  async update(
    id: number,
    updateDto: UpdateMantenimientoDto,
  ): Promise<MantenimientoOrm> {
    try {
      return await this.mantenimientoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const current = await this.findMantenimientoForUpdate(
            transactionalEntityManager,
            id,
          );

          const fecMan = updateDto.fecMan
            ? new Date(updateDto.fecMan)
            : current.FEC_MAN;
          const tipoMan = updateDto.tipoMan ?? current.TIPO_MAN;
          const descMan = updateDto.descMan ?? current.DESC_MAN ?? null;
          const estMan = updateDto.estMan ?? current.EST_MAN;
          const idArt = updateDto.idArt ?? current.ID_ART;
          const idUsr = updateDto.idUsr ?? current.ID_USR;

          this.validateTipoMantenimiento(tipoMan);

          if (![0, 1].includes(Number(estMan))) {
            throw new BadRequestException(
              'El estado del mantenimiento no es valido',
            );
          }

          if (updateDto.idArt !== undefined) {
            await this.findArticuloForUpdate(transactionalEntityManager, idArt);
          }

          await transactionalEntityManager.query(
            `
            UPDATE MANTENIMIENTO
            SET
              FEC_MAN = :1,
              TIPO_MAN = :2,
              DESC_MAN = :3,
              EST_MAN = :4,
              ID_ART = :5,
              ID_USR = :6
            WHERE ID_MAN = :7
            `,
            [fecMan, tipoMan, descMan, estMan, idArt, idUsr, id],
          );

          await this.auditoriaService.create(
            {
              tablaAfectada: 'MANTENIMIENTO',
              accion: 'UPDATE',
              descripcion: `Mantenimiento actualizado. ID_MAN: ${id}`,
            },
            transactionalEntityManager,
          );

          const updated = await transactionalEntityManager.query(
            'SELECT * FROM MANTENIMIENTO WHERE ID_MAN = :1',
            [id],
          );

          return updated[0];
        },
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al actualizar mantenimiento');
    }
  }

  /**
   * Eliminar un mantenimiento
   * @param id ID del mantenimiento
   * @returns Mensaje de confirmacion
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      return await this.mantenimientoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const mantenimiento = await this.findMantenimientoForUpdate(
            transactionalEntityManager,
            id,
          );

          if (Number(mantenimiento.EST_MAN) !== 1) {
            throw new BadRequestException(
              `Mantenimiento ${id} ya esta eliminado`,
            );
          }

          await transactionalEntityManager.query(
            'UPDATE MANTENIMIENTO SET EST_MAN = 0 WHERE ID_MAN = :1',
            [id],
          );

          await this.auditoriaService.create(
            {
              tablaAfectada: 'MANTENIMIENTO',
              accion: 'DELETE',
              descripcion: `Mantenimiento eliminado logicamente. ID_MAN: ${id}`,
            },
            transactionalEntityManager,
          );

          return {
            message: `Mantenimiento ${id} eliminado correctamente`,
          };
        },
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al eliminar mantenimiento');
    }
  }
}
