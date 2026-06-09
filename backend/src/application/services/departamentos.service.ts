import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartamentoOrm } from '../../infrastructure/orm/entities/departamento.entity';
import { CreateDepartamentoDto } from '../dtos/create-departamento.dto';
import { UpdateDepartamentoDto } from '../dtos/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(DepartamentoOrm)
    private readonly departamentoRepository: Repository<DepartamentoOrm>,
  ) {}

  async findAll(): Promise<DepartamentoOrm[]> {
    try {
      return await this.departamentoRepository.query(
        `SELECT
          ID_DEP "idDep",
          NOM_DEP "nomDep",
          DES_DEP "desDep",
          FEC_REGISTRO "fecRegistro"
        FROM DEPARTAMENTO
        ORDER BY NOM_DEP`,
      );
    } catch {
      throw new BadRequestException('Error al obtener los departamentos');
    }
  }

  async findOne(id: number): Promise<DepartamentoOrm> {
    try {
      const result = await this.departamentoRepository.query(
        `SELECT
          ID_DEP "idDep",
          NOM_DEP "nomDep",
          DES_DEP "desDep",
          FEC_REGISTRO "fecRegistro"
        FROM DEPARTAMENTO
        WHERE ID_DEP = :1`,
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar departamento');
    }
  }

  async create(createDto: CreateDepartamentoDto): Promise<DepartamentoOrm> {
    try {
      await this.validateUniqueName(createDto.nomDep);
      const nextId = await this.getNextId();

      await this.departamentoRepository.query(
        `INSERT INTO DEPARTAMENTO (ID_DEP, NOM_DEP, DES_DEP, FEC_REGISTRO)
        VALUES (:1, :2, :3, SYSDATE)`,
        [nextId, createDto.nomDep, createDto.desDep ?? null],
      );

      return await this.findOne(nextId);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al crear departamento');
    }
  }

  async update(
    id: number,
    updateDto: UpdateDepartamentoDto,
  ): Promise<DepartamentoOrm> {
    try {
      const current: any = await this.findOne(id);

      if (updateDto.nomDep !== undefined) {
        await this.validateUniqueName(updateDto.nomDep, id);
      }

      await this.departamentoRepository.query(
        `UPDATE DEPARTAMENTO
        SET NOM_DEP = :1,
            DES_DEP = :2
        WHERE ID_DEP = :3`,
        [
          updateDto.nomDep ?? current.nomDep,
          updateDto.desDep ?? current.desDep,
          id,
        ],
      );

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar departamento');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      await this.findOne(id);
      await this.departamentoRepository.query(
        'DELETE FROM DEPARTAMENTO WHERE ID_DEP = :1',
        [id],
      );
      return { message: `Departamento ${id} eliminado correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar departamento');
    }
  }

  private async getNextId(): Promise<number> {
    const result = await this.departamentoRepository.query(
      'SELECT NVL(MAX(ID_DEP), 0) + 1 "nextId" FROM DEPARTAMENTO',
    );
    return result[0].nextId;
  }

  private async validateUniqueName(name: string, ignoreId?: number) {
    const result = await this.departamentoRepository.query(
      `SELECT ID_DEP
      FROM DEPARTAMENTO
      WHERE UPPER(NOM_DEP) = UPPER(:1)
        AND (:2 IS NULL OR ID_DEP <> :2)`,
      [name, ignoreId ?? null],
    );

    if (result.length > 0) {
      throw new ConflictException('Ya existe un departamento con ese nombre');
    }
  }
}
