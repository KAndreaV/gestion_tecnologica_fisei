import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO para actualizar un mantenimiento
 * Todos los campos son opcionales
 */
export class UpdateMantenimientoDto {
  @IsOptional()
  @IsNumber()
  idArt?: number;

  @IsOptional()
  @IsNumber()
  idUsr?: number;

  @IsOptional()
  @IsNumber()
  idEst?: number;

  @IsOptional()
  @IsString()
  tipMan?: string;

  @IsOptional()
  @IsString()
  desMan?: string;

  @IsOptional()
  @IsDateString()
  fecIni?: string;

  @IsOptional()
  @IsDateString()
  fecFin?: string;

  @IsOptional()
  @IsString()
  obsMen?: string;

  @IsNumber()
  @IsOptional()
  estMan?: number;
}
