import {
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateArticuloDto {

  @IsString()
  nomArt!: string;

  @IsOptional()
  @IsString()
  desArt?: string;

  @IsOptional()
  @IsString()
  serArt?: string;

  @IsOptional()
  @IsString()
  marArt?: string;

  @IsOptional()
  @IsString()
  modArt?: string;

  @IsNumber()
  canArt!: number;

  @IsNumber()
  valArt!: number;

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