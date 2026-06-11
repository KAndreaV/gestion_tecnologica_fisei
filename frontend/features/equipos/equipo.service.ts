import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type {
  Articulo,
  CreateArticuloPayload,
  UpdateArticuloPayload,
} from "@/types/api";

const BASE = "/articulos";

export const articulosService = {
  /** Obtener todos los artículos (equipos) */
  findAll: (): Promise<Articulo[]> =>
    apiGet<Articulo>(BASE),

  /** Obtener un artículo por ID */
  findOne: (id: number): Promise<Articulo> =>
    apiGetOne<Articulo>(`${BASE}/${id}`),

  /** Crear artículo */
  create: (payload: CreateArticuloPayload): Promise<Articulo> =>
    apiPost<Articulo, CreateArticuloPayload>(BASE, payload),

  /** Actualizar artículo */
  update: (id: number, payload: UpdateArticuloPayload): Promise<Articulo> =>
    apiPut<Articulo, UpdateArticuloPayload>(`${BASE}/${id}`, payload),

  /** Eliminar artículo (soft delete) */
  delete: (id: number): Promise<void> =>
    apiDelete(`${BASE}/${id}`),

  /** Filtrar por categoría */
  findByCategoria: (idCat: number): Promise<Articulo[]> =>
    apiGet<Articulo>(`${BASE}/categoria/${idCat}`),
};