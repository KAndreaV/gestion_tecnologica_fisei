"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/laboratorios", label: "Laboratorios", icon: "L" },
  { href: "/usuarios", label: "Usuarios", icon: "U" },
  { href: "/equipos", label: "Equipos", icon: "E" },
  { href: "/reportes", label: "Reportes", icon: "R" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
            <path d="M12 4v16" />
          </svg>
        </div>
        <div>
          <h2>Gestión de Laboratorios</h2>
          <p>Panel administrativo</p>
        </div>
      </div>

      <div>
        <div className="sidebar-section">Navegación</div>
        <nav className="sidebar-nav" aria-label="Secciones del sistema">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link", pathname === item.href && "active")}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="sidebar-note">Backend conectado en http://localhost:3000</p>
    </aside>
  );
}