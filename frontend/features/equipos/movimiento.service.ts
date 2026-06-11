import { apiGet, apiPost } from "@/services/api";

export const movimientosService = {
  /** Obtener todos los movimientos de equipos */
  findAll: (): Promise<any[]> => apiGet<any>("/movimientos"),

  /** Registrar un nuevo movimiento */
  create: (payload: any): Promise<any> => apiPost<any>("/movimientos", payload),
};
