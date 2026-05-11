import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Entidad ORM para la tabla ARTICULO
 * Oracle Database
 */
@Entity({ name: 'ARTICULO' })
export class ArticuloOrm {

 @PrimaryGeneratedColumn({
  name: 'ID_ART',
  type: 'number',
})
idArt!: number;

  @Column({
    name: 'NOM_ART',
    type: 'varchar2',
    length: 180,
  })
  nomArt!: string;

  @Column({
    name: 'DES_ART',
    type: 'varchar2',
    length: 500,
    nullable: true,
  })
  desArt?: string;

  @Column({
    name: 'SER_ART',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  serArt?: string;

  @Column({
    name: 'MAR_ART',
    type: 'varchar2',
    length: 80,
    nullable: true,
  })
  marArt?: string;

  @Column({
    name: 'MOD_ART',
    type: 'varchar2',
    length: 80,
    nullable: true,
  })
  modArt?: string;

  @Column({
    name: 'CAN_ART',
    type: 'number',
    default: 1,
  })
  canArt!: number;

  @Column({
    name: 'VAL_ART',
    type: 'number',
    default: 0,
  })
  valArt!: number;

  @Column({
    name: 'EST_ART',
    type: 'number',
    default: 1,
  })
  estArt!: number;

  @Column({
    name: 'ID_CAT',
    type: 'number',
  })
  idCat!: number;

  @Column({
    name: 'ID_EST',
    type: 'number',
  })
  idEst!: number;

  @Column({
    name: 'ID_DEP',
    type: 'number',
    nullable: true,
  })
  idDep?: number;

  @Column({
    name: 'ID_UBI',
    type: 'number',
    nullable: true,
  })
  idUbi?: number;

  @Column({
    name: 'FEC_REGISTRO',
    type: 'date',
  })
  fecRegistro!: Date;

  @Column({
    name: 'FEC_ACTUALIZACION',
    type: 'date',
    nullable: true,
  })
  fecActualizacion?: Date;
}