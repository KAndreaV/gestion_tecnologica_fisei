"use client";

import { useEffect, useState } from "react";
import { laboratorioService } from "@/features/laboratorios/laboratorio.service";
import type { Laboratorio } from "@/features/laboratorios/laboratorio.types";

export function useLaboratorios() {
  const [items, setItems] = useState<Laboratorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLaboratorios = async () => {
      try {
        setIsLoading(true);
        const data = await laboratorioService.list();
        setItems(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los laboratorios.");
      } finally {
        setIsLoading(false);
      }
    };

    loadLaboratorios();
  }, []);

  return { items, isLoading, error };
}