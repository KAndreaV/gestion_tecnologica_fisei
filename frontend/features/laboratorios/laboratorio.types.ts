export interface Laboratorio {
  id: number;
  nombre: string;
  codigo?: string;
  estado?: string;
}

export interface LaboratorioPayload {
  nombre: string;
  codigo?: string;
  estado?: string;
}