"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const auth = useAuth();

  return (
    <header className="dashboard-topbar">
      <div className="topbar-title">
        <p>Gestión de Laboratorios</p>
        <h1>Admin Panel</h1>
      </div>

      <div className="topbar-actions">
        <span className="user-pill">{auth.user?.name ?? auth.user?.email ?? "Administrador"}</span>
        <Button variant="ghost" type="button" onClick={auth.logout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}