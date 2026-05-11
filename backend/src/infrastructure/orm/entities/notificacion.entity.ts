import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Entidad ORM para la tabla NOTIFICACION
 * Oracle Database
 */
@Entity({ name: 'NOTIFICACION' })
export class NotificacionOrm {
  @PrimaryColumn({
    name: 'ID_NOT',
    type: 'number',
  })
  idNot!: number;

  @Column({
    name: 'ID_USR',
    type: 'number',
    nullable: true,
  })
  idUsr?: number;

  @Column({
    name: 'MENSAJE',
    type: 'varchar2',
    length: 1000,
  })
  mensaje!: string;

  @Column({
    name: 'TIPO_NOT',
    type: 'varchar2',
    length: 80,
  })
  tipoNot!: string;

  @Column({
    name: 'FECHA_NOT',
    type: 'date',
  })
  fechaNot!: Date;
}
