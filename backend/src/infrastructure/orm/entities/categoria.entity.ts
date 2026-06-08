import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla CATEGORIA
 * Oracle Database
 */
@Entity({ name: 'CATEGORIA' })
export class CategoriaOrm {
  @PrimaryGeneratedColumn({
    name: 'ID_CAT',
    type: 'number',
  })
  idCat!: number;

  @Column({
    name: 'NOM_CAT',
    type: 'varchar2',
    length: 120,
  })
  nomCat!: string;

  @Column({
    name: 'DES_CAT',
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  desCat?: string;

  @Column({
    name: 'FEC_REGISTRO',
    type: 'date',
  })
  fecRegistro!: Date;
}
