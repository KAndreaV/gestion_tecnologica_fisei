import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla PRESTAMO
 * Oracle Database
 */
@Entity({ name: 'PRESTAMO' })
export class PrestamoOrm {
  @PrimaryColumn({
    name: 'ID_PRES',
    type: 'number',
  })
  idPres!: number;

  @Column({
    name: 'FEC_PRES',
    type: 'date',
  })
  fecPres!: Date;

  @Column({
    name: 'FEC_ENTREGA',
    type: 'date',
    nullable: true,
  })
  fecEntrega?: Date;

  @Column({
    name: 'FEC_DEVOLUCION',
    type: 'date',
    nullable: true,
  })
  fecDevolucion?: Date;

  @Column({
    name: 'OBS_PRES',
    type: 'varchar2',
    length: 500,
    nullable: true,
  })
  obsPres?: string;

  @Column({
    name: 'EST_PRES',
    type: 'number',
    default: 1,
  })
  estPres!: number;

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
