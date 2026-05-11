import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO para actualizar un prestamo
 * Todos los campos son opcionales
 */
export class UpdatePrestamoDto {
  @IsOptional()
  @IsDateString()
  fecPres?: string;

  @IsOptional()
  @IsDateString()
  fecEntrega?: string;

  @IsOptional()
  @IsDateString()
  fecDevolucion?: string;

  @IsOptional()
  @IsString()
  obsPres?: string;

  @IsNumber()
  @IsOptional()
  estPres?: number;

  @IsNumber()
  @IsOptional()
  idUsr?: number;

  @IsNumber()
  @IsOptional()
  idEst?: number;
}
