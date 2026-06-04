import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMantenimientoDto {
  @IsNumber()
  idArt!: number;

  @IsNumber()
  idUsr!: number;

  @IsNumber()
  idEst!: number;

  @IsString()
  tipMan!: string;

  @IsString()
  desMan!: string;

  @IsOptional()
  @IsDateString()
  fecIni?: string;

  @IsOptional()
  @IsDateString()
  fecFin?: string;

  @IsOptional()
  @IsString()
  obsMen?: string;
}
