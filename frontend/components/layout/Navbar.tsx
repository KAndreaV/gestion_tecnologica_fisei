"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";

const pageTitles: Record<string, { title: string; subtitle: string; badge: string }> = {
  "/dashboard": { title: "Panel ejecutivo", subtitle: "Vista general del estado operativo del sistema.", badge: "Producción" },
  "/laboratorios": { title: "Laboratorios", subtitle: "Administración de espacios y disponibilidad.", badge: "Módulo" },
  "/equipos": { title: "Equipos", subtitle: "Inventario y estado de equipos tecnológicos.", badge: "Inventario" },
  "/usuarios": { title: "Usuarios", subtitle: "Gestión de perfiles, roles y permisos.", badge: "Módulo" },
  "/reportes": { title: "Reportes", subtitle: "Indicadores, exportaciones y seguimiento.", badge: "Módulo" },
  "/auditoria": { title: "Auditoría", subtitle: "Trazabilidad de operaciones y base de datos.", badge: "Seguridad" },
  "/nosotros": { title: "Nosotros", subtitle: "Nuestra visión, misión y compromiso institucional.", badge: "Nosotros" },
  "/prestamos": { title: "Préstamos", subtitle: "Administración de solicitudes y entregas.", badge: "Gestión" },
};

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);



  const info = pageTitles[pathname] ?? { title: "Sistema", subtitle: "", badge: "Panel" };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "AD";

  const displayName = user?.name ?? user?.email ?? "Administrador";

  const role = user?.role || "";
  const isUser = role === "Docente" || role === "Estudiante";

  return (
    <header className="dashboard-topbar scrolled">      {/* Left – Brand & Tabs (if Docente/Estudiante) or Search (if Admin/Tecnico) */}
      <div className="topbar-left" style={{ gap: "24px" }}>
        {isUser ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="brand-logo" style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #061544ff",
                background: "linear-gradient(150deg, #06285eff 0%, #1347b5ff 100%)",
                display: "grid",
                placeItems: "center",
                color: "#ffffff"
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                  <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
                </svg>
              </div>
              <span className="brand-text" style={{ fontWeight: 800, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>FISEI</span>
            </div>

            <nav className="topbar-nav-links" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Link
                href="/dashboard"
                className={`topbar-nav-link ${pathname === "/dashboard" ? "active" : ""}`}
              >
                Inicio
              </Link>
              <Link
                href="/nosotros"
                className={`topbar-nav-link ${pathname === "/nosotros" ? "active" : ""}`}
              >
                Nosotros
              </Link>
              <Link
                href="/equipos"
                className={`topbar-nav-link ${pathname.startsWith("/equipos") ? "active" : ""}`}
              >
                Equipos
              </Link>

              {/* Estudiante: only see their own loans */}
              {role === "Estudiante" && (
                <Link
                  href="/mis-solicitudes"
                  className={`topbar-nav-link ${pathname === "/mis-solicitudes" ? "active" : ""}`}
                >
                  Mis Solicitudes
                </Link>
              )}

              {/* Docente: full management */}
              {role === "Docente" && (
                <>
                  <Link
                    href="/prestamos"
                    className={`topbar-nav-link ${pathname === "/prestamos" ? "active" : ""}`}
                  >
                    Préstamos
                  </Link>
                  <Link
                    href="/mis-solicitudes"
                    className={`topbar-nav-link ${pathname === "/mis-solicitudes" ? "active" : ""}`}
                  >
                    Mis Solicitudes
                  </Link>
                  <Link
                    href="/devoluciones"
                    className={`topbar-nav-link ${pathname === "/devoluciones" ? "active" : ""}`}
                    style={{ position: "relative" }}
                  >
                    Devoluciones
                  </Link>
                </>
              )}
            </nav>
          </>
        ) : (
          <label className="search-pill" htmlFor="topbar-search" aria-label="Buscar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              id="topbar-search"
              type="search"
              placeholder="Buscar equipo, usuario o solicitud…"
              aria-label="Buscar en el sistema"
            />
          </label>
        )}
      </div>

      {/* Right – Badge + User + Logout */}
      <div className="topbar-right">
        <span className="badge">{info.badge}</span>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            aria-label="Notificaciones"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: "relative" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: "18px", height: "18px" }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notif-badge" style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "#dc2626",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 0 0 2px #ffffff"
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-dropdown" style={{
              position: "absolute",
              top: "46px",
              right: 0,
              width: "320px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              zIndex: 100,
              padding: "12px",
              color: "#1e293b"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>Notificaciones</strong>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: "#172554", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                    Leer Todo
                  </button>
                  <button onClick={clearAll} style={{ background: "none", border: "none", color: "#64748b", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                    Limpiar
                  </button>
                </div>
              </div>
              <div className="notif-list" style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} style={{
                      padding: "8px",
                      borderRadius: "6px",
                      background: n.read ? "#f8fafc" : "#eff6ff",
                      border: n.read ? "1px solid #f1f5f9" : "1px solid #bfdbfe",
                      fontSize: "12.5px",
                      textAlign: "left"
                    }}>
                      <div style={{ fontWeight: 700, color: n.read ? "#334155" : "#172554", marginBottom: "2px" }}>{n.title}</div>
                      <div style={{ color: "#475569", lineHeight: "1.4" }}>{n.message}</div>
                      <small style={{ color: "#94a3b8", display: "block", marginTop: "4px", fontSize: "10px" }}>
                        {new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "12px" }}>
                    No tienes notificaciones
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Chip */}
        <div className="user-chip" aria-label={`Usuario: ${displayName}`}>
          <span className="avatar" aria-hidden="true">{initials}</span>
          <span>{displayName}</span>
        </div>

        {/* Logout */}
        <button
          className="btn-ghost"
          type="button"
          onClick={logout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Salir
        </button>
      </div>
    </header>
  );
}
