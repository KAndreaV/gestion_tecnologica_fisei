import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type { Categoria, CreateCategoriaPayload } from "@/types/api";

const BASE = "/categorias";

export const categoriasService = {
  findAll:  (): Promise<Categoria[]> => apiGet<Categoria>(BASE),
  findOne:  (id: number): Promise<Categoria> => apiGetOne<Categoria>(`${BASE}/${id}`),
  create:   (payload: CreateCategoriaPayload): Promise<Categoria> =>
              apiPost<Categoria, CreateCategoriaPayload>(BASE, payload),
  update:   (id: number, payload: Partial<CreateCategoriaPayload>): Promise<Categoria> =>
              apiPut<Categoria, Partial<CreateCategoriaPayload>>(`${BASE}/${id}`, payload),
  delete:   (id: number): Promise<void> => apiDelete(`${BASE}/${id}`),
};
