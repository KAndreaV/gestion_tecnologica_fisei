import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMantenimientoDto {
  @IsNumber()
  idArt!: number;

  @IsNumber()
  idUsr!: number;

  @IsString()
  tipoMan!: string;

  @IsOptional()
  @IsString()
  descMan?: string;

  @IsOptional()
  @IsDateString()
  fecMan?: string;
}
