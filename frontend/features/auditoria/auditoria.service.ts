import { apiGet } from "@/services/api";

export interface AuditoriaLog {
  idAud: number;
  tablaAfectada: string;
  accion: string;
  descripcion?: string;
  fechaAud: string;
}

export const auditoriaService = {
  findAll: (): Promise<AuditoriaLog[]> => apiGet<AuditoriaLog>("/auditoria"),
};
