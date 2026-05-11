import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetallePrestamoDto } from '../dtos/create-detalle-prestamo.dto';
import { CreatePrestamoDto } from '../dtos/create-prestamo.dto';
import { UpdatePrestamoDto } from '../dtos/update-prestamo.dto';
import { PrestamoOrm } from '../../infrastructure/orm/entities/prestamo.entity';

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

          return await transactionalEntityManager.save(PrestamoOrm, prestamo);
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
      const currentResult = await this.prestamoRepository.query(
        'SELECT * FROM PRESTAMO WHERE ID_PRES = :1',
        [id],
      );

      if (currentResult.length === 0) {
        throw new NotFoundException(`Prestamo con ID ${id} no encontrado`);
      }

      const current = currentResult[0];
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

      await this.prestamoRepository.query(
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

      return await this.findOne(id);
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
      await this.findOne(id);

      await this.prestamoRepository.query(
        'UPDATE PRESTAMO SET EST_PRES = 0 WHERE ID_PRES = :1',
        [id],
      );

      return {
        message: `Prestamo ${id} eliminado correctamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
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
      await this.findOne(prestamoId);

      const canPre = Number(dto.canPre ?? 1);
      this.validateCantidad(canPre);

      const articuloResult = await this.prestamoRepository.query(
        'SELECT * FROM ARTICULO WHERE ID_ART = :1',
        [dto.idArt],
      );

      if (articuloResult.length === 0) {
        throw new NotFoundException(
          `Articulo con ID ${dto.idArt} no encontrado`,
        );
      }

      const detalleResult = await this.prestamoRepository.query(
        'SELECT * FROM DETALLE_PRESTAMO WHERE ID_PRES = :1 AND ID_ART = :2',
        [prestamoId, dto.idArt],
      );

      if (detalleResult.length > 0) {
        throw new BadRequestException(
          `El articulo ${dto.idArt} ya existe en el prestamo ${prestamoId}`,
        );
      }

      if (Number(articuloResult[0].EST_ART) !== 1) {
        throw new BadRequestException(`El articulo ${dto.idArt} esta inactivo`);
      }

      const stock = Number(articuloResult[0].CAN_ART ?? 0);

      const articuloPrestadoResult = await this.prestamoRepository.query(
        `
        SELECT NVL(SUM(dp.CAN_PRE), 0) AS PRESTADO
        FROM DETALLE_PRESTAMO dp
        JOIN PRESTAMO p ON dp.ID_PRES = p.ID_PRES
        WHERE dp.ID_ART = :1
        AND p.EST_PRES = 1
        `,
        [dto.idArt],
      );

      const prestado = Number(articuloPrestadoResult[0]?.PRESTADO ?? 0);

      if (stock < canPre || prestado + canPre > stock) {
        throw new BadRequestException(
          `No hay stock suficiente para el articulo ${dto.idArt}`,
        );
      }

      await this.prestamoRepository.query(
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

      return {
        ID_PRES: prestamoId,
        ID_ART: dto.idArt,
        CAN_PRE: canPre,
      };
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
      await this.findOne(prestamoId);
      const nuevaCantidad = Number(cantidad);

      const detalleResult = await this.prestamoRepository.query(
        'SELECT * FROM DETALLE_PRESTAMO WHERE ID_PRES = :1 AND ID_ART = :2',
        [prestamoId, articuloId],
      );

      if (detalleResult.length === 0) {
        throw new NotFoundException(
          `Detalle de prestamo ${prestamoId} con articulo ${articuloId} no encontrado`,
        );
      }

      this.validateCantidad(nuevaCantidad);

      const articuloResult = await this.prestamoRepository.query(
        'SELECT * FROM ARTICULO WHERE ID_ART = :1',
        [articuloId],
      );

      if (articuloResult.length === 0) {
        throw new NotFoundException(
          `Articulo con ID ${articuloId} no encontrado`,
        );
      }

      if (Number(articuloResult[0].EST_ART) !== 1) {
        throw new BadRequestException(`El articulo ${articuloId} esta inactivo`);
      }

      const stock = Number(articuloResult[0].CAN_ART ?? 0);

      const articuloPrestadoResult = await this.prestamoRepository.query(
        `
        SELECT NVL(SUM(dp.CAN_PRE), 0) AS PRESTADO
        FROM DETALLE_PRESTAMO dp
        JOIN PRESTAMO p ON dp.ID_PRES = p.ID_PRES
        WHERE dp.ID_ART = :1
        AND p.EST_PRES = 1
        `,
        [articuloId],
      );

      const prestado = Number(articuloPrestadoResult[0]?.PRESTADO ?? 0);
      const cantidadActual = Number(detalleResult[0].CAN_PRE ?? 0);

      if (prestado - cantidadActual + nuevaCantidad > stock) {
        throw new BadRequestException(
          `No hay stock suficiente para el articulo ${articuloId}`,
        );
      }

      await this.prestamoRepository.query(
        `
        UPDATE DETALLE_PRESTAMO
        SET CAN_PRE = :1
        WHERE ID_PRES = :2
          AND ID_ART = :3
        `,
        [nuevaCantidad, prestamoId, articuloId],
      );

      return {
        ID_PRES: prestamoId,
        ID_ART: articuloId,
        CAN_PRE: nuevaCantidad,
      };
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
      await this.findOne(prestamoId);

      const result = await this.prestamoRepository.query(
        `
        DELETE FROM DETALLE_PRESTAMO
        WHERE ID_PRES = :1
          AND ID_ART = :2
        `,
        [prestamoId, articuloId],
      );

      const affectedRows =
        typeof result === 'number' ? result : result?.rowsAffected;

      if (affectedRows === 0) {
        throw new NotFoundException(
          `Detalle de prestamo ${prestamoId} con articulo ${articuloId} no encontrado`,
        );
      }

      return {
        message: `Detalle de prestamo ${prestamoId} con articulo ${articuloId} eliminado correctamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);

      throw new BadRequestException('Error al eliminar detalle del prestamo');
    }
  }
}
