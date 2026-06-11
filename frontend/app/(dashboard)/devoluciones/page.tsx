"use client";

import { useEffect, useState } from "react";
import { prestamosService } from "@/features/prestamos/prestamo.service";
import { articulosService } from "@/features/equipos/equipo.service";
import { estadosService } from "@/features/equipos/estado.service";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/context/NotificationContext";
import type { Articulo, Estado } from "@/types/api";

/* ── helpers ── */
function pillStyle(variant: "green" | "orange" | "blue" | "red" | "gray") {
  const map = {
    green:  { background: "#14532d", color: "#bbf7d0", border: "1.5px solid #16a34a" },
    orange: { background: "#78350f", color: "#fde68a", border: "1.5px solid #d97706" },
    blue:   { background: "#1e3a8a", color: "#bfdbfe", border: "1.5px solid #1e3a8a" },
    red:    { background: "#7f1d1d", color: "#fecaca", border: "1.5px solid #dc2626" },
    gray:   { background: "#1e293b", color: "#cbd5e1", border: "1.5px solid #475569" },
  };
  return {
    ...map[variant],
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: "5px",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.3px",
  };
}

function estadoFisicoStyle(estado: string) {
  switch (estado) {
    case "EXCELENTE": return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
    case "BUENO":     return { bg: "#dbeafe", color: "#172554", border: "#93c5fd" };
    case "REGULAR":   return { bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
    case "MALO":      return { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" };
    default:          return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
  }
}

export default function DevolucionesPage() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const [devoluciones, setDevoluciones] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<Articulo[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const show = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allLoans, artList, estList] = await Promise.all([
        prestamosService.findAll(),
        articulosService.findAll(),
        estadosService.findAll(),
      ]);
      setEquipos(artList || []);
      setEstados(estList || []);

      const pending = (allLoans || []).filter(
        (p: any) => p.obsPres?.includes("DEVOLUCION_PENDIENTE")
      );
      const withDetails = await Promise.all(
        pending.map(async (loan: any) => {
          try {
            const details = await prestamosService.getDetalles(loan.idPres);
            return { ...loan, detalles: details || [] };
          } catch { return { ...loan, detalles: [] }; }
        })
      );
      setDevoluciones(withDetails.sort((a, b) => b.idPres - a.idPres));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const parseObs = (obsPres: string) => {
    const parts = obsPres.split("|");
    return {
      cantidad:     parts.find((p: string) => p.startsWith("Cant:"))?.split(":")[1]   || "—",
      estadoFisico: parts.find((p: string) => p.startsWith("Estado:"))?.split(":")[1] || "—",
      observaciones: parts.find((p: string) => p.startsWith("Obs:"))?.split(":")[1]   || "Sin observaciones",
    };
  };

  const getEqs = (loan: any) =>
    loan.detalles?.map((det: any) => {
      const eq = equipos.find(e => e.idArt === det.idArt);
      return { nombre: eq?.nomArt || `Equipo #${det.idArt}`, canPre: det.canPre, idArt: det.idArt };
    }) || [];

  /* ── ACEPTAR devolución ── */
  const handleAceptar = async (loan: any) => {
    const { estadoFisico } = parseObs(loan.obsPres);
    if (!confirm(`¿Aceptar la devolución del préstamo #${loan.idPres}? Esto liberará el stock.`)) return;
    try {
      await prestamosService.delete(loan.idPres);

      // Si está dañado → poner en mantenimiento
      if (estadoFisico === "MALO" || estadoFisico === "REGULAR") {
        const estMant = estados.find(e =>
          e.nomEst === "EN_MANTENIMIENTO" || e.nomEst === "MANTENIMIENTO" || e.idEst === 5
        );
        if (estMant) {
          for (const det of loan.detalles || []) {
            try { await articulosService.update(det.idArt, { idEst: estMant.idEst }); } catch { /* ignore */ }
          }
        }
      }

      sendNotification("✅ Devolución Aprobada",
        `La devolución del préstamo #${loan.idPres} fue aprobada. Equipo registrado como devuelto.`,
        "Estudiante");
      sendNotification("✅ Devolución Aprobada",
        `La devolución del préstamo #${loan.idPres} fue aprobada. Stock liberado.`,
        "Administrador");

      show("success", `Préstamo #${loan.idPres} aprobado. Equipo liberado del inventario.`);
      setIsDetailOpen(false);
      fetchData();
    } catch (err) {
      show("error", "Error: " + (err instanceof Error ? err.message : err));
    }
  };

  /* ── RECHAZAR devolución ── */
  const handleRechazar = async (loan: any) => {
    if (!confirm(`¿Rechazar la devolución del préstamo #${loan.idPres}? El préstamo continuará activo.`)) return;
    try {
      await prestamosService.update(loan.idPres, {
        obsPres: "Devolución rechazada por encargado – Préstamo sigue activo"
      });

      sendNotification("❌ Devolución Rechazada",
        `Tu solicitud de devolución para el préstamo #${loan.idPres} fue rechazada. Consulta con el encargado.`,
        "Estudiante");

      show("success", `Devolución #${loan.idPres} rechazada. Préstamo continúa activo.`);
      setIsDetailOpen(false);
      fetchData();
    } catch (err) {
      show("error", "Error: " + (err instanceof Error ? err.message : err));
    }
  };

  return (
    <div>
      <section className="page-header">
        <p className="section-kicker" style={{ color: "#1e3a8a", fontWeight: 700 }}>Gestión</p>
        <h1 style={{ color: "#0f172a" }}>Solicitudes de Devolución</h1>
        <p style={{ color: "#475569" }}>
          Revisa las devoluciones físicas de equipos. Acepta o rechaza según el estado del equipo.
        </p>
      </section>

      {/* ── NOTIFICATION ── */}
      {notification && (
        <div style={{
          padding: "12px 16px", borderRadius: "8px", marginBottom: "16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: notification.type === "success" ? "rgba(46,213,115,0.15)" : "rgba(255,71,87,0.15)",
          border: `1px solid ${notification.type === "success" ? "#2ed573" : "#ff4757"}`,
          color: notification.type === "success" ? "#2ed573" : "#ff4757",
          fontWeight: 600, fontSize: "14px"
        }}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>
      )}

      {/* ── STATS ── */}
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: "20px" }}>
        <article className="stat-card">
          <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Devoluciones Pendientes</span>
          <strong style={{ fontSize: "32px", fontWeight: 900, color: devoluciones.length > 0 ? "#fbbf24" : "#34d399", lineHeight: 1.1 }}>
            {devoluciones.length}
          </strong>
          <p style={{ color: "#64748b" }}>Requieren revisión física</p>
        </article>
        <article className="stat-card">
          <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Estado del Módulo</span>
          <strong style={{ fontSize: "22px", fontWeight: 900, color: devoluciones.length === 0 ? "#34d399" : "#fbbf24", lineHeight: 1.1 }}>
            {devoluciones.length === 0 ? "✓ Al Día" : "⚠ Pendientes"}
          </strong>
          <p style={{ color: "#64748b" }}>{devoluciones.length === 0 ? "Sin devoluciones pendientes" : "Revisar devoluciones"}</p>
        </article>
      </section>

      {/* ── TABLE ── */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2 style={{ color: "#0f172a", fontWeight: 800 }}>Devoluciones Pendientes de Revisión</h2>
            <p style={{ color: "#475569" }}>
              {loading ? "Cargando..." : `${devoluciones.length} solicitud${devoluciones.length !== 1 ? "es" : ""} pendiente${devoluciones.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div style={{ padding: "0 12px 16px", overflowX: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>Cargando...</div>
          ) : devoluciones.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <p style={{ color: "#16a34a", fontWeight: 800, fontSize: "18px" }}>✓ ¡Sin pendientes!</p>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>No hay devoluciones pendientes de revisión.</p>
            </div>
          ) : (
            <table className="table" style={{ minWidth: "700px", width: "100%" }}>
              <thead>
                <tr>
                  {["ID", "Equipo(s)", "Cantidad", "Estado Físico", "Observaciones", "Acción"].map(h => (
                    <th key={h} style={{ color: "#0f172a", fontWeight: 800, fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.6px", background: "#f8fafc", borderBottom: "2px solid #cbd5e1", padding: "10px 12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devoluciones.map((loan) => {
                  const { cantidad, estadoFisico, observaciones } = parseObs(loan.obsPres);
                  const eqs = getEqs(loan);
                  const estStyle = estadoFisicoStyle(estadoFisico);
                  return (
                    <tr key={loan.idPres} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px" }}>
                        <code style={{ background: "#eff6ff", border: "1.5px solid #1e3a8a", color: "#1e3a8a", padding: "3px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: 800 }}>
                          #{loan.idPres}
                        </code>
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
                        {eqs.map((e: { nombre: string }) => e.nombre).join(", ") || "—"}
                      </td>
                      <td style={{ padding: "12px", fontWeight: 800, color: "#172554", fontSize: "14px" }}>{cantidad} ud.</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: estStyle.bg, color: estStyle.color, border: `1.5px solid ${estStyle.border}`, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800 }}>
                          {estadoFisico}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#334155", fontSize: "13px", maxWidth: "200px" }}>
                        {observaciones}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => { setSelected(loan); setIsDetailOpen(true); }}
                          style={{
                            background: "linear-gradient(140deg,#172554,#1e3a8a)", border: "1.5px solid #172554",
                            color: "#fff", padding: "7px 16px", borderRadius: "8px", fontWeight: 800, fontSize: "13px",
                            cursor: "pointer", boxShadow: "0 4px 12px rgba(29,78,216,0.3)"
                          }}
                        >
                          🔍 Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── MODAL DETALLE DEVOLUCIÓN ── */}
      {isDetailOpen && selected && (() => {
        const { cantidad, estadoFisico, observaciones } = parseObs(selected.obsPres);
        const eqs = getEqs(selected);
        const estStyle = estadoFisicoStyle(estadoFisico);
        return (
          <div className="modal-backdrop" onClick={() => setIsDetailOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
              <div className="modal-header">
                <div>
                  <h2 style={{ color: "#0f172a", fontWeight: 900 }}>🔍 Revisión de Devolución #{selected.idPres}</h2>
                  <p style={{ color: "#475569" }}>Verifica físicamente el equipo antes de aprobar o rechazar.</p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}>✕</button>
              </div>

              <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                {/* Equipos */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Equipos a devolver</p>
                  {eqs.map((eq: { nombre: string; canPre: number }, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < eqs.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{eq.nombre}</span>
                      <span style={{ fontWeight: 800, color: "#172554", fontSize: "14px" }}>{eq.canPre} ud.</span>
                    </div>
                  ))}
                </div>

                {/* Datos clave */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Cantidad Reportada</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#172554" }}>{cantidad} <span style={{ fontSize: "14px", fontWeight: 700 }}>ud.</span></div>
                  </div>
                  <div style={{ background: estStyle.bg, border: `1.5px solid ${estStyle.border}`, borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: estStyle.color, opacity: 0.8, textTransform: "uppercase", marginBottom: "6px" }}>Estado Físico</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: estStyle.color, letterSpacing: "1px" }}>{estadoFisico}</div>
                  </div>
                </div>

                {/* Observaciones */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>Observaciones del Solicitante</div>
                  <div style={{ color: "#334155", fontSize: "14px", lineHeight: 1.6, fontWeight: 500 }}>{observaciones}</div>
                </div>

                {/* Advertencia si dañado */}
                {(estadoFisico === "MALO" || estadoFisico === "REGULAR") && (
                  <div style={{ background: "#78350f", border: "1.5px solid #d97706", borderRadius: "8px", padding: "12px 16px", color: "#fde68a", fontSize: "13px", fontWeight: 700, display: "flex", gap: "8px" }}>
                    <span>⚠️</span>
                    <span>Al aceptar, el equipo será marcado automáticamente como <strong>En Mantenimiento</strong>.</span>
                  </div>
                )}

                <div style={{ background: "#1e3a8a", border: "1.5px solid #1e3a8a", borderRadius: "8px", padding: "12px 16px", color: "#bfdbfe", fontSize: "13px", fontWeight: 700, display: "flex", gap: "8px" }}>
                  <span>ℹ️</span>
                  <span>Verifica físicamente que la cantidad y estado del equipo coincidan con lo reportado.</span>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: "2px solid #e2e8f0", paddingTop: "16px", marginTop: "0", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setIsDetailOpen(false)} style={{
                  background: "#f1f5f9", border: "1.5px solid #cbd5e1", color: "#1e293b",
                  padding: "0 16px", borderRadius: "10px", fontWeight: 700, fontSize: "14px",
                  minHeight: "42px", cursor: "pointer"
                }}>
                  Cancelar
                </button>
                <button
                  onClick={() => handleRechazar(selected)}
                  style={{
                    background: "#dc2626", border: "1.5px solid #b91c1c",
                    color: "#fff", padding: "0 20px", borderRadius: "10px", fontWeight: 800,
                    fontSize: "14px", minHeight: "42px", cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
                  }}
                >
                  ✕ Rechazar
                </button>
                <button
                  onClick={() => handleAceptar(selected)}
                  style={{
                    background: "linear-gradient(140deg,#15803d,#14532d)", border: "1.5px solid #16a34a",
                    color: "#fff", padding: "0 20px", borderRadius: "10px", fontWeight: 800,
                    fontSize: "14px", minHeight: "42px", cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22,163,74,0.35)"
                  }}
                >
                  ✓ Aceptar Devolución
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
