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
    name: 'TABLA_AFECTADA',
    type: 'varchar2',
    length: 80,
  })
  tablaAfectada!: string;

  @Column({
    name: 'ACCION',
    type: 'varchar2',
    length: 40,
  })
  accion!: string;

  @Column({
    name: 'DESCRIPCION',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  descripcion?: string;

  @Column({
    name: 'FECHA_AUD',
    type: 'date',
  })
  fechaAud!: Date;
}
