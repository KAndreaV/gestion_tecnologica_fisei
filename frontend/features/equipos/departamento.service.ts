import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type { Departamento } from "@/types/api";

const BASE = "/departamentos";

export interface CreateDepartamentoPayload {
  nomDep: string;
  desDep?: string;
}

export const departamentosService = {
  findAll: (): Promise<Departamento[]> => apiGet<Departamento>(BASE),
  findOne: (id: number): Promise<Departamento> => apiGetOne<Departamento>(`${BASE}/${id}`),
  create: (payload: CreateDepartamentoPayload): Promise<Departamento> =>
    apiPost<Departamento, CreateDepartamentoPayload>(BASE, payload),
  update: (id: number, payload: Partial<CreateDepartamentoPayload>): Promise<Departamento> =>
    apiPut<Departamento, Partial<CreateDepartamentoPayload>>(`${BASE}/${id}`, payload),
  delete: (id: number): Promise<void> => apiDelete(`${BASE}/${id}`),
};
