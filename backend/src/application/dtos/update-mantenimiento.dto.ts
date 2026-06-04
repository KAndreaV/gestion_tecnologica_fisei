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
  @IsString()
  tipoMan?: string;

  @IsOptional()
  @IsString()
  descMan?: string;

  @IsOptional()
  @IsDateString()
  fecMan?: string;

  @IsNumber()
  @IsOptional()
  estMan?: number;
}
