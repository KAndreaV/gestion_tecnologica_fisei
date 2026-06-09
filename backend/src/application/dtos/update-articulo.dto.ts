import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

/**
 * DTO para actualizar un artículo
 * Todos los campos son opcionales
 */
export class UpdateArticuloDto {
  @IsString()
  @IsOptional()
  @MaxLength(180, { message: 'El nombre no puede exceder 180 caracteres' })
  nomArt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  desArt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El número de serie no puede exceder 100 caracteres' })
  serArt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80, { message: 'La marca no puede exceder 80 caracteres' })
  marArt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80, { message: 'El modelo no puede exceder 80 caracteres' })
  modArt?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  canArt?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El valor debe ser un número con máximo 2 decimales' },
  )
  @IsOptional()
  @Min(0, { message: 'El valor no puede ser negativo' })
  valArt?: number;

  @IsNumber()
  @IsOptional()
  estArt?: number;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty({ message: 'La categoría no puede estar vacía' })
  idCat?: number;

  @IsNumber()
  @IsOptional()
  idEst?: number;

  @IsNumber()
  @IsOptional()
  idDep?: number;

  @IsNumber()
  @IsOptional()
  idUbi?: number;
}
