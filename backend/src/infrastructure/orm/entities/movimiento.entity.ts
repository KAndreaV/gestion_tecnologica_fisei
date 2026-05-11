import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla MOVIMIENTO
 * Oracle Database
 */
@Entity({ name: 'MOVIMIENTO' })
export class MovimientoOrm {
  @PrimaryColumn({
    name: 'ID_MOV',
    type: 'number',
  })
  idMov!: number;

  @Column({
    name: 'ID_PRES',
    type: 'number',
  })
  idPres!: number;

  @Column({
    name: 'TIPO_MOV',
    type: 'varchar2',
    length: 80,
  })
  tipoMov!: string;

  @Column({
    name: 'DESCRIPCION',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  descripcion?: string;

  @Column({
    name: 'FECHA_MOV',
    type: 'date',
  })
  fechaMov!: Date;
}
