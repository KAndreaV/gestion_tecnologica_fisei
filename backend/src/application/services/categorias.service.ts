import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaOrm } from '../../infrastructure/orm/entities/categoria.entity';
import { CreateCategoriaDto } from '../dtos/create-categoria.dto';
import { UpdateCategoriaDto } from '../dtos/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(CategoriaOrm)
    private readonly categoriaRepository: Repository<CategoriaOrm>,
  ) {}

  async findAll(): Promise<CategoriaOrm[]> {
    try {
      return await this.categoriaRepository.query(
        `SELECT
          ID_CAT "idCat",
          NOM_CAT "nomCat",
          DES_CAT "desCat",
          FEC_REGISTRO "fecRegistro"
        FROM CATEGORIA
        ORDER BY NOM_CAT`,
      );
    } catch {
      throw new BadRequestException('Error al obtener las categorías');
    }
  }

  async findOne(id: number): Promise<CategoriaOrm> {
    try {
      const result = await this.categoriaRepository.query(
        `SELECT
          ID_CAT "idCat",
          NOM_CAT "nomCat",
          DES_CAT "desCat",
          FEC_REGISTRO "fecRegistro"
        FROM CATEGORIA
        WHERE ID_CAT = :1`,
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar categoría');
    }
  }

  async create(createDto: CreateCategoriaDto): Promise<CategoriaOrm> {
    try {
      await this.validateUniqueName(createDto.nomCat);
      const nextId = await this.getNextId();

      await this.categoriaRepository.query(
        `INSERT INTO CATEGORIA (ID_CAT, NOM_CAT, DES_CAT, FEC_REGISTRO)
        VALUES (:1, :2, :3, SYSDATE)`,
        [nextId, createDto.nomCat, createDto.desCat ?? null],
      );

      return await this.findOne(nextId);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al crear categoría');
    }
  }

  async update(id: number, updateDto: UpdateCategoriaDto): Promise<CategoriaOrm> {
    try {
      const current: any = await this.findOne(id);

      if (updateDto.nomCat !== undefined) {
        await this.validateUniqueName(updateDto.nomCat, id);
      }

      await this.categoriaRepository.query(
        `UPDATE CATEGORIA
        SET NOM_CAT = :1,
            DES_CAT = :2
        WHERE ID_CAT = :3`,
        [
          updateDto.nomCat ?? current.nomCat,
          updateDto.desCat ?? current.desCat,
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
      throw new BadRequestException('Error al actualizar categoría');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      await this.findOne(id);
      await this.categoriaRepository.query(
        'DELETE FROM CATEGORIA WHERE ID_CAT = :1',
        [id],
      );
      return { message: `Categoría ${id} eliminada correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar categoría');
    }
  }

  private async getNextId(): Promise<number> {
    const result = await this.categoriaRepository.query(
      'SELECT NVL(MAX(ID_CAT), 0) + 1 "nextId" FROM CATEGORIA',
    );
    return result[0].nextId;
  }

  private async validateUniqueName(name: string, ignoreId?: number) {
    const result = await this.categoriaRepository.query(
      `SELECT ID_CAT
      FROM CATEGORIA
      WHERE UPPER(NOM_CAT) = UPPER(:1)
        AND (:2 IS NULL OR ID_CAT <> :2)`,
      [name, ignoreId ?? null],
    );

    if (result.length > 0) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
  }
}
