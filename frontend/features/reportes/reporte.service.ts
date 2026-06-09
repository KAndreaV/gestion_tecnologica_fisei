import { apiRequest } from "@/services/api";
import type { ReporteResumen } from "@/features/reportes/reporte.types";

export const reporteService = {
  resumen: () => apiRequest<ReporteResumen[]>("/reportes/resumen"),
};