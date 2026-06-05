import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'USUARIO' })
export class UsuarioOrm {
  @PrimaryColumn({ name: 'ID_USR', type: 'number' })
  idUsr: number;

  @Column({ name: 'NOM_USR', type: 'varchar2', length: 120 })
  nomUsr: string;

  @Column({ name: 'APE_USR', type: 'varchar2', length: 120 })
  apeUsr: string;

  @Column({ name: 'COR_USR', type: 'varchar2', length: 180, unique: true })
  corUsr: string;

  @Column({ name: 'TEL_USR', type: 'varchar2', length: 30, nullable: true })
  telUsr: string;

  @Column({ name: 'USU_LOGIN', type: 'varchar2', length: 80, unique: true })
  usuLogin: string;

  @Column({ name: 'PASS_HASH', type: 'varchar2', length: 255 })
  passHash: string;

  @Column({ name: 'EST_USR', type: 'number', default: 1 })
  estUsr: number;

  @Column({ name: 'ID_ROL', type: 'number' })
  idRol: number;

  @Column({ name: 'ID_DEP', type: 'number', nullable: true })
  idDep: number;

  @Column({ name: 'ID_UBI', type: 'number', nullable: true })
  idUbi: number;

  @Column({
    name: 'FEC_REGISTRO',
    type: 'date',
    default: () => 'SYSDATE',
  })
  fecRegistro: Date;
}
