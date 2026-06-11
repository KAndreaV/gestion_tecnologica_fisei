import type { Usuario } from "@/types/api";

export interface UsuarioVM {
  id:            string;
  nombre:        string;
  email:         string;
  rol:           string;
  estado:        "Activo" | "Inactivo" | "Suspendido";
  ultimoAcceso:  string;
  raw:           Usuario;
}