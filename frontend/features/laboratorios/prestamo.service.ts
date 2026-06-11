import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type {
  Prestamo,
  CreatePrestamoPayload,
  CreateDetallePrestamoPayload,
  DetallePrestamo,
} from "@/types/api";

const BASE = "/prestamos";

export const prestamosService = {
  findAll: (): Promise<Prestamo[]> => apiGet<Prestamo>(BASE),
  findOne: (id: number): Promise<Prestamo> => apiGetOne<Prestamo>(`${BASE}/${id}`),
  create:  (payload: CreatePrestamoPayload): Promise<Prestamo> =>
             apiPost<Prestamo, CreatePrestamoPayload>(BASE, payload),
  update:  (id: number, payload: Partial<CreatePrestamoPayload>): Promise<Prestamo> =>
             apiPut<Prestamo, Partial<CreatePrestamoPayload>>(`${BASE}/${id}`, payload),
  delete:  (id: number): Promise<void> => apiDelete(`${BASE}/${id}`),

  // Detalles
  getDetalles: (id: number): Promise<DetallePrestamo[]> =>
    apiGet<DetallePrestamo>(`${BASE}/${id}/detalles`),
  addDetalle: (id: number, payload: CreateDetallePrestamoPayload): Promise<DetallePrestamo> =>
    apiPost<DetallePrestamo, CreateDetallePrestamoPayload>(`${BASE}/${id}/detalles`, payload),
};
