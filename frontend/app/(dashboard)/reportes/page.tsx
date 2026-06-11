"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { articulosService } from "@/features/equipos/equipo.service";
import { ubicacionesService } from "@/features/equipos/ubicacion.service";
import { usuariosService } from "@/features/usuarios/usuario.service";
import { mantenimientosService } from "@/features/mantenimientos/mantenimiento.service";
import { generateReportPDF } from "@/lib/pdfGenerator";

interface Reporte {
  id: string;
  titulo: string;
  modulo: string;
  generado: string;
  autor: string;
  estado: "Listo" | "Procesando" | "Error";
  reportType: "equipos" | "laboratorios" | "usuarios" | "mantenimientos";
}

const reportesMock: Reporte[] = [
  { id: "RPT-034", titulo: "Inventario consolidado mayo 2026",     modulo: "Equipos",      generado: "2026-05-31", autor: "Carlos Ruiz",  estado: "Listo", reportType: "equipos" },
  { id: "RPT-033", titulo: "Préstamos activos por laboratorio",    modulo: "Laboratorios", generado: "2026-05-28", autor: "Ana Pérez",    estado: "Listo", reportType: "laboratorios" },
  { id: "RPT-032", titulo: "Reporte de mantenimiento Q2",          modulo: "Equipos",      generado: "2026-05-15", autor: "Pedro Díaz",   estado: "Listo", reportType: "mantenimientos" },
  { id: "RPT-031", titulo: "Usuarios con acceso administrativo",   modulo: "Usuarios",     generado: "2026-05-10", autor: "Ana Pérez",    estado: "Listo", reportType: "usuarios" },
];

const estadoPillClass: Record<string, string> = {
  Listo:       "ok",
  Procesando:  "warn",
  Error:       "danger",
};

const modulos = ["Todos", "Equipos", "Laboratorios", "Usuarios"];

const quickReports = [
  { id: "equipos", label: "Inventario de equipos",       desc: "Stock, estados y responsables",          modulo: "Equipos",      icon: "📦" },
  { id: "laboratorios", label: "Uso de laboratorios",          desc: "Disponibilidad y horarios del mes",       modulo: "Laboratorios", icon: "🏫" },
  { id: "usuarios", label: "Actividad de usuarios",        desc: "Accesos y operaciones por rol",           modulo: "Usuarios",     icon: "👥" },
  { id: "mantenimientos", label: "Mantenimientos pendientes",    desc: "Equipos en cola de servicio técnico",     modulo: "Equipos",      icon: "🔧" },
];

export default function ReportesPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "Administrador") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [search,  setSearch]  = useState("");
  const [modulo,  setModulo]  = useState("Todos");
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 6000);
  };

  const handleDownloadPDF = async (type: "equipos" | "laboratorios" | "usuarios" | "mantenimientos") => {
    try {
      setIsGenerating(true);
      showNotification("success", "Obteniendo datos de Oracle DB y preparando diseño de PDF...");
      
      let data: any[] = [];
      if (type === "equipos") {
        data = await articulosService.findAll();
      } else if (type === "laboratorios") {
        data = await ubicacionesService.findAll();
      } else if (type === "usuarios") {
        data = await usuariosService.findAll();
      } else if (type === "mantenimientos") {
        data = await mantenimientosService.findAll();
      }

      generateReportPDF(type, data, user?.name || "Administrador");
      showNotification("success", "El reporte PDF se ha generado y descargado exitosamente.");
    } catch (err) {
      console.error(err);
      showNotification("error", "Error al generar el PDF: " + (err instanceof Error ? err.message : err));
    } finally {
      setIsGenerating(false);
    }
  };

  const filtered = reportesMock.filter((r) => {
    const matchSearch = !search || [r.titulo, r.id, r.autor]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchMod = modulo === "Todos" || r.modulo === modulo;
    return matchSearch && matchMod;
  });

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker">Módulo</p>
        <h1>Reportes</h1>
        <p>Generación de indicadores, exportaciones y seguimiento de operaciones.</p>
      </section>

      {notification && (
        <div className={`notification-banner ${notification.type}`} style={{
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: notification.type === "success" ? "rgba(46, 213, 115, 0.15)" : "rgba(255, 71, 87, 0.15)",
          border: `1px solid ${notification.type === "success" ? "#2ed573" : "#ff4757"}`,
          color: notification.type === "success" ? "#2ed573" : "#ff4757",
          fontWeight: 500,
          fontSize: "14px"
        }}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>
      )}

      {/* Two-col layout: quick generate + recent */}
      <section className="two-col" style={{ marginBottom: "16px" }}>
        {/* Quick generation */}
        <article className="surface">
          <div className="block-head">
            <div>
              <h2>Generar reporte rápido</h2>
              <p>Selecciona un tipo de reporte para exportar a formato oficial PDF.</p>
            </div>
          </div>
          <div className="mini-list">
            {quickReports.map((qr) => (
              <div className="mini-item" key={qr.label}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "24px" }}>{qr.icon}</span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>{qr.label}</span>
                    <small>{qr.desc}</small>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className="btn-primary" 
                    style={{ minHeight: "34px", padding: "0 14px", fontSize: "13px" }}
                    onClick={() => handleDownloadPDF(qr.id as any)}
                    disabled={isGenerating}
                    aria-label={`Generar PDF de ${qr.label}`}>
                    Exportar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Stats panel */}
        <aside className="surface">
          <div className="block-head">
            <h2>Resumen del mes</h2>
          </div>
          <div style={{ padding: "12px", display: "grid", gap: "8px" }}>
            {[
              { label: "Reportes generados",   value: "34", note: "Mayo 2026" },
              { label: "Descargas PDF",         value: "28", note: "Formato oficial" },
              { label: "Exportaciones PDF",     value: "6",  note: "Para análisis" },
              { label: "Reportes con error",    value: "0",  note: "Tolerancia a fallas" },
            ].map((s) => (
              <div className="summary-card" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label} — {s.note}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Toolbar */}
      <section className="surface" style={{ marginBottom: "14px" }}>
        <div className="toolbar">
          <label className="input-shell toolbar-search" htmlFor="rep-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="rep-search"
              type="search"
              placeholder="Buscar por título, ID o autor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="input-shell" htmlFor="filter-modulo" style={{ minWidth: "150px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            <select id="filter-modulo" value={modulo} onChange={(e) => setModulo(e.target.value)} aria-label="Filtrar por módulo">
              {modulos.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
        </div>
      </section>

      {/* History table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2>Historial de reportes</h2>
            <p>{filtered.length} reporte{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          <table className="table" style={{ minWidth: "660px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Módulo</th>
                <th>Fecha</th>
                <th>Autor</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                      {r.id}
                    </code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.titulo}</td>
                  <td style={{ color: "#9aafc8" }}>{r.modulo}</td>
                  <td style={{ color: "#9aafc8", fontSize: "13px" }}>{r.generado}</td>
                  <td>{r.autor}</td>
                  <td>
                    <span className={`status-pill ${estadoPillClass[r.estado]}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td>
                    <div className="actions-col">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleDownloadPDF(r.reportType)}
                        disabled={isGenerating}
                        aria-label={`Descargar ${r.id}`} 
                        title="Descargar PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                    No se encontraron reportes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}