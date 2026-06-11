import { apiDelete, apiGet, apiGetOne, apiPost, apiPut } from "@/services/api";
import type { Estado } from "@/types/api";

const BASE = "/estados";

export const estadosService = {
  findAll: (): Promise<Estado[]> => apiGet<Estado>(BASE),
  findOne: (id: number): Promise<Estado> => apiGetOne<Estado>(`${BASE}/${id}`),
};
