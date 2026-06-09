import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateDetallePrestamoDto } from '../dtos/create-detalle-prestamo.dto';
import { CreatePrestamoDto } from '../dtos/create-prestamo.dto';
import { UpdatePrestamoDto } from '../dtos/update-prestamo.dto';
import { PrestamoOrm } from '../../infrastructure/orm/entities/prestamo.entity';
import { MovimientosService } from './movimientos.service';
import { AuditoriaService } from './auditoria.service';
import { NotificacionesService } from './notificaciones.service';

/**
 * Servicio de Prestamos
 * Contiene la logica de negocio para operaciones CRUD
 */
@Injectable()
export class PrestamosService {
  private readonly logger = new Logger(PrestamosService.name);

  constructor(
    @InjectRepository(PrestamoOrm)
    private readonly prestamoRepository: Repository<PrestamoOrm>,
    private readonly movimientosService: MovimientosService,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
  ) {
    this.logger.log('PrestamosService initialized with Database connection');
  }

  private validateFechas(
    fecPres?: string | Date | null,
    fecDevolucion?: string | Date | null,
  ): void {
    if (!fecPres || !fecDevolucion) {
      return;
    }

    const fechaPrestamo = new Date(fecPres);
    const fechaDevolucion = new Date(fecDevolucion);

    if (
      Number.isNaN(fechaPrestamo.getTime()) ||
      Number.isNaN(fechaDevolucion.getTime())
    ) {
      throw new BadRequestException('Las fechas del prestamo no son validas');
    }

    if (fechaPrestamo > fechaDevolucion) {
      throw new BadRequestException(
        'La fecha de prestamo no puede ser mayor a la fecha de devolucion',
      );
    }
  }

