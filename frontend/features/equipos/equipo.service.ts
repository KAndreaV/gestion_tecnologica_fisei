import { apiRequest } from "@/services/api";
import type { Equipo, EquipoPayload } from "@/features/equipos/equipo.types";

export const equipoService = {
  list: () => apiRequest<Equipo[]>("/equipos"),
  create: (payload: EquipoPayload) =>
    apiRequest<Equipo>("/equipos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};