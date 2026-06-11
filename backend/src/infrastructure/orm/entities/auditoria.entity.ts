import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla AUDITORIA
 * Oracle Database
 */
@Entity({ name: 'AUDITORIA' })
export class AuditoriaOrm {
  @PrimaryColumn({
    name: 'ID_AUD',
    type: 'number',
  })
  idAud!: number;

  @Column({
    name: 'NOM_TABLA',
    type: 'varchar2',
    length: 80,
  })
  tablaAfectada!: string;

  @Column({
    name: 'NOM_ACCION',
    type: 'varchar2',
    length: 20,
  })
  accion!: string;

  @Column({
    name: 'DES_AUD',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  descripcion?: string;

  @Column({
    name: 'FEC_AUD',
    type: 'date',
  })
  fechaAud!: Date;

  @Column({
    name: 'NOM_USUARIO',
    type: 'varchar2',
    length: 80,
  })
  nomUsuario!: string;

  @Column({
    name: 'ID_REGISTRO',
    type: 'varchar2',
    length: 80,
    nullable: true,
  })
  idRegistro?: string;
}

