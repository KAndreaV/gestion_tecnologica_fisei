import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePrestamoDto {
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
  idUsr!: number;

  @IsNumber()
  idEst!: number;
}
