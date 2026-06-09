import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UbicacionOrm } from '../../infrastructure/orm/entities/ubicacion.entity';
import { CreateUbicacionDto } from '../dtos/create-ubicacion.dto';
import { UpdateUbicacionDto } from '../dtos/update-ubicacion.dto';

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(UbicacionOrm)
    private readonly ubicacionRepository: Repository<UbicacionOrm>,
  ) {}

  async findAll(): Promise<UbicacionOrm[]> {
    try {
      return await this.ubicacionRepository.query(
        `SELECT
          U.ID_UBI "idUbi",
          U.NOM_UBI "nomUbi",
          U.DES_UBI "desUbi",
          U.ID_DEP "idDep",
          D.NOM_DEP "nomDep",
          U.FEC_REGISTRO "fecRegistro"
        FROM UBICACION U
        LEFT JOIN DEPARTAMENTO D ON D.ID_DEP = U.ID_DEP
        ORDER BY D.NOM_DEP, U.NOM_UBI`,
      );
    } catch {
      throw new BadRequestException('Error al obtener las ubicaciones');
    }
  }

  async findOne(id: number): Promise<UbicacionOrm> {
    try {
      const result = await this.ubicacionRepository.query(
        `SELECT
          U.ID_UBI "idUbi",
          U.NOM_UBI "nomUbi",
          U.DES_UBI "desUbi",
          U.ID_DEP "idDep",
          D.NOM_DEP "nomDep",
          U.FEC_REGISTRO "fecRegistro"
        FROM UBICACION U
        LEFT JOIN DEPARTAMENTO D ON D.ID_DEP = U.ID_DEP
        WHERE U.ID_UBI = :1`,
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar ubicación');
    }
  }

  async create(createDto: CreateUbicacionDto): Promise<UbicacionOrm> {
    try {
      await this.validateDepartamentoExists(createDto.idDep);
      await this.validateUniqueName(createDto.nomUbi, createDto.idDep);
      const nextId = await this.getNextId();

      await this.ubicacionRepository.query(
        `INSERT INTO UBICACION (ID_UBI, NOM_UBI, DES_UBI, ID_DEP, FEC_REGISTRO)
        VALUES (:1, :2, :3, :4, SYSDATE)`,
        [
          nextId,
          createDto.nomUbi,
          createDto.desUbi ?? null,
          createDto.idDep,
        ],
      );

      return await this.findOne(nextId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al crear ubicación');
    }
  }

  async update(
    id: number,
    updateDto: UpdateUbicacionDto,
  ): Promise<UbicacionOrm> {
    try {
      const current: any = await this.findOne(id);
      const idDep = updateDto.idDep ?? current.idDep;
      const nomUbi = updateDto.nomUbi ?? current.nomUbi;

      if (updateDto.idDep !== undefined) {
        await this.validateDepartamentoExists(updateDto.idDep);
      }

      if (updateDto.nomUbi !== undefined || updateDto.idDep !== undefined) {
        await this.validateUniqueName(nomUbi, idDep, id);
      }

      await this.ubicacionRepository.query(
        `UPDATE UBICACION
        SET NOM_UBI = :1,
            DES_UBI = :2,
            ID_DEP = :3
        WHERE ID_UBI = :4`,
        [nomUbi, updateDto.desUbi ?? current.desUbi, idDep, id],
      );

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar ubicación');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      await this.findOne(id);
      await this.ubicacionRepository.query(
        'DELETE FROM UBICACION WHERE ID_UBI = :1',
        [id],
      );
      return { message: `Ubicación ${id} eliminada correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar ubicación');
    }
  }

  private async getNextId(): Promise<number> {
    const result = await this.ubicacionRepository.query(
      'SELECT NVL(MAX(ID_UBI), 0) + 1 "nextId" FROM UBICACION',
    );
    return result[0].nextId;
  }

  private async validateDepartamentoExists(idDep: number) {
    const result = await this.ubicacionRepository.query(
      'SELECT ID_DEP FROM DEPARTAMENTO WHERE ID_DEP = :1',
      [idDep],
    );

    if (result.length === 0) {
      throw new NotFoundException(
        `Departamento con ID ${idDep} no encontrado`,
      );
    }
  }

  private async validateUniqueName(
    name: string,
    idDep: number,
    ignoreId?: number,
  ) {
    const result = await this.ubicacionRepository.query(
      `SELECT ID_UBI
      FROM UBICACION
      WHERE UPPER(NOM_UBI) = UPPER(:1)
        AND ID_DEP = :2
        AND (:3 IS NULL OR ID_UBI <> :3)`,
      [name, idDep, ignoreId ?? null],
    );

    if (result.length > 0) {
      throw new ConflictException(
        'Ya existe una ubicación con ese nombre en el departamento',
      );
    }
  }
}
