import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoOrm } from '../../infrastructure/orm/entities/estado.entity';
import { CreateEstadoDto } from '../dtos/create-estado.dto';
import { UpdateEstadoDto } from '../dtos/update-estado.dto';

const TIPOS_ESTADO_PERMITIDOS = [
  'ARTICULO',
  'PRESTAMO',
  'MANTENIMIENTO',
  'USUARIO',
  'GENERAL',
];

@Injectable()
export class EstadosService {
  constructor(
    @InjectRepository(EstadoOrm)
    private readonly estadoRepository: Repository<EstadoOrm>,
  ) {}

  async findAll(): Promise<EstadoOrm[]> {
    try {
      return await this.estadoRepository.query(
        `SELECT
          ID_EST "idEst",
          NOM_EST "nomEst",
          DES_EST "desEst",
          TIPO_EST "tipoEst",
          FEC_REGISTRO "fecRegistro"
        FROM ESTADO
        ORDER BY TIPO_EST, NOM_EST`,
      );
    } catch {
      throw new BadRequestException('Error al obtener los estados');
    }
  }

  async findOne(id: number): Promise<EstadoOrm> {
    try {
      const result = await this.estadoRepository.query(
        `SELECT
          ID_EST "idEst",
          NOM_EST "nomEst",
          DES_EST "desEst",
          TIPO_EST "tipoEst",
          FEC_REGISTRO "fecRegistro"
        FROM ESTADO
        WHERE ID_EST = :1`,
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Estado con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar estado');
    }
  }

  async create(createDto: CreateEstadoDto): Promise<EstadoOrm> {
    try {
      const tipoEst = this.normalizeTipoEst(createDto.tipoEst);
      await this.validateUniqueName(createDto.nomEst, tipoEst);
      const nextId = await this.getNextId();

      await this.estadoRepository.query(
        `INSERT INTO ESTADO (ID_EST, NOM_EST, DES_EST, TIPO_EST, FEC_REGISTRO)
        VALUES (:1, :2, :3, :4, SYSDATE)`,
        [nextId, createDto.nomEst, createDto.desEst ?? null, tipoEst],
      );

      return await this.findOne(nextId);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al crear estado');
    }
  }

  async update(id: number, updateDto: UpdateEstadoDto): Promise<EstadoOrm> {
    try {
      const current: any = await this.findOne(id);
      const tipoEst =
        updateDto.tipoEst !== undefined
          ? this.normalizeTipoEst(updateDto.tipoEst)
          : current.tipoEst;
      const nomEst = updateDto.nomEst ?? current.nomEst;

      if (updateDto.nomEst !== undefined || updateDto.tipoEst !== undefined) {
        await this.validateUniqueName(nomEst, tipoEst, id);
      }

      await this.estadoRepository.query(
        `UPDATE ESTADO
        SET NOM_EST = :1,
            DES_EST = :2,
            TIPO_EST = :3
        WHERE ID_EST = :4`,
        [nomEst, updateDto.desEst ?? current.desEst, tipoEst, id],
      );

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar estado');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      await this.findOne(id);
      await this.estadoRepository.query('DELETE FROM ESTADO WHERE ID_EST = :1', [
        id,
      ]);
      return { message: `Estado ${id} eliminado correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar estado');
    }
  }

  private async getNextId(): Promise<number> {
    const result = await this.estadoRepository.query(
      'SELECT NVL(MAX(ID_EST), 0) + 1 "nextId" FROM ESTADO',
    );
    return result[0].nextId;
  }

  private normalizeTipoEst(tipoEst: string): string {
    const normalized = tipoEst.trim().toUpperCase();

    if (!TIPOS_ESTADO_PERMITIDOS.includes(normalized)) {
      throw new BadRequestException(
        `tipoEst debe ser uno de: ${TIPOS_ESTADO_PERMITIDOS.join(', ')}`,
      );
    }

    return normalized;
  }

  private async validateUniqueName(
    name: string,
    tipoEst: string,
    ignoreId?: number,
  ) {
    const result = await this.estadoRepository.query(
      `SELECT ID_EST
      FROM ESTADO
      WHERE UPPER(NOM_EST) = UPPER(:1)
        AND UPPER(TIPO_EST) = UPPER(:2)
        AND (:3 IS NULL OR ID_EST <> :3)`,
      [name, tipoEst, ignoreId ?? null],
    );

    if (result.length > 0) {
      throw new ConflictException('Ya existe un estado con ese nombre y tipo');
    }
  }
}
