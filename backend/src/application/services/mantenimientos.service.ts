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
import { NotificacionesService } from './notificaciones.service';

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
    private readonly notificacionesService: NotificacionesService,
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

  private validateTipoMantenimiento(tipMan: string): void {
    if (!['PREVENTIVO', 'CORRECTIVO'].includes(tipMan)) {
      throw new BadRequestException('El tipo de mantenimiento no es valido');
    }
  }

  private validateFechas(
    fecIni?: string | Date | null,
    fecFin?: string | Date | null,
  ): void {
    if (!fecIni || !fecFin) {
      return;
    }

    const fechaInicio = new Date(fecIni);
    const fechaFin = new Date(fecFin);

    if (
      Number.isNaN(fechaInicio.getTime()) ||
      Number.isNaN(fechaFin.getTime())
    ) {
      throw new BadRequestException(
        'Las fechas del mantenimiento no son validas',
      );
    }

    if (fechaInicio > fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de fin',
      );
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
      this.validateTipoMantenimiento(createDto.tipMan);
      this.validateFechas(createDto.fecIni, createDto.fecFin);

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
              DES_MAN,
              TIP_MAN,
              FEC_INI,
              FEC_FIN,
              OBS_MAN,
              EST_MAN,
              ID_ART,
              ID_USR,
              ID_EST
            ) VALUES (
              :1,
              :2,
              :3,
              NVL(:4, SYSDATE),
              :5,
              :6,
              1,
              :7,
              :8,
              :9
            )
            `,
            [
              nextId,
              createDto.desMan,
              createDto.tipMan,
              createDto.fecIni ? new Date(createDto.fecIni) : null,
              createDto.fecFin ? new Date(createDto.fecFin) : null,
              createDto.obsMen ?? null,
              createDto.idArt,
              createDto.idUsr,
              createDto.idEst,
            ],
          );

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'MANTENIMIENTO',
              accion: 'INSERT',
              descripcion: `Mantenimiento creado. ID_MAN: ${nextId}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - notificaciones desalineadas con DDL Oracle
          await this.notificacionesService.create(
            {
              idUsr: createDto.idUsr,
              mensaje: `Mantenimiento registrado correctamente. ID_MAN: ${nextId}, ID_ART: ${createDto.idArt}`,
              tipoNot: 'MANTENIMIENTO',
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - movimientos desalineado con DDL Oracle
          await this.movimientosService.create(
            {
              idPres: undefined,
              tipoMov: 'MANTENIMIENTO',
              descripcion: `Mantenimiento registrado. ID_ART: ${createDto.idArt}`,
            },
            transactionalEntityManager,
          );
          */

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

          const desMan = updateDto.desMan ?? current.DES_MAN;
          const tipMan = updateDto.tipMan ?? current.TIP_MAN;
          const fecIni = updateDto.fecIni
            ? new Date(updateDto.fecIni)
            : current.FEC_INI;
          const fecFin = updateDto.fecFin
            ? new Date(updateDto.fecFin)
            : current.FEC_FIN ?? null;
          const obsMen = updateDto.obsMen ?? current.OBS_MAN ?? null;
          const estMan = updateDto.estMan ?? current.EST_MAN;
          const idArt = updateDto.idArt ?? current.ID_ART;
          const idUsr = updateDto.idUsr ?? current.ID_USR;
          const idEst = updateDto.idEst ?? current.ID_EST;

          this.validateTipoMantenimiento(tipMan);
          this.validateFechas(fecIni, fecFin);

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
              DES_MAN = :1,
              TIP_MAN = :2,
              FEC_INI = :3,
              FEC_FIN = :4,
              OBS_MAN = :5,
              EST_MAN = :6,
              ID_ART = :7,
              ID_USR = :8,
              ID_EST = :9
            WHERE ID_MAN = :10
            `,
            [
              desMan,
              tipMan,
              fecIni,
              fecFin,
              obsMen,
              estMan,
              idArt,
              idUsr,
              idEst,
              id,
            ],
          );

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'MANTENIMIENTO',
              accion: 'UPDATE',
              descripcion: `Mantenimiento actualizado. ID_MAN: ${id}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - notificaciones desalineadas con DDL Oracle
          await this.notificacionesService.create(
            {
              idUsr: idUsr,
              mensaje: `Mantenimiento actualizado correctamente. ID_MAN: ${id}`,
              tipoNot: 'MANTENIMIENTO',
            },
            transactionalEntityManager,
          );
          */

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

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'MANTENIMIENTO',
              accion: 'DELETE',
              descripcion: `Mantenimiento eliminado logicamente. ID_MAN: ${id}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - notificaciones desalineadas con DDL Oracle
          await this.notificacionesService.create(
            {
              idUsr: mantenimiento.ID_USR,
              mensaje: `Mantenimiento eliminado logicamente. ID_MAN: ${id}`,
              tipoNot: 'MANTENIMIENTO',
            },
            transactionalEntityManager,
          );
          */

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
