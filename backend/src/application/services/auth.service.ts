import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from './usuarios.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { identifier, password } = loginDto;
    
    // Buscar usuario
    const usuario = await this.usuariosService.findByLoginOrEmail(identifier);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.passHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { passHash, ...result } = usuario;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    
    const payload = {
      sub: user.idUsr,
      usuLogin: user.usuLogin,
      corUsr: user.corUsr,
      idRol: user.idRol,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: user,
    };
  }

  async register(registerDto: RegisterDto) {
    // Reutilizamos el método create del servicio de usuarios, que ya hashea y valida
    const newUser = await this.usuariosService.create(registerDto);
    
    const payload = {
      sub: newUser.idUsr,
      usuLogin: newUser.usuLogin,
      corUsr: newUser.corUsr,
      idRol: newUser.idRol,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: newUser,
    };
  }
}
