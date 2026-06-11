"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 13h8V3H3zM13 21h8v-8h-8zM13 3h8v6h-8zM3 21h8v-6H3z" />
      </svg>
    ),
  },
  {
    href: "/departamentos",
    label: "Departamentos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/laboratorios",
    label: "Ubicaciones",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    href: "/categorias",
    label: "Categorías",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    href: "/equipos",
    label: "Equipos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    href: "/prestamos",
    label: "Préstamos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
  },
  {
    href: "/mantenimientos",
    label: "Mantenimientos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    href: "/usuarios",
    label: "Usuarios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/devoluciones",
    label: "Devoluciones",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M16 16l-4-4-4 4M12 12V21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    ),
  },
  {
    href: "/auditoria",
    label: "Auditoría",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "AD";

  const displayName = user?.name ?? user?.email ?? "Administrador";

  return (
    <aside className="dashboard-sidebar" aria-label="Menú de navegación">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
            <path d="M12 4v16" />
          </svg>
        </div>
        <div>
          <h2>Gestión FISEI</h2>
          <p>Panel administrativo</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">Navegación</div>
      <nav className="sidebar-nav" aria-label="Secciones del sistema">
        {navigation
          .filter((item) => {
            const role = user?.role || "Administrador";
            if (role === "Administrador") return true;
            if (role === "Técnico" || role === "TECNICO") {
              return ["/dashboard", "/equipos", "/prestamos", "/devoluciones", "/mantenimientos"].includes(item.href);
            }
            // Docente y Estudiante usan el topbar (no sidebar)
            return false;
          })
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link", (pathname === item.href || pathname.startsWith(item.href + "/")) && "active")}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer" aria-label="Sesión activa">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="avatar">{initials}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: "13px", color: "#f0dfb4", marginBottom: "2px" }}>
              {displayName}
            </p>
            <p style={{ fontSize: "11px" }}>Sesión activa</p>
          </div>
        </div>
      </div>
    </aside>
  );
}