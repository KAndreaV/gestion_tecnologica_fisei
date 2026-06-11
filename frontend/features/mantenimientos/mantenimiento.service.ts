import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type { Mantenimiento } from "@/types/api";

const BASE = "/mantenimientos";

export const mantenimientosService = {
  /** Obtener todos los mantenimientos */
  findAll: (): Promise<Mantenimiento[]> => apiGet<Mantenimiento>(BASE),

  /** Obtener un mantenimiento por ID */
  findOne: (id: number): Promise<Mantenimiento> => apiGetOne<Mantenimiento>(`${BASE}/${id}`),

  /** Crear un nuevo mantenimiento */
  create: (payload: any): Promise<Mantenimiento> => apiPost<Mantenimiento, any>(BASE, payload),

  /** Actualizar un mantenimiento */
  update: (id: number, payload: any): Promise<Mantenimiento> => apiPut<Mantenimiento, any>(`${BASE}/${id}`, payload),

  /** Eliminar un mantenimiento */
  delete: (id: number): Promise<void> => apiDelete(`${BASE}/${id}`),
};
