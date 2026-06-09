import { apiRequest } from "@/services/api";
import type { AuthSession, LoginApiResponse, LoginCredentials } from "@/features/auth/auth.types";

function normalizeAuthSession(response: LoginApiResponse): AuthSession {
  const token = response.access_token ?? response.token ?? response.jwt;

  if (!token) {
    throw new Error("La API no devolvió un token de autenticación.");
  }

  return {
    token,
    user: response.user ?? null,
  };
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiRequest<LoginApiResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    return normalizeAuthSession(response);
  },
};