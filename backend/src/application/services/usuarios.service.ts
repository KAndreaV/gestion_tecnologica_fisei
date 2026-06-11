import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioOrm } from '../../infrastructure/orm/entities/usuario.entity';
import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(UsuarioOrm)
    private readonly usuarioRepository: Repository<UsuarioOrm>,
  ) {
    this.logger.log('✅ UsuariosService initialized');
  }

  async findAll(): Promise<Omit<UsuarioOrm, 'passHash'>[]> {
    this.logger.debug('Buscando todos los usuarios (activos e inactivos)');
    try {
      const data = await this.usuarioRepository.query(
        'SELECT * FROM USUARIO ORDER BY EST_USR DESC, ID_USR ASC',
      );
      
      return data.map((user: any) => {
        const { PASS_HASH, ...rest } = user;
        return rest;
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Error al obtener los usuarios de la base de datos');
    }
  }

  async findOne(id: number): Promise<Omit<UsuarioOrm, 'passHash'>> {
    try {
      const result = await this.usuarioRepository.query(
        `SELECT * FROM USUARIO WHERE ID_USR = :1`,
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      const { PASS_HASH, ...userWithoutPassword } = result[0];
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);
      throw new BadRequestException('Error al buscar usuario');
    }
  }

  async findByLoginOrEmail(identifier: string): Promise<UsuarioOrm | null> {
    try {
      const result = await this.usuarioRepository.query(
        `SELECT * FROM USUARIO WHERE (USU_LOGIN = :1 OR COR_USR = :2) AND EST_USR = 1`,
        [identifier, identifier],
      );
      if (result.length === 0) {
        return null;
      }
      // Mapear campos de Oracle a entidad para el login
      const rawUser = result[0];
      const usuario = new UsuarioOrm();
      usuario.idUsr = rawUser.ID_USR;
      usuario.nomUsr = rawUser.NOM_USR;
      usuario.apeUsr = rawUser.APE_USR;
      usuario.corUsr = rawUser.COR_USR;
      usuario.usuLogin = rawUser.USU_LOGIN;
      usuario.passHash = rawUser.PASS_HASH;
      usuario.idRol = rawUser.ID_ROL;
      usuario.estUsr = rawUser.EST_USR;
      return usuario;
    } catch (error: any) {
      this.logger.error(error);
      throw new BadRequestException(`Error al buscar usuario por login o email: ${error.message || error}`);
    }
  }

  async create(createDto: CreateUsuarioDto): Promise<Omit<UsuarioOrm, 'passHash'>> {
    try {
      this.logger.debug('Creando nuevo usuario');

      // Validar correo único
      const existingEmail = await this.usuarioRepository.query(
        'SELECT ID_USR FROM USUARIO WHERE COR_USR = :1',
        [createDto.corUsr],
      );
      if (existingEmail.length > 0) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }

      // Validar login único
      const existingLogin = await this.usuarioRepository.query(
        'SELECT ID_USR FROM USUARIO WHERE USU_LOGIN = :1',
        [createDto.usuLogin],
      );
      if (existingLogin.length > 0) {
        throw new ConflictException('El nombre de usuario (login) ya está en uso');
      }

      // Generar ID usando MAX + 1
      const resultId = await this.usuarioRepository.query(
        `SELECT NVL(MAX(ID_USR), 0) + 1 as ID FROM USUARIO`
      );
      const nextId = resultId[0].ID;

      // Hashear password
      const salt = await bcrypt.genSalt();
      const passHash = await bcrypt.hash(createDto.password, salt);

      await this.usuarioRepository.query(
        `INSERT INTO USUARIO (
          ID_USR,
          NOM_USR,
          APE_USR,
          COR_USR,
          TEL_USR,
          USU_LOGIN,
          PASS_HASH,
          EST_USR,
          ID_ROL,
          ID_DEP,
          ID_UBI,
          FEC_REGISTRO
        ) VALUES (
          :1, :2, :3, :4, :5, :6, :7, 1, :8, :9, :10, SYSDATE
        )`,
        [
          nextId,
          createDto.nomUsr,
          createDto.apeUsr,
          createDto.corUsr,
          createDto.telUsr ?? null,
          createDto.usuLogin,
          passHash,
          createDto.idRol,
          createDto.idDep ?? null,
          createDto.idUbi ?? null,
        ],
      );

      return await this.findOne(nextId);

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error al crear usuario:', error);
      throw new BadRequestException('Error al crear el usuario en la base de datos');
    }
  }

  async update(id: number, updateDto: UpdateUsuarioDto): Promise<Omit<UsuarioOrm, 'passHash'>> {
    try {
      await this.findOne(id); // Verifica que exista o lanza NotFoundException

      if (updateDto.corUsr) {
        const existingEmail = await this.usuarioRepository.query(
          'SELECT ID_USR FROM USUARIO WHERE COR_USR = :1 AND ID_USR != :2',
          [updateDto.corUsr, id],
        );
        if (existingEmail.length > 0) {
          throw new ConflictException('El correo electrónico ya está registrado por otro usuario');
        }
      }

      if (updateDto.usuLogin) {
        const existingLogin = await this.usuarioRepository.query(
          'SELECT ID_USR FROM USUARIO WHERE USU_LOGIN = :1 AND ID_USR != :2',
          [updateDto.usuLogin, id],
        );
        if (existingLogin.length > 0) {
          throw new ConflictException('El nombre de usuario (login) ya está en uso por otro usuario');
        }
      }

      const updates: string[] = [];
      const values: any[] = [];
      let index = 1;

      if (updateDto.nomUsr !== undefined) { updates.push(`NOM_USR = :${index++}`); values.push(updateDto.nomUsr); }
      if (updateDto.apeUsr !== undefined) { updates.push(`APE_USR = :${index++}`); values.push(updateDto.apeUsr); }
      if (updateDto.corUsr !== undefined) { updates.push(`COR_USR = :${index++}`); values.push(updateDto.corUsr); }
      if (updateDto.telUsr !== undefined) { updates.push(`TEL_USR = :${index++}`); values.push(updateDto.telUsr); }
      if (updateDto.usuLogin !== undefined) { updates.push(`USU_LOGIN = :${index++}`); values.push(updateDto.usuLogin); }
      if (updateDto.idRol !== undefined) { updates.push(`ID_ROL = :${index++}`); values.push(updateDto.idRol); }
      if (updateDto.idDep !== undefined) { updates.push(`ID_DEP = :${index++}`); values.push(updateDto.idDep); }
      if (updateDto.idUbi !== undefined) { updates.push(`ID_UBI = :${index++}`); values.push(updateDto.idUbi); }
      if (updateDto.estUsr !== undefined) { updates.push(`EST_USR = :${index++}`); values.push(updateDto.estUsr); }

      if (updateDto.password) {
        const salt = await bcrypt.genSalt();
        const passHash = await bcrypt.hash(updateDto.password, salt);
        updates.push(`PASS_HASH = :${index++}`);
        values.push(passHash);
      }

      if (updates.length > 0) {
        values.push(id);
        const setQuery = updates.join(', ');
        await this.usuarioRepository.query(
          `UPDATE USUARIO SET ${setQuery} WHERE ID_USR = :${index}`,
          values,
        );
      }

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(error);
      throw new BadRequestException('Error al actualizar usuario');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      await this.findOne(id);
      
      await this.usuarioRepository.query(
        `UPDATE USUARIO SET EST_USR = 0 WHERE ID_USR = :1`,
        [id],
      );

      return {
        message: `Usuario ${id} desactivado correctamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);
      throw new BadRequestException('Error al eliminar usuario');
    }
  }
}
