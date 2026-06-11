"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { auditoriaService, type AuditoriaLog } from "@/features/auditoria/auditoria.service";

export default function AuditoriaPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "Administrador") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAccion, setSelectedAccion] = useState("Todas");
  const [selectedTabla, setSelectedTabla] = useState("Todas");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditoriaService.findAll();
      setLogs(res || []);
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchSearch = !search || 
      (l.descripcion?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      l.tablaAfectada.toLowerCase().includes(search.toLowerCase()) ||
      String(l.idAud).includes(search);

    const matchAccion = selectedAccion === "Todas" || l.accion === selectedAccion;
    const matchTabla = selectedTabla === "Todas" || l.tablaAfectada === selectedTabla;

    return matchSearch && matchAccion && matchTabla;
  });

  const uniqueTablas = Array.from(new Set(logs.map((l) => l.tablaAfectada)));
  const uniqueAcciones = Array.from(new Set(logs.map((l) => l.accion)));

  const accionBadgeClass: Record<string, string> = {
    INSERT: "ok",
    UPDATE: "warn",
    DELETE: "danger",
  };

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker">Módulo Administrativo</p>
        <h1>Auditoría y Trazabilidad</h1>
        <p>Historial detallado de todas las transacciones, operaciones de base de datos y modificaciones de registros.</p>
      </section>

      {/* Stats Cards */}
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "14px" }}>
        {[
          { label: "Total operaciones", value: logs.length, note: "Registros de auditoría" },
          { label: "Modificaciones (Updates)", value: logs.filter((l) => l.accion === "UPDATE").length, note: "Actualizaciones de datos" },
          { label: "Inserciones (Inserts)", value: logs.filter((l) => l.accion === "INSERT").length, note: "Nuevos registros creados" },
        ].map((s) => (
          <article className="stat-card" key={s.label}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            <p>{s.note}</p>
          </article>
        ))}
      </section>

      {/* Toolbar */}
      <section className="surface" style={{ marginBottom: "14px" }}>
        <div className="toolbar">
          {/* Search */}
          <label className="input-shell toolbar-search" htmlFor="audit-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="audit-search"
              type="search"
              placeholder="Buscar por descripción, tabla o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          {/* Accion Filter */}
          <label className="input-shell" htmlFor="filter-accion" style={{ minWidth: "160px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <select
              id="filter-accion"
              value={selectedAccion}
              onChange={(e) => setSelectedAccion(e.target.value)}
              aria-label="Filtrar por acción"
            >
              <option value="Todas">Todas las acciones</option>
              {uniqueAcciones.map((act) => <option key={act} value={act}>{act}</option>)}
            </select>
          </label>

          {/* Tabla Filter */}
          <label className="input-shell" htmlFor="filter-tabla" style={{ minWidth: "160px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            <select
              id="filter-tabla"
              value={selectedTabla}
              onChange={(e) => setSelectedTabla(e.target.value)}
              aria-label="Filtrar por tabla"
            >
              <option value="Todas">Todas las tablas</option>
              {uniqueTablas.map((tab) => <option key={tab} value={tab}>{tab}</option>)}
            </select>
          </label>

          <button className="btn-secondary" onClick={fetchLogs} style={{ minWidth: "100px" }}>
            Refrescar
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2>Historial de Auditoría</h2>
            <p>{loading ? "Cargando logs..." : `${filteredLogs.length} registro${filteredLogs.length !== 1 ? "s" : ""} encontrado${filteredLogs.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>

        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando registros de auditoría de Oracle DB...
            </div>
          ) : (
            <table className="table" style={{ minWidth: "750px" }}>
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th style={{ width: "120px" }}>Acción</th>
                  <th style={{ width: "150px" }}>Tabla Afectada</th>
                  <th>Descripción del Suceso</th>
                  <th style={{ width: "180px" }}>Fecha / Hora</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                  const stateClass = accionBadgeClass[log.accion] || "info";

                  return (
                    <tr key={log.idAud}>
                      <td>
                        <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                          #{log.idAud}
                        </code>
                      </td>
                      <td>
                        <span className={`status-pill ${stateClass}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.tablaAfectada}</td>
                      <td style={{ color: "#b9c6dc", fontSize: "13.5px" }}>{log.descripcion || "—"}</td>
                      <td style={{ color: "#9aafc8", fontSize: "13px" }}>
                        {new Date(log.fechaAud).toLocaleString("es-EC")}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron registros de auditoría con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
