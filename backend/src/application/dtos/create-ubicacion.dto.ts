import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUbicacionDto {
  @IsString()
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  nomUbi!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La descripción no puede exceder 300 caracteres' })
  desUbi?: string;

  @IsNumber()
  idDep!: number;
}
