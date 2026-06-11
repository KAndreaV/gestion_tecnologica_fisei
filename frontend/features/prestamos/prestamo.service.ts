import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";

const BASE = "/prestamos";

export interface CreatePrestamoPayload {
  fecPres?: string;
  fecEntrega?: string;
  fecDevolucion?: string;
  obsPres?: string;
  idUsr: number;
  idEst: number;
}

export interface UpdatePrestamoPayload {
  fecPres?: string;
  fecEntrega?: string;
  fecDevolucion?: string;
  obsPres?: string;
  estPres?: number;
  idUsr?: number;
  idEst?: number;
}

export interface CreateDetallePrestamoPayload {
  idArt: number;
  canPre: number;
}

export const prestamosService = {
  findAll: (): Promise<any[]> => apiGet<any>(BASE),
  findOne: (id: number): Promise<any> => apiGetOne<any>(`${BASE}/${id}`),
  create: (payload: CreatePrestamoPayload): Promise<any> =>
    apiPost<any, CreatePrestamoPayload>(BASE, payload),
  update: (id: number, payload: UpdatePrestamoPayload): Promise<any> =>
    apiPut<any, UpdatePrestamoPayload>(`${BASE}/${id}`, payload),
  delete: (id: number): Promise<void> => apiDelete(`${BASE}/${id}`),
  
  // Detalle de préstamos
  getDetalles: (prestamoId: number): Promise<any[]> =>
    apiGet<any>(`${BASE}/${prestamoId}/detalles`),
  addDetalle: (prestamoId: number, payload: CreateDetallePrestamoPayload): Promise<any> =>
    apiPost<any, CreateDetallePrestamoPayload>(`${BASE}/${prestamoId}/detalles`, payload),
  updateDetalle: (prestamoId: number, idArt: number, canPre: number): Promise<any> =>
    apiPut<any, { canPre: number }>(`${BASE}/${prestamoId}/detalles/${idArt}`, { canPre }),
  removeDetalle: (prestamoId: number, idArt: number): Promise<void> =>
    apiDelete(`${BASE}/${prestamoId}/detalles/${idArt}`),
};
