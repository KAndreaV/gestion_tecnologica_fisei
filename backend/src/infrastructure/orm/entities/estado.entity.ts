import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla ESTADO
 * Oracle Database
 */
@Entity({ name: 'ESTADO' })
export class EstadoOrm {
  @PrimaryGeneratedColumn({
    name: 'ID_EST',
    type: 'number',
  })
  idEst!: number;

  @Column({
    name: 'NOM_EST',
    type: 'varchar2',
    length: 80,
  })
  nomEst!: string;

  @Column({
    name: 'DES_EST',
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  desEst?: string;

  @Column({
    name: 'TIPO_EST',
    type: 'varchar2',
    length: 40,
  })
  tipoEst!: string;

  @Column({
    name: 'FEC_REGISTRO',
    type: 'date',
  })
  fecRegistro!: Date;
}
