import { appConfig } from "@/lib/config";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/constants";
import type { ApiListResponse, ApiResponse } from "@/types/api";

type ApiRequestOptions = RequestInit & {
  responseType?: "json" | "text";
};

async function readResponse(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}
function toCamelCase(str: string): string {
  // If it's already camelCased (contains lowercase and uppercase mixed, and no underscores), keep it
  if (/[a-z]/.test(str) && /[A-Z]/.test(str) && !str.includes("_")) {
    return str;
  }
  // If it's already lowercase and doesn't contain underscores, keep it
  if (/^[a-z0-9]+$/.test(str)) {
    return str;
  }
  // Otherwise, convert from snake_case or uppercase to camelCase
  return str.toLowerCase().replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
}

export function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamelCase(v));
  } else if (obj !== null && typeof obj === "object") {
    if (typeof FormData !== "undefined" && obj instanceof FormData) {
      return obj;
    }
    if (obj instanceof Date) {
      return obj;
    }
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toCamelCase(key)]: convertKeysToCamelCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

/** Petición HTTP genérica con JWT automático */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const body = await readResponse(response);
  const camelCasedBody = convertKeysToCamelCase(body);

  if (!response.ok) {
    const message =
      typeof camelCasedBody === "object" && camelCasedBody !== null && "message" in camelCasedBody
        ? String((camelCasedBody as { message?: unknown }).message ?? `Error HTTP ${response.status}`)
        : `Error HTTP ${response.status}`;

    throw new Error(message);
  }

  return camelCasedBody as T;
}

/**
 * Petición que espera una respuesta envuelta { success, data, total? }
 * y devuelve solo `data`.
 */
export async function apiGet<T>(path: string): Promise<T[]> {
  const res = await apiRequest<ApiListResponse<T>>(path);
  return res.data;
}

export async function apiGetOne<T>(path: string): Promise<T> {
  const res = await apiRequest<ApiResponse<T>>(path);
  return res.data;
}

export async function apiPost<T, P = unknown>(path: string, payload: P): Promise<T> {
  const res = await apiRequest<ApiResponse<T>>(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function apiPut<T, P = unknown>(path: string, payload: P): Promise<T> {
  const res = await apiRequest<ApiResponse<T>>(path, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function apiDelete(path: string): Promise<void> {
  await apiRequest<ApiResponse<null>>(path, { method: "DELETE" });
}