  private validateCantidad(cantidad: number): void {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }
  }

  private async findPrestamoForUpdate(
    manager: EntityManager,
    id: number,
  ): Promise<any> {
    const result = await manager.query(
      'SELECT * FROM PRESTAMO WHERE ID_PRES = :1 FOR UPDATE',
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Prestamo con ID ${id} no encontrado`);
    }

    return result[0];
  }

  private validatePrestamoActivo(prestamo: any): void {
    if (Number(prestamo.EST_PRES) !== 1) {
      throw new BadRequestException(
        `Prestamo ${prestamo.ID_PRES} no esta activo`,
      );
    }
  }

  private async findArticuloForUpdate(
    manager: EntityManager,
    articuloId: number,
    validateActivo = true,
  ): Promise<any> {
    const result = await manager.query(
      'SELECT * FROM ARTICULO WHERE ID_ART = :1 FOR UPDATE',
      [articuloId],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Articulo con ID ${articuloId} no encontrado`);
    }

    if (validateActivo && Number(result[0].EST_ART) !== 1) {
      throw new BadRequestException(`El articulo ${articuloId} esta inactivo`);
    }

    return result[0];
  }

  private async findDetalleForUpdate(
    manager: EntityManager,
    prestamoId: number,
    articuloId: number,
  ): Promise<any> {
    const result = await manager.query(
      'SELECT * FROM DETALLE_PRESTAMO WHERE ID_PRES = :1 AND ID_ART = :2 FOR UPDATE',
      [prestamoId, articuloId],
    );

    if (result.length === 0) {
      throw new NotFoundException(
        `Detalle de prestamo ${prestamoId} con articulo ${articuloId} no encontrado`,
      );
    }

    return result[0];
  }

  private async descontarStock(
    manager: EntityManager,
    articulo: any,
    cantidad: number,
  ): Promise<void> {
    const stock = Number(articulo.CAN_ART ?? 0);

    if (stock < cantidad) {
      throw new BadRequestException(
        `No hay stock suficiente para el articulo ${articulo.ID_ART}`,
      );
    }

    await manager.query(
      `
      UPDATE ARTICULO
      SET CAN_ART = CAN_ART - :1,
          FEC_ACTUALIZACION = SYSDATE
      WHERE ID_ART = :2
        AND CAN_ART >= :1
      `,
      [cantidad, articulo.ID_ART],
    );
  }

  private async devolverStock(
    manager: EntityManager,
    articuloId: number,
    cantidad: number,
  ): Promise<void> {
    await manager.query(
      `
      UPDATE ARTICULO
      SET CAN_ART = CAN_ART + :1,
          FEC_ACTUALIZACION = SYSDATE
      WHERE ID_ART = :2
      `,
      [cantidad, articuloId],
    );
  }

  private async ajustarStockDetallesPrestamo(
    manager: EntityManager,
    prestamoId: number,
    operacion: 'DESCONTAR' | 'DEVOLVER',
  ): Promise<void> {
    const detalles = await manager.query(
      'SELECT * FROM DETALLE_PRESTAMO WHERE ID_PRES = :1 FOR UPDATE',
      [prestamoId],
    );

    for (const detalle of detalles) {
      const articulo = await this.findArticuloForUpdate(
        manager,
        detalle.ID_ART,
        operacion === 'DESCONTAR',
      );
      const cantidad = Number(detalle.CAN_PRE ?? 0);

      if (operacion === 'DESCONTAR') {
        await this.descontarStock(manager, articulo, cantidad);
      } else {
        await this.devolverStock(manager, detalle.ID_ART, cantidad);
      }
    }
  }

  /**
   * Obtener todos los prestamos
   * @returns Lista de prestamos
   */
  async findAll(): Promise<PrestamoOrm[]> {
    this.logger.debug('Buscando todos los prestamos');

    try {
      return await this.prestamoRepository.query(
        'SELECT * FROM PRESTAMO WHERE EST_PRES = 1',
      );
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(
        'Error al obtener los prestamos de la base de datos',
      );
    }
  }

  /**
   * Obtener un prestamo por ID
   * @param id ID del prestamo
   * @returns Prestamo encontrado
   */
  async findOne(id: number): Promise<PrestamoOrm> {
    try {
      const result = await this.prestamoRepository.query(
        'SELECT * FROM PRESTAMO WHERE ID_PRES = :1',
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Prestamo con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al buscar prestamo');
    }
  }

  /**
   * Crear un nuevo prestamo
   * @param createDto Datos para crear el prestamo
   * @returns Prestamo creado
   */
  async create(createDto: CreatePrestamoDto): Promise<PrestamoOrm> {
    try {
      this.logger.debug('Creando nuevo prestamo');
      this.validateFechas(createDto.fecPres, createDto.fecDevolucion);

      return await this.prestamoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.query(
            'LOCK TABLE PRESTAMO IN EXCLUSIVE MODE',
          );

          const result = await transactionalEntityManager.query(
            'SELECT NVL(MAX(ID_PRES), 0) + 1 AS ID FROM PRESTAMO',
          );

          const nextId = result[0].ID;

          const prestamo = this.prestamoRepository.create({
            idPres: nextId,
            fecPres: createDto.fecPres
              ? new Date(createDto.fecPres)
              : new Date(),
            fecEntrega: createDto.fecEntrega
              ? new Date(createDto.fecEntrega)
              : undefined,
            fecDevolucion: createDto.fecDevolucion
              ? new Date(createDto.fecDevolucion)
              : undefined,
            obsPres: createDto.obsPres,
            estPres: 1,
            idUsr: createDto.idUsr,
            idEst: createDto.idEst,
          });

          const prestamoCreado = await transactionalEntityManager.save(
            PrestamoOrm,
            prestamo,
          );

          /* TEMPORAL - movimientos desalineado con DDL Oracle
          await this.movimientosService.create(
            {
              idPres: nextId,
              tipoMov: 'PRESTAMO',
              descripcion: `Prestamo creado. ID_PRES: ${nextId}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'PRESTAMO',
              accion: 'INSERT',
              descripcion: `Prestamo creado. ID_PRES: ${nextId}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - notificaciones desalineadas con DDL Oracle
          await this.notificacionesService.create(
            {
              idUsr: createDto.idUsr,
              mensaje: `Prestamo creado correctamente. ID_PRES: ${nextId}`,
              tipoNot: 'PRESTAMO',
            },
            transactionalEntityManager,
          );
          */

          return prestamoCreado;
        },
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error al crear prestamo:');
      this.logger.error(error);

      throw new BadRequestException(
        'Error al crear el prestamo en la base de datos',
      );
    }
  }

  /**
   * Actualizar un prestamo existente
   * @param id ID del prestamo
   * @param updateDto Datos a actualizar
   * @returns Prestamo actualizado
   */
  async update(id: number, updateDto: UpdatePrestamoDto): Promise<PrestamoOrm> {
    try {
      return await this.prestamoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const current = await this.findPrestamoForUpdate(
            transactionalEntityManager,
            id,
          );

          const fecPres = updateDto.fecPres
            ? new Date(updateDto.fecPres)
            : current.FEC_PRES;
          const fecEntrega = updateDto.fecEntrega
            ? new Date(updateDto.fecEntrega)
            : current.FEC_ENTREGA ?? null;
          const fecDevolucion = updateDto.fecDevolucion
            ? new Date(updateDto.fecDevolucion)
            : current.FEC_DEVOLUCION ?? null;
          const obsPres = updateDto.obsPres ?? current.OBS_PRES ?? null;
          const estPres = updateDto.estPres ?? current.EST_PRES;
          const idUsr = updateDto.idUsr ?? current.ID_USR;
          const idEst = updateDto.idEst ?? current.ID_EST;

          this.validateFechas(fecPres, fecDevolucion);

          if (![0, 1].includes(Number(estPres))) {
            throw new BadRequestException('El estado del prestamo no es valido');
          }

          const currentEstPres = Number(current.EST_PRES);
          const newEstPres = Number(estPres);

          if (currentEstPres !== newEstPres) {
            if (currentEstPres === 1 && newEstPres === 0) {
              await this.ajustarStockDetallesPrestamo(
                transactionalEntityManager,
                id,
                'DEVOLVER',
              );
            } else if (currentEstPres === 0 && newEstPres === 1) {
              await this.ajustarStockDetallesPrestamo(
                transactionalEntityManager,
                id,
                'DESCONTAR',
              );
            }
          }

          await transactionalEntityManager.query(
            `
            UPDATE PRESTAMO
            SET
              FEC_PRES = :1,
              FEC_ENTREGA = :2,
              FEC_DEVOLUCION = :3,
              OBS_PRES = :4,
              EST_PRES = :5,
              ID_USR = :6,
              ID_EST = :7
            WHERE ID_PRES = :8
            `,
            [
              fecPres,
              fecEntrega,
              fecDevolucion,
              obsPres,
              estPres,
              idUsr,
              idEst,
              id,
            ],
          );

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'PRESTAMO',
              accion: 'UPDATE',
              descripcion: `Prestamo actualizado. ID_PRES: ${id}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - notificaciones desalineadas con DDL Oracle
          await this.notificacionesService.create(
            {
              idUsr,
              mensaje: `Prestamo actualizado correctamente. ID_PRES: ${id}`,
              tipoNot: 'PRESTAMO',
            },
            transactionalEntityManager,
          );
          */

          const updated = await transactionalEntityManager.query(
            'SELECT * FROM PRESTAMO WHERE ID_PRES = :1',
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

      throw new BadRequestException('Error al actualizar prestamo');
    }
  }

  /**
   * Eliminar un prestamo
   * @param id ID del prestamo
   * @returns Mensaje de confirmacion
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      return await this.prestamoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const prestamo = await this.findPrestamoForUpdate(
            transactionalEntityManager,
            id,
          );

          if (Number(prestamo.EST_PRES) !== 1) {
            throw new BadRequestException(`Prestamo ${id} ya esta eliminado`);
          }

          await this.ajustarStockDetallesPrestamo(
            transactionalEntityManager,
            id,
            'DEVOLVER',
          );

          await transactionalEntityManager.query(
            'UPDATE PRESTAMO SET EST_PRES = 0 WHERE ID_PRES = :1',
            [id],
          );

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'PRESTAMO',
              accion: 'DELETE',
              descripcion: `Prestamo eliminado logicamente. ID_PRES: ${id}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - notificaciones desalineadas con DDL Oracle
          await this.notificacionesService.create(
            {
              idUsr: prestamo.ID_USR,
              mensaje: `Prestamo eliminado logicamente. ID_PRES: ${id}`,
              tipoNot: 'PRESTAMO',
            },
            transactionalEntityManager,
          );
          */

          return {
            message: `Prestamo ${id} eliminado correctamente`,
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

      throw new BadRequestException('Error al eliminar prestamo');
    }
  }

  /**
   * Agregar un articulo al detalle de un prestamo
   * @param prestamoId ID del prestamo
   * @param dto Datos del detalle
   * @returns Detalle creado
   */
  async addDetalle(
    prestamoId: number,
    dto: CreateDetallePrestamoDto,
  ): Promise<unknown> {
    try {
      const canPre = Number(dto.canPre ?? 1);
      this.validateCantidad(canPre);

      return await this.prestamoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const prestamo = await this.findPrestamoForUpdate(
            transactionalEntityManager,
            prestamoId,
          );
          this.validatePrestamoActivo(prestamo);

          const articulo = await this.findArticuloForUpdate(
            transactionalEntityManager,
            dto.idArt,
          );

          const detalleResult = await transactionalEntityManager.query(
            'SELECT * FROM DETALLE_PRESTAMO WHERE ID_PRES = :1 AND ID_ART = :2 FOR UPDATE',
            [prestamoId, dto.idArt],
          );

          if (detalleResult.length > 0) {
            throw new BadRequestException(
              `El articulo ${dto.idArt} ya existe en el prestamo ${prestamoId}`,
            );
          }

          await this.descontarStock(transactionalEntityManager, articulo, canPre);

          await transactionalEntityManager.query(
            `
            INSERT INTO DETALLE_PRESTAMO (
              ID_PRES,
              ID_ART,
              CAN_PRE
            ) VALUES (
              :1,
              :2,
              :3
            )
            `,
            [prestamoId, dto.idArt, canPre],
          );

          /* TEMPORAL - movimientos desalineado con DDL Oracle
          await this.movimientosService.create(
            {
              idPres: prestamoId,
              tipoMov: 'DETALLE_PRESTAMO',
              descripcion: `Detalle de prestamo agregado. ID_ART: ${dto.idArt}, CAN_PRE: ${canPre}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'DETALLE_PRESTAMO',
              accion: 'INSERT',
              descripcion: `Detalle de prestamo agregado. ID_PRES: ${prestamoId}, ID_ART: ${dto.idArt}, CAN_PRE: ${canPre}`,
            },
            transactionalEntityManager,
          );
          */

          return {
            ID_PRES: prestamoId,
            ID_ART: dto.idArt,
            CAN_PRE: canPre,
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

      throw new BadRequestException('Error al agregar detalle al prestamo');
    }
  }

  /**
   * Obtener los detalles de un prestamo
   * @param prestamoId ID del prestamo
   * @returns Lista de detalles
   */
  async getDetalles(prestamoId: number): Promise<unknown[]> {
    try {
      await this.findOne(prestamoId);

      return await this.prestamoRepository.query(
        'SELECT * FROM DETALLE_PRESTAMO WHERE ID_PRES = :1',
        [prestamoId],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al obtener detalles del prestamo');
    }
  }

  /**
   * Actualizar la cantidad de un detalle de prestamo
   * @param prestamoId ID del prestamo
   * @param articuloId ID del articulo
   * @param cantidad Nueva cantidad
   * @returns Detalle actualizado
   */
  async updateDetalle(
    prestamoId: number,
    articuloId: number,
    cantidad: number,
  ): Promise<unknown> {
    try {
      const nuevaCantidad = Number(cantidad);
      this.validateCantidad(nuevaCantidad);

      return await this.prestamoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const prestamo = await this.findPrestamoForUpdate(
            transactionalEntityManager,
            prestamoId,
          );
          this.validatePrestamoActivo(prestamo);
          const articulo = await this.findArticuloForUpdate(
            transactionalEntityManager,
            articuloId,
          );
          const detalle = await this.findDetalleForUpdate(
            transactionalEntityManager,
            prestamoId,
            articuloId,
          );

          const cantidadActual = Number(detalle.CAN_PRE ?? 0);
          const diff = nuevaCantidad - cantidadActual;

          if (diff > 0) {
            await this.descontarStock(transactionalEntityManager, articulo, diff);
          }

          if (diff < 0) {
            await this.devolverStock(
              transactionalEntityManager,
              articuloId,
              Math.abs(diff),
            );
          }

          await transactionalEntityManager.query(
            `
            UPDATE DETALLE_PRESTAMO
            SET CAN_PRE = :1
            WHERE ID_PRES = :2
              AND ID_ART = :3
            `,
            [nuevaCantidad, prestamoId, articuloId],
          );

          /* TEMPORAL - movimientos desalineado con DDL Oracle
          await this.movimientosService.create(
            {
              idPres: prestamoId,
              tipoMov: 'ACTUALIZACION_DETALLE',
              descripcion: `Detalle de prestamo actualizado. ID_ART: ${articuloId}, CAN_PRE_ANTERIOR: ${cantidadActual}, CAN_PRE_NUEVA: ${nuevaCantidad}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'DETALLE_PRESTAMO',
              accion: 'UPDATE',
              descripcion: `Detalle de prestamo actualizado. ID_PRES: ${prestamoId}, ID_ART: ${articuloId}, CAN_PRE_ANTERIOR: ${cantidadActual}, CAN_PRE_NUEVA: ${nuevaCantidad}`,
            },
            transactionalEntityManager,
          );
          */

          return {
            ID_PRES: prestamoId,
            ID_ART: articuloId,
            CAN_PRE: nuevaCantidad,
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

      throw new BadRequestException('Error al actualizar detalle del prestamo');
    }
  }

  /**
   * Eliminar un articulo especifico del detalle de un prestamo
   * @param prestamoId ID del prestamo
   * @param articuloId ID del articulo
   * @returns Mensaje de confirmacion
   */
  async removeDetalle(
    prestamoId: number,
    articuloId: number,
  ): Promise<{ message: string }> {
    try {
      return await this.prestamoRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const prestamo = await this.findPrestamoForUpdate(
            transactionalEntityManager,
            prestamoId,
          );
          this.validatePrestamoActivo(prestamo);
          await this.findArticuloForUpdate(
            transactionalEntityManager,
            articuloId,
            false,
          );
          const detalle = await this.findDetalleForUpdate(
            transactionalEntityManager,
            prestamoId,
            articuloId,
          );

          const cantidad = Number(detalle.CAN_PRE ?? 0);

          await transactionalEntityManager.query(
            `
            DELETE FROM DETALLE_PRESTAMO
            WHERE ID_PRES = :1
              AND ID_ART = :2
            `,
            [prestamoId, articuloId],
          );

          await this.devolverStock(
            transactionalEntityManager,
            articuloId,
            cantidad,
          );

          /* TEMPORAL - movimientos desalineado con DDL Oracle
          await this.movimientosService.create(
            {
              idPres: prestamoId,
              tipoMov: 'ELIMINACION_DETALLE',
              descripcion: `Detalle de prestamo eliminado. ID_ART: ${articuloId}, CAN_PRE: ${cantidad}`,
            },
            transactionalEntityManager,
          );
          */

          /* TEMPORAL - auditoria desalineada con DDL Oracle
          await this.auditoriaService.create(
            {
              tablaAfectada: 'DETALLE_PRESTAMO',
              accion: 'DELETE',
              descripcion: `Detalle de prestamo eliminado. ID_PRES: ${prestamoId}, ID_ART: ${articuloId}, CAN_PRE: ${cantidad}`,
            },
            transactionalEntityManager,
          );
          */

          return {
            message: `Detalle de prestamo ${prestamoId} con articulo ${articuloId} eliminado correctamente`,
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

      throw new BadRequestException('Error al eliminar detalle del prestamo');
    }
  }
}
