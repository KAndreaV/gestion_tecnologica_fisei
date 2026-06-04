import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMovimientoDto {
  @IsOptional()
  @IsNumber()
  idPres?: number;

  @IsString()
  @MaxLength(80)
  tipoMov!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;
}
