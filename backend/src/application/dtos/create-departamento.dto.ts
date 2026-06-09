import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  nomDep!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La descripción no puede exceder 300 caracteres' })
  desDep?: string;
}
