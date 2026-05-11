import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticuloOrm } from '../../infrastructure/orm/entities/articulo.entity';
import { CreateArticuloDto } from '../dtos/create-articulo.dto';
import { UpdateArticuloDto } from '../dtos/update-articulo.dto';

/**
 * Servicio de Artículos
 * Contiene la lógica de negocio para operaciones CRUD
 */
@Injectable()
export class ArticulosService {
  private readonly logger = new Logger(ArticulosService.name);

  constructor(
    @InjectRepository(ArticuloOrm)
    private readonly articuloRepository: Repository<ArticuloOrm>,
  ) {
    this.logger.log('✅ ArticulosService initialized with Database connection');
  }

  /**
   * Obtener todos los artículos
   * @returns Lista de artículos
   */
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
      throw new NotFoundException(
        `Artículo con ID ${id} no encontrado`,
      );
    }

    return result[0];

  } catch (error) {

    this.logger.error(error);

    throw new BadRequestException(
      'Error al buscar artículo',
    );
  }
}
  /**
   * Crear un nuevo artículo
   * @param createDto Datos para crear el artículo
   * @returns Artículo creado
   */
 async create(createDto: CreateArticuloDto): Promise<ArticuloOrm> {
  try {
    this.logger.debug('Creando nuevo artículo:');
    this.logger.debug(createDto.nomArt);

    // Obtener siguiente ID desde Oracle SEQUENCE
    const result = await this.articuloRepository.query(
      `SELECT SEQ_ARTICULO.NEXTVAL as ID FROM dual`
    );

    const nextId = result[0].ID;

    const articulo = this.articuloRepository.create({
      idArt: nextId,
      nomArt: createDto.nomArt,
      desArt: createDto.desArt,
      serArt: createDto.serArt,
      marArt: createDto.marArt,
      modArt: createDto.modArt,
      canArt: createDto.canArt,
      valArt: createDto.valArt,
      estArt: 1,
      idCat: createDto.idCat,
      idEst: createDto.idEst,
      idDep: createDto.idDep,
      idUbi: createDto.idUbi,
      fecRegistro: new Date(),
    });

    return await this.articuloRepository.save(articulo);

  } catch (error) {
    this.logger.error('Error al crear artículo:');
    this.logger.error(error);

    throw new BadRequestException(
      'Error al crear el artículo en la base de datos',
    );
  }
}

  /**
   * Actualizar un artículo existente
   * @param id ID del artículo
   * @param updateDto Datos a actualizar
   * @returns Artículo actualizado
   */
 async update(
  id: number,
  updateDto: UpdateArticuloDto,
): Promise<any> {

  try {

    await this.findOne(id);

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

    this.logger.error(error);

    throw new BadRequestException(
      'Error al actualizar artículo',
    );
  }
}
  /**
   * Eliminar (desactivar) un artículo
   * @param id ID del artículo
   * @returns Mensaje de confirmación
   */
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

    this.logger.error(error);

    throw new BadRequestException(
      'Error al eliminar artículo',
    );
  }
}
  /**
   * Obtener artículos por categoría
   * @param categoriaId ID de la categoría
   * @returns Lista de artículos de la categoría
   
  async findByCategoria(categoriaId: number): Promise<ArticuloOrm[]> {
    this.logger.debug(`Buscando artículos de categoría: ${categoriaId}`);
    return await this.articuloRepository.find({
      where: { idCat: categoriaId, estArt: 1 },
      order: { nomArt: 'ASC' },
    });
  }

  /**
   * Obtener el total de artículos
   * @returns Total de artículos activos
   
  async getTotal(): Promise<{ total: number }> {
    const total = await this.articuloRepository.count({
      where: { estArt: 1 },
    });
    return { total };
  }*/
}
