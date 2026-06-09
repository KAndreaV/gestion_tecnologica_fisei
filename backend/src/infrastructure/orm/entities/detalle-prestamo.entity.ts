import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ArticuloOrm } from './articulo.entity';
import { PrestamoOrm } from './prestamo.entity';

/**
 * Entidad ORM para la tabla DETALLE_PRESTAMO
 * Usa clave primaria compuesta: ID_PRES + ID_ART
 */
@Entity({ name: 'DETALLE_PRESTAMO' })
export class DetallePrestamoOrm {
  @PrimaryColumn({
    name: 'ID_PRES',
    type: 'number',
  })
  idPres!: number;

  @PrimaryColumn({
    name: 'ID_ART',
    type: 'number',
  })
  idArt!: number;

  @Column({
    name: 'CAN_PRE',
    type: 'number',
    default: 1,
  })
  canPre!: number;

  @ManyToOne(() => PrestamoOrm, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'ID_PRES',
    referencedColumnName: 'idPres',
  })
  prestamo!: PrestamoOrm;

  @ManyToOne(() => ArticuloOrm)
  @JoinColumn({
    name: 'ID_ART',
    referencedColumnName: 'idArt',
  })
  articulo!: ArticuloOrm;
}
