import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateArticuloDto {

  @IsString()
  @MaxLength(180, { message: 'El nombre no puede exceder 180 caracteres' })
  nomArt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  desArt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El número de serie no puede exceder 100 caracteres' })
  serArt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'La marca no puede exceder 80 caracteres' })
  marArt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'El modelo no puede exceder 80 caracteres' })
  modArt?: string;

  @IsNumber()
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  canArt!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El valor debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El valor no puede ser negativo' })
  valArt!: number;

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsNumber()
  idCat!: number;

  @IsNumber()
  idEst!: number;

  @IsOptional()
  @IsNumber()
  idDep?: number;

  @IsOptional()
  @IsNumber()
  idUbi?: number;
}
