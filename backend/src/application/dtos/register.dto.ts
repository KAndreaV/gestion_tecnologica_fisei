import { CreateUsuarioDto } from './create-usuario.dto';

export class RegisterDto extends CreateUsuarioDto {
  // Hereda todas las validaciones de CreateUsuarioDto
  // Esto incluye: nombre, apellido, correo, login, password, rol, etc.
}
