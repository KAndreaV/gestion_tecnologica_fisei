import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla MANTENIMIENTO
 * Oracle Database
 */
@Entity({ name: 'MANTENIMIENTO' })
export class MantenimientoOrm {
  @PrimaryColumn({
    name: 'ID_MAN',
    type: 'number',
  })
  idMan!: number;

  @Column({
    name: 'FEC_MAN',
    type: 'date',
  })
  fecMan!: Date;

  @Column({
    name: 'TIPO_MAN',
    type: 'varchar2',
    length: 100,
  })
  tipoMan!: string;

  @Column({
    name: 'DESC_MAN',
    type: 'varchar2',
    length: 500,
    nullable: true,
  })
  descMan?: string;

  @Column({
    name: 'EST_MAN',
    type: 'number',
    default: 1,
  })
  estMan!: number;

  @Column({
    name: 'ID_ART',
    type: 'number',
  })
  idArt!: number;

  @Column({
    name: 'ID_USR',
    type: 'number',
  })
  idUsr!: number;
}
