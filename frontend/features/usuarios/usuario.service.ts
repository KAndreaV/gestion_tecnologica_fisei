import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type {
  Usuario,
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
} from "@/types/api";

const BASE = "/usuarios";

export const usuariosService = {
  findAll: (): Promise<Usuario[]> =>
    apiGet<Usuario>(BASE),

  findOne: (id: number): Promise<Usuario> =>
    apiGetOne<Usuario>(`${BASE}/${id}`),

  create: (payload: CreateUsuarioPayload): Promise<Usuario> =>
    apiPost<Usuario, CreateUsuarioPayload>(BASE, payload),

  update: (id: number, payload: UpdateUsuarioPayload): Promise<Usuario> =>
    apiPut<Usuario, UpdateUsuarioPayload>(`${BASE}/${id}`, payload),

  delete: (id: number): Promise<void> =>
    apiDelete(`${BASE}/${id}`),
};