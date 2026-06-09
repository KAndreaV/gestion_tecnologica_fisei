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
    name: 'DES_MAN',
    type: 'varchar2',
    length: 300,
  })
  desMan!: string;

  @Column({
    name: 'TIP_MAN',
    type: 'varchar2',
    length: 60,
  })
  tipMan!: string;

  @Column({
    name: 'FEC_INI',
    type: 'date',
  })
  fecIni!: Date;

  @Column({
    name: 'FEC_FIN',
    type: 'date',
    nullable: true,
  })
  fecFin?: Date;

  @Column({
    name: 'OBS_MAN',
    type: 'varchar2',
    length: 500,
    nullable: true,
  })
  obsMen?: string;

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

  @Column({
    name: 'ID_EST',
    type: 'number',
  })
  idEst!: number;
}
