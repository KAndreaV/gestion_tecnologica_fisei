import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  nomCat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La descripción no puede exceder 300 caracteres' })
  desCat?: string;
}
