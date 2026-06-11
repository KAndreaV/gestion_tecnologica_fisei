"use client";

import { useEffect, useState } from "react";
import { articulosService } from "@/features/equipos/equipo.service";
import { prestamosService } from "@/features/prestamos/prestamo.service";
import { mantenimientosService } from "@/features/mantenimientos/mantenimiento.service";
import { useAuth } from "@/hooks/useAuth";
import type { Articulo } from "@/types/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "";
  const isUser = role === "Docente" || role === "Estudiante";
  const isAdmin = role === "Administrador";

  const [stats, setStats] = useState({
    totalArticulos: 0,
    disponibles: 0,
    prestados: 0,
    enMantenimiento: 0,
    vencidos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUser) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const [artList, presList, maintList] = await Promise.all([
          articulosService.findAll().catch(() => [] as Articulo[]),
          prestamosService.findAll().catch(() => [] as any[]),
          mantenimientosService.findAll().catch(() => [] as any[]),
        ]);

        // 1. Total de artículos: Sum of canArt of all articles
        const totalArticulos = (artList || []).reduce((acc, curr) => acc + curr.canArt, 0);

        // 2. Disponibles: Sum of canArt where state is 2 (DISPONIBLE)
        const disponibles = (artList || []).filter(a => a.idEst === 2).reduce((acc, curr) => acc + curr.canArt, 0);

        // 3. Prestados: Sum of canArt where state is 3 (PRESTADO)
        const prestados = (artList || []).filter(a => a.idEst === 3).reduce((acc, curr) => acc + curr.canArt, 0);

        // 4. En mantenimiento: Sum of canArt where state is 5 (EN_MANTENIMIENTO)
        const enMantenimiento = (artList || []).filter(a => a.idEst === 5).reduce((acc, curr) => acc + curr.canArt, 0);

        // 5. Vencidos: Count of active loans (estPres === 1) where expected return date has passed
        const todayStr = new Date().toISOString().split("T")[0];
        const vencidos = (presList || []).filter(p => {
          if (p.estPres !== 1 || !p.fecDevolucion) return false;
          const devDate = new Date(p.fecDevolucion).toISOString().split("T")[0];
          return devDate < todayStr;
        }).length;

        setStats({
          totalArticulos,
          disponibles,
          prestados,
          enMantenimiento,
          vencidos,
        });
      } catch (err) {
        console.error("Error al cargar estadísticas de dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isUser]);

  const dashboardStats = [
    {
      label: "Total de artículos",
      value: loading ? "..." : String(stats.totalArticulos),
      note: "Stock total en inventario",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: "18px", height: "18px", color: "#2563eb" }}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      ),
    },
    {
      label: "Disponibles",
      value: loading ? "..." : String(stats.disponibles),
      note: "Listos para asignación",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: "18px", height: "18px", color: "#16a34a" }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Prestados",
      value: loading ? "..." : String(stats.prestados),
      note: "En posesión de usuarios",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: "18px", height: "18px", color: "#0284c7" }}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      ),
    },
    {
      label: "En mantenimiento",
      value: loading ? "..." : String(stats.enMantenimiento),
      note: "En revisión técnica",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: "18px", height: "18px", color: "#ea580c" }}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      label: "Vencidos",
      value: loading ? "..." : String(stats.vencidos),
      note: "Préstamos fuera de plazo",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: "18px", height: "18px", color: "#dc2626" }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  const quickActions = isAdmin 
    ? [
        {
          label: "Registrar nuevo equipo",
          desc:  "Alta rápida con número de serie",
          href:  "/equipos",
          variant: "btn-primary" as const,
          btnLabel: "Crear",
        },
        {
          label: "Gestionar laboratorio",
          desc:  "Actualizar disponibilidad y horarios",
          href:  "/laboratorios",
          variant: "btn-secondary" as const,
          btnLabel: "Gestionar",
        },
        {
          label: "Exportar reporte",
          desc:  "Inventario consolidado en PDF",
          href:  "/reportes",
          variant: "btn-secondary" as const,
          btnLabel: "Exportar",
        },
        {
          label: "Administrar usuarios",
          desc:  "Roles y permisos del sistema",
          href:  "/usuarios",
          variant: "btn-secondary" as const,
          btnLabel: "Gestionar",
        },
      ]
    : [
        {
          label: "Consultar artículos",
          desc:  "Ver disponibilidad de equipos tecnológicos",
          href:  "/equipos",
          variant: "btn-primary" as const,
          btnLabel: "Consultar",
        },
        {
          label: "Solicitar préstamo",
          desc:  "Iniciar una nueva solicitud de equipo",
          href:  "/equipos",
          variant: "btn-secondary" as const,
          btnLabel: "Solicitar",
        },
      ];

  if (isUser) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 0 24px" }}>
        {/* Hero Section */}
        <section className="hero-banner" style={{ backgroundImage: "url('/images/laboratorio-bg.png')" }}>
          <div className="hero-banner-content">
            <p className="section-kicker" style={{ color: "#ffffff", fontWeight: 800, marginBottom: "4px" }}>Vinculación Academia e Industria</p>
            <h1 style={{ color: "#ffffff" }}>Gestión Tecnológica FISEI</h1>
            <p style={{ color: "#ffffff" }}>
              Ecosistema digital para la optimización, préstamo y control de recursos tecnológicos de la facultad en tiempo real.
            </p>
          </div>
        </section>

        {/* Featured Banner */}
        <div className="surface" style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "24px",
          padding: "32px",
          marginBottom: "24px",
          alignItems: "center"
        }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1e3a8a", marginBottom: "12px" }}>
              Potenciando la Excelencia Académica y Profesional
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", marginBottom: "20px" }}>
              Nuestra plataforma unifica el inventario tecnológico de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial.
              Facilitamos el acceso a equipos de computación, desarrollo, microcontroladores, herramientas de red e instrumental
              de medición para docentes y estudiantes. Conectamos la enseñanza en el aula con la práctica y experimentación del mundo real.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <a href="/equipos" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none", color: "#fff" }}>
                Ver Catálogo de Equipos
              </a>
              <a href="/nosotros" className="btn-secondary" style={{ display: "inline-flex", textDecoration: "none" }}>
                Saber más sobre FISEI
              </a>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src="/images/academic_industry.png"
              alt="Colaboración Academia-Industria"
              style={{
                width: "100%",
                maxHeight: "240px",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }}
            />
          </div>
        </div>

        {/* Vision Columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <article className="surface" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                display: "grid",
                placeItems: "center",
                color: "#1e40af"
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e3a8a", margin: 0 }}>Visión Ética y Ambiental</h3>
            </div>
            <p style={{ color: "#475569", lineHeight: "1.6", fontSize: "14px", margin: 0 }}>
              Promovemos el desarrollo responsable reduciendo la huella de carbono y optimizando el ciclo de vida de cada activo tecnológico.
              Nuestros procesos de mantenimiento preventivo y desecho responsable previenen la acumulación innecesaria de desechos electrónicos,
              contribuyendo a la sostenibilidad institucional.
            </p>
          </article>

          <article className="surface" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                display: "grid",
                placeItems: "center",
                color: "#1e40af"
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px" }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e3a8a", margin: 0 }}>Interdisciplinariedad</h3>
            </div>
            <p style={{ color: "#475569", lineHeight: "1.6", fontSize: "14px", margin: 0 }}>
              Fomentamos la colaboración transversal entre carreras de la FISEI (Sistemas, Telecomunicaciones, Automatización, Software).
              Al centralizar y compartir recursos tecnológicos avanzados, permitimos que estudiantes de diferentes disciplinas
              desarrollen proyectos conjuntos e innovadores utilizando hardware común de alta gama.
            </p>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <section className="page-header">
        <p className="section-kicker" style={{ color: "#1e3a8a", fontWeight: 700 }}>Resumen general</p>
        <h1>Panel ejecutivo</h1>
        <p style={{ color: "#475569" }}>Control diario del inventario, laboratorios y reportes con alertas en tiempo real.</p>
      </section>

      {/* Metrics */}
      <section className="stat-grid" aria-label="Métricas principales" style={{ gridTemplateColumns: `repeat(${dashboardStats.length}, 1fr)` }}>
        {dashboardStats.map((metric) => (
          <article className="stat-card" key={metric.label}>
            <div className="metric-head">
              <span style={{ color: "#475569", fontWeight: 600 }}>{metric.label}</span>
              {metric.icon}
            </div>
            <strong style={{ color: "#0f172a" }}>{metric.value}</strong>
            <p style={{ color: "#64748b" }}>{metric.note}</p>
          </article>
        ))}
      </section>

      {/* Two-column section */}
      <section className="two-col" style={{ marginTop: "20px" }}>
        {/* Banner informativo / bienvenida */}
        <article className="surface" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "10px", color: "#1e3a8a" }}>¡Bienvenido al sistema FISEI!</h2>
          <p style={{ lineHeight: "1.6", color: "#475569" }}>
            Esta plataforma unifica el control de laboratorios de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial.
            Puedes navegar a través de los módulos laterales para gestionar el inventario de equipos tecnológicos,
            {isAdmin ? " añadir o actualizar laboratorios, registrar la entrega de préstamos o auditar las cuentas de usuario." : " consultar la disponibilidad de artículos o realizar solicitudes de préstamo."}
          </p>
          <div style={{ marginTop: "20px" }}>
            <span className="badge" style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe", color: "#2563eb", fontWeight: 700 }}>
              Estado de conexión: Estable
            </span>
          </div>
        </article>

        {/* Quick actions */}
        <article className="surface">
          <div className="block-head">
            <h2 style={{ color: "#0f172a" }}>Acciones clave</h2>
          </div>
          <div className="mini-list">
            {quickActions.map((action) => (
              <div className="mini-item" key={action.label} style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>{action.label}</span>
                  <small style={{ color: "#64748b" }}>{action.desc}</small>
                </div>
                <a href={action.href} className={action.variant} style={{ minHeight: "34px", padding: "0 14px", fontSize: "13px" }}>
                  {action.btnLabel}
                </a>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}