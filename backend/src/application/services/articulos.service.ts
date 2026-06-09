import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticuloOrm } from '../../infrastructure/orm/entities/articulo.entity';
import { CreateArticuloDto } from '../dtos/create-articulo.dto';
import { UpdateArticuloDto } from '../dtos/update-articulo.dto';

@Injectable()
export class ArticulosService {
  private readonly logger = new Logger(ArticulosService.name);

  constructor(
    @InjectRepository(ArticuloOrm)
    private readonly articuloRepository: Repository<ArticuloOrm>,
  ) {
    this.logger.log('ArticulosService initialized with Database connection');
  }

  async findAll(): Promise<ArticuloOrm[]> {
  this.logger.debug('Buscando todos los artículos');

  try {

    const data = await this.articuloRepository.query(
      'SELECT * FROM ARTICULO',
    );

    console.log('DATOS ORACLE:', data);

    return data;

  } catch (error) {

    console.error(error);

    throw new BadRequestException(
      'Error al obtener los artículos de la base de datos',
    );
  }
}
  /**
   * Obtener un artículo por ID
   * @param id ID del artículo
   * @returns Artículo encontrado
   */
 async findOne(id: number): Promise<ArticuloOrm> {

  try {

    const result = await this.articuloRepository.query(
      `SELECT * FROM ARTICULO WHERE ID_ART = :1`,
      [id],
    );

      if (result.length === 0) {
        throw new NotFoundException(`Artículo con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);
      throw new BadRequestException('Error al buscar artículo');
    }
  }

  async create(createDto: CreateArticuloDto): Promise<ArticuloOrm> {
    try {
      await this.validateCategoriaExists(createDto.idCat);
      await this.validateEstadoArticulo(createDto.idEst);
      await this.validateUniqueSerie(createDto.serArt);

      const nextId = await this.getNextId();

      await this.articuloRepository.query(
        `INSERT INTO ARTICULO (
          ID_ART,
          NOM_ART,
          DES_ART,
          SER_ART,
          MAR_ART,
          MOD_ART,
          CAN_ART,
          VAL_ART,
          EST_ART,
          ID_CAT,
          ID_EST,
          ID_DEP,
          ID_UBI,
          FEC_REGISTRO
        ) VALUES (
          :1, :2, :3, :4, :5, :6, :7, :8, 1, :9, :10, :11, :12, SYSDATE
        )`,
        [
          nextId,
          createDto.nomArt,
          createDto.desArt ?? null,
          createDto.serArt ?? null,
          createDto.marArt ?? null,
          createDto.modArt ?? null,
          createDto.canArt,
          createDto.valArt,
          createDto.idCat,
          createDto.idEst,
          createDto.idDep ?? null,
          createDto.idUbi ?? null,
        ],
      );

      return await this.findOne(nextId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(error);
      throw new BadRequestException(
        'Error al crear el artículo en la base de datos',
      );
    }
  }

  async update(id: number, updateDto: UpdateArticuloDto): Promise<ArticuloOrm> {
    try {
      const current: any = await this.findOne(id);
      const idCat = updateDto.idCat ?? current.idCat;
      const idEst = updateDto.idEst ?? current.idEst;
      const serArt = updateDto.serArt ?? current.serArt;

      await this.validateCategoriaExists(idCat);
      await this.validateEstadoArticulo(idEst);
      await this.validateUniqueSerie(serArt, id);

    await this.articuloRepository.query(
      `
      UPDATE ARTICULO
      SET
        NOM_ART = :1,
        DES_ART = :2,
        SER_ART = :3,
        MAR_ART = :4,
        MOD_ART = :5,
        CAN_ART = :6,
        VAL_ART = :7,
        ID_CAT = :8,
        ID_EST = :9,
        ID_DEP = :10,
        ID_UBI = :11,
        FEC_ACTUALIZACION = SYSDATE
      WHERE ID_ART = :12
      `,
      [
        updateDto.nomArt,
        updateDto.desArt,
        updateDto.serArt,
        updateDto.marArt,
        updateDto.modArt,
        updateDto.canArt,
        updateDto.valArt,
        updateDto.idCat,
        updateDto.idEst,
        updateDto.idDep,
        updateDto.idUbi,
        id,
      ],
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

      this.logger.error(error);
      throw new BadRequestException('Error al actualizar artículo');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      await this.findOne(id);

    await this.articuloRepository.query(
      `DELETE FROM ARTICULO WHERE ID_ART = :1`,
      [id],
    );

      return {
        message: `Artículo ${id} eliminado correctamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(error);
      throw new BadRequestException('Error al eliminar artículo');
    }
  }

  private async getNextId(): Promise<number> {
    const result = await this.articuloRepository.query(
      'SELECT SEQ_ARTICULO.NEXTVAL "nextId" FROM dual',
    );
    return result[0].nextId;
  }

  private async validateUniqueSerie(serArt?: string | null, ignoreId?: number) {
    if (!serArt) {
      return;
    }

    const result = await this.articuloRepository.query(
      `SELECT ID_ART
      FROM ARTICULO
      WHERE UPPER(SER_ART) = UPPER(:1)
        AND EST_ART = 1
        AND (:2 IS NULL OR ID_ART <> :2)`,
      [serArt, ignoreId ?? null],
    );

    if (result.length > 0) {
      throw new ConflictException('Ya existe un artículo con ese número de serie');
    }
  }

  private async validateCategoriaExists(idCat: number) {
    const result = await this.articuloRepository.query(
      'SELECT ID_CAT FROM CATEGORIA WHERE ID_CAT = :1',
      [idCat],
    );

    if (result.length === 0) {
      throw new BadRequestException(`La categoría con ID ${idCat} no existe`);
    }
  }

  private async validateEstadoArticulo(idEst: number) {
    const result = await this.articuloRepository.query(
      `SELECT ID_EST
      FROM ESTADO
      WHERE ID_EST = :1
        AND UPPER(TIPO_EST) = 'ARTICULO'`,
      [idEst],
    );

    if (result.length === 0) {
      throw new BadRequestException(
        `El estado con ID ${idEst} no existe o no pertenece a ARTICULO`,
      );
    }
  }
}
