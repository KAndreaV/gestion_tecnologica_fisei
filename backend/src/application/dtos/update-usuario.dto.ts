import { IsString, MaxLength, IsEmail, IsOptional, IsNumber, MinLength, IsIn } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(120, { message: 'El nombre no puede exceder los 120 caracteres' })
  nomUsr?: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(120, { message: 'El apellido no puede exceder los 120 caracteres' })
  apeUsr?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  @MaxLength(180, { message: 'El correo no puede exceder los 180 caracteres' })
  corUsr?: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(30, { message: 'El teléfono no puede exceder los 30 caracteres' })
  telUsr?: string;

  @IsString({ message: 'El nombre de usuario (login) debe ser texto' })
  @IsOptional()
  @MaxLength(80, { message: 'El nombre de usuario no puede exceder 80 caracteres' })
  usuLogin?: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsNumber({}, { message: 'El ID de rol debe ser un número' })
  @IsOptional()
  idRol?: number;

  @IsNumber({}, { message: 'El ID de departamento debe ser un número' })
  @IsOptional()
  idDep?: number;

  @IsNumber({}, { message: 'El ID de ubicación debe ser un número' })
  @IsOptional()
  idUbi?: number;

  @IsNumber({}, { message: 'El estado debe ser un número' })
  @IsOptional()
  @IsIn([0, 1], { message: 'El estado solo puede ser 0 (inactivo) o 1 (activo)' })
  estUsr?: number;
}
