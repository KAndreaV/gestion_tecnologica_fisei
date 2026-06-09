import { apiRequest } from "@/services/api";
import type { Usuario, UsuarioPayload } from "@/features/usuarios/usuario.types";

export const usuarioService = {
  list: () => apiRequest<Usuario[]>("/usuarios"),
  create: (payload: UsuarioPayload) =>
    apiRequest<Usuario>("/usuarios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};