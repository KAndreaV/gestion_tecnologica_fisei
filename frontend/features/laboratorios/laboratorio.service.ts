import { apiRequest } from "@/services/api";
import type { Laboratorio, LaboratorioPayload } from "@/features/laboratorios/laboratorio.types";

export const laboratorioService = {
  list: () => apiRequest<Laboratorio[]>("/laboratorios"),
  create: (payload: LaboratorioPayload) =>
    apiRequest<Laboratorio>("/laboratorios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};