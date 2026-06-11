import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuditoriaDto {
  @IsString()
  @MaxLength(80)
  tablaAfectada!: string;

  @IsString()
  @MaxLength(40)
  accion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  idRegistro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  nomUsuario?: string;
}

