import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla DEPARTAMENTO
 * Oracle Database
 */
@Entity({ name: 'DEPARTAMENTO' })
export class DepartamentoOrm {
  @PrimaryGeneratedColumn({
    name: 'ID_DEP',
    type: 'number',
  })
  idDep!: number;

  @Column({
    name: 'NOM_DEP',
    type: 'varchar2',
    length: 120,
  })
  nomDep!: string;

  @Column({
    name: 'DES_DEP',
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  desDep?: string;

  @Column({
    name: 'FEC_REGISTRO',
    type: 'date',
  })
  fecRegistro!: Date;
}
