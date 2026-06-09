export interface Equipo {
  id: number;
  nombre: string;
  codigo?: string;
  estado?: string;
}

export interface EquipoPayload {
  nombre: string;
  codigo?: string;
  estado?: string;
}