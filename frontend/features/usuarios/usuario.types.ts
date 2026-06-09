export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol?: string;
}

export interface UsuarioPayload {
  nombre: string;
  email: string;
  rol?: string;
}