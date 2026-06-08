import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla UBICACION
 * Oracle Database
 */
@Entity({ name: 'UBICACION' })
export class UbicacionOrm {
  @PrimaryGeneratedColumn({
    name: 'ID_UBI',
    type: 'number',
  })
  idUbi!: number;

  @Column({
    name: 'NOM_UBI',
    type: 'varchar2',
    length: 120,
  })
  nomUbi!: string;

  @Column({
    name: 'DES_UBI',
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  desUbi?: string;

  @Column({
    name: 'ID_DEP',
    type: 'number',
  })
  idDep!: number;

  @Column({
    name: 'FEC_REGISTRO',
    type: 'date',
  })
  fecRegistro!: Date;
}
