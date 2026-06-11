import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type { Ubicacion, CreateUbicacionPayload } from "@/types/api";

const BASE = "/ubicaciones";

export const ubicacionesService = {
  findAll:  (): Promise<Ubicacion[]> => apiGet<Ubicacion>(BASE),
  findOne:  (id: number): Promise<Ubicacion> => apiGetOne<Ubicacion>(`${BASE}/${id}`),
  create:   (payload: CreateUbicacionPayload): Promise<Ubicacion> =>
              apiPost<Ubicacion, CreateUbicacionPayload>(BASE, payload),
  update:   (id: number, payload: Partial<CreateUbicacionPayload>): Promise<Ubicacion> =>
              apiPut<Ubicacion, Partial<CreateUbicacionPayload>>(`${BASE}/${id}`, payload),
  delete:   (id: number): Promise<void> => apiDelete(`${BASE}/${id}`),
};
