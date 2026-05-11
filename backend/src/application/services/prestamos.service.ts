import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      if (error instanceof NotFoundException) {
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
}
