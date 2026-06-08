import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEstadoDto {
  @IsString()
  @MaxLength(80, { message: 'El nombre no puede exceder 80 caracteres' })
  nomEst!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La descripción no puede exceder 300 caracteres' })
  desEst?: string;

  @IsString()
  @MaxLength(40, { message: 'El tipo no puede exceder 40 caracteres' })
  tipoEst!: string;
}
