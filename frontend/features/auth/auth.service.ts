import { apiRequest } from "@/services/api";
import type { AuthSession, LoginApiResponse, LoginCredentials } from "@/features/auth/auth.types";

function normalizeAuthSession(response: any): AuthSession {
  const data = response?.data;
  const token = data?.accessToken;

  if (!token) {
    throw new Error(response?.message || "La API no devolvió un token de autenticación.");
  }

  const u = data.usuario;
  return {
    token,
    user: u ? {
      id: u.idUsr,
      name: `${u.nomUsr || ""} ${u.apeUsr || ""}`.trim() || u.usuLogin,
      email: u.corUsr,
      role: u.idRol === 1 ? "Administrador" : u.idRol === 2 ? "Docente" : u.idRol === 3 ? "Estudiante" : "Técnico",
    } : null,
  };
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: credentials.email,
        password: credentials.password,
      }),
    });

    return normalizeAuthSession(response);
  },
};