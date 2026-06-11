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

export default function MisSolicitudesPage() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const [misPrestamos, setMisPrestamos] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<Articulo[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Devolution Form
  const [isDevolucionModalOpen, setIsDevolucionModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [devCantidad, setDevCantidad] = useState(1);
  const [devEstadoFisico, setDevEstadoFisico] = useState("BUENO");
  const [devObservaciones, setDevObservaciones] = useState("");

  const show = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [allLoans, artList, estList] = await Promise.all([
        prestamosService.findAll(),
        articulosService.findAll(),
        estadosService.findAll(),
      ]);
      setEquipos(artList || []);
      setEstados(estList || []);

      const myLoans = (allLoans || []).filter(
        (p: any) => String(p.idUsr) === String(user.id ?? "")
      );
      const withDetails = await Promise.all(
        myLoans.map(async (loan: any) => {
          try {
            const details = await prestamosService.getDetalles(loan.idPres);
            return { ...loan, detalles: details || [] };
          } catch { return { ...loan, detalles: [] }; }
        })
      );
      setMisPrestamos(withDetails.sort((a, b) => b.idPres - a.idPres));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCancelar = async (id: number) => {
    if (!confirm(`¿Cancelar la solicitud #${id}?`)) return;
    try {
      await prestamosService.delete(id);
      show("success", "Solicitud cancelada.");
      fetchData();
    } catch (err) {
      show("error", "Error al cancelar: " + (err instanceof Error ? err.message : err));
    }
  };

  const openDevolucion = (loan: any) => {
    setSelectedLoan(loan);
    setDevCantidad(loan.detalles?.[0]?.canPre || 1);
    setDevEstadoFisico("BUENO");
    setDevObservaciones("");
    setIsDevolucionModalOpen(true);
  };

  const submitDevolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !user) return;
    try {
      const eqName = selectedLoan.detalles?.map((det: any) => {
        const eq = equipos.find(e => e.idArt === det.idArt);
        return eq?.nomArt || `Equipo #${det.idArt}`;
      }).join(", ") || "equipo";

      await prestamosService.update(selectedLoan.idPres, {
        obsPres: `DEVOLUCION_PENDIENTE|Cant:${devCantidad}|Estado:${devEstadoFisico}|Obs:${devObservaciones || "Sin observaciones"}`
      });

      sendNotification("📦 Solicitud de Devolución",
        `${user.name || user.email} solicita devolver ${devCantidad} ud. de ${eqName} — Estado: ${devEstadoFisico}`,
        "Docente");
      sendNotification("📦 Solicitud de Devolución",
        `${user.name || user.email} solicita devolver ${devCantidad} ud. de ${eqName} — Estado: ${devEstadoFisico}`,
        "Administrador");

      show("success", "Solicitud de devolución enviada. El encargado revisará el equipo.");
      setIsDevolucionModalOpen(false);
      fetchData();
    } catch (err) {
      show("error", "Error: " + (err instanceof Error ? err.message : err));
    }
  };

  const cancelarDevolucion = async (id: number) => {
    if (!confirm("¿Cancelar la solicitud de devolución?")) return;
    try {
      await prestamosService.update(id, { obsPres: "Préstamo activo" });
      show("success", "Solicitud de devolución cancelada.");
      fetchData();
    } catch (err) {
      show("error", "Error: " + (err instanceof Error ? err.message : err));
    }
  };

  const pendienteCount = misPrestamos.filter(p => {
    const est = estados.find(e => e.idEst === p.idEst)?.nomEst;
    return est === "PENDIENTE" || p.idEst === 4;
  }).length;

  const activosCount = misPrestamos.filter(p => {
    const est = estados.find(e => e.idEst === p.idEst)?.nomEst;
    return est === "PRESTADO" || p.idEst === 3;
  }).length;

  return (
    <div>
      {/* ── HERO ── */}
      <section
        className="hero-banner"
        style={{ backgroundImage: "url('/images/laboratorio-bg.png')" }}
      >
        <div className="hero-banner-content">
          <p style={{ color: "#ffffff", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            Mi Panel
          </p>
          <h1 style={{ color: "#ffffff", fontWeight: 900, fontSize: "32px", marginBottom: "8px", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            Mis Solicitudes y Préstamos
          </h1>
          <p style={{ color: "#ffffff", fontSize: "15px", lineHeight: 1.6 }}>
            Gestiona tus equipos prestados, sigue el estado de tus solicitudes y solicita devoluciones.
          </p>
        </div>
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
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "20px" }}>
        {[
          { label: "Total Solicitudes", value: misPrestamos.length, color: "#1e3a8a" },
          { label: "Pendientes Aprobación", value: pendienteCount, color: "#fbbf24" },
          { label: "Equipos a tu Cargo", value: activosCount, color: "#34d399" },
        ].map((s) => (
          <article key={s.label} className="stat-card">
            <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</span>
            <strong style={{ fontSize: "32px", fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.value}</strong>
          </article>
        ))}
      </section>

      {/* ── TABLE ── */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2 style={{ color: "#0f172a", fontWeight: 800 }}>Mis Solicitudes de Préstamo</h2>
            <p style={{ color: "#475569" }}>
              {loading ? "Cargando..." : `${misPrestamos.length} solicitud${misPrestamos.length !== 1 ? "es" : ""}`}
            </p>
          </div>
        </div>

        <div style={{ padding: "0 12px 16px", overflowX: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#64748b", fontSize: "15px" }}>Cargando tus solicitudes...</div>
          ) : misPrestamos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <p style={{ color: "#334155", fontWeight: 700, fontSize: "16px" }}>No tienes solicitudes activas.</p>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>Ve a Equipos y solicita un préstamo.</p>
            </div>
          ) : (
            <table className="table" style={{ minWidth: "720px", width: "100%" }}>
              <thead>
                <tr>
                  {["ID", "Equipo(s)", "Fecha Préstamo", "Fecha Devolución", "Estado", "Observación", "Acciones"].map(h => (
                    <th key={h} style={{ color: "#0f172a", fontWeight: 800, fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.6px", background: "#f8fafc", borderBottom: "2px solid #cbd5e1", padding: "10px 12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {misPrestamos.map((p) => {
                  const estObj = estados.find(e => e.idEst === p.idEst);
                  const isPendiente = p.idEst === 4 || estObj?.nomEst === "PENDIENTE";
                  const isPrestado = !isPendiente && (p.idEst === 3 || estObj?.nomEst === "PRESTADO");
                  const isDevPendiente = p.obsPres?.includes("DEVOLUCION_PENDIENTE");

                  const detailsStr = p.detalles?.map((det: any) => {
                    const eq = equipos.find(e => e.idArt === det.idArt);
                    return `${eq?.nomArt || `Equipo`} (ID: #${det.idArt}) - ${det.canPre} ud.`;
                  }).join(", ") || "—";

                  let obsDisplay = p.obsPres || "Sin observaciones";
                  if (isDevPendiente) {
                    const parts = p.obsPres.split("|");
                    const cant = parts.find((x: string) => x.startsWith("Cant:"))?.split(":")[1] || "";
                    const est = parts.find((x: string) => x.startsWith("Estado:"))?.split(":")[1] || "";
                    obsDisplay = `Devolución en revisión: ${cant} ud. – ${est}`;
                  }

                  const statePill = isPendiente
                    ? <span style={pillStyle("orange")}>⏳ PENDIENTE</span>
                    : isDevPendiente
                      ? <span style={pillStyle("blue")}>🔄 DEVOL. PEND.</span>
                      : isPrestado
                        ? <span style={pillStyle("green")}>✓ PRESTADO</span>
                        : <span style={pillStyle("gray")}>{estObj?.nomEst || "—"}</span>;

                  return (
                    <tr key={p.idPres} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px" }}>
                        <code style={{ background: "#eff6ff", border: "1.5px solid #1e3a8a", color: "#1e3a8a", padding: "3px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: 800 }}>
                          #{p.idPres}
                        </code>
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{detailsStr}</td>
                      <td style={{ padding: "12px", color: "#334155", fontSize: "13px", fontWeight: 600 }}>
                        {new Date(p.fecPres).toLocaleDateString("es-EC")}
                      </td>
                      <td style={{ padding: "12px", color: "#334155", fontSize: "13px", fontWeight: 600 }}>
                        {p.fecDevolucion ? new Date(p.fecDevolucion).toLocaleDateString("es-EC") : "—"}
                      </td>
                      <td style={{ padding: "12px" }}>{statePill}</td>
                      <td style={{ padding: "12px", maxWidth: "200px" }}>
                        {isDevPendiente ? (
                          <span style={{ background: "#1e3a8a", color: "#bfdbfe", border: "1px solid #1e3a8a", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, display: "inline-block" }}>
                            {obsDisplay}
                          </span>
                        ) : (
                          <span style={{ color: "#475569", fontSize: "13px" }}>{obsDisplay}</span>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {isPendiente && (
                            <button
                              onClick={() => handleCancelar(p.idPres)}
                              style={{
                                background: "#dc2626", border: "1.5px solid #b91c1c", color: "#fff",
                                padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "13px",
                                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px"
                              }}
                            >
                              ✕ Cancelar
                            </button>
                          )}
                          {isPrestado && !isDevPendiente && (
                            <button
                              onClick={() => openDevolucion(p)}
                              style={{
                                background: "linear-gradient(140deg,#172554,#1e3a8a)", border: "1.5px solid #172554",
                                color: "#fff", padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "13px",
                                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px",
                                boxShadow: "0 4px 14px rgba(29,78,216,0.35)"
                              }}
                            >
                              📦 Devolver
                            </button>
                          )}
                          {isDevPendiente && (
                            <button
                              onClick={() => cancelarDevolucion(p.idPres)}
                              style={{
                                background: "#78350f", border: "1.5px solid #d97706", color: "#fde68a",
                                padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "13px",
                                cursor: "pointer"
                              }}
                            >
                              Cancelar Dev.
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── MODAL DEVOLUCIÓN ── */}
      {isDevolucionModalOpen && selectedLoan && (
        <div className="modal-backdrop" onClick={() => setIsDevolucionModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <div>
                <h2 style={{ color: "#0f172a", fontWeight: 900 }}>📦 Formulario de Devolución</h2>
                <p style={{ color: "#475569" }}>Describe el estado del equipo. El encargado revisará y aceptará o rechazará.</p>
              </div>
              <button onClick={() => setIsDevolucionModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}>✕</button>
            </div>

            {/* Equipo info */}
            <div style={{ background: "#eff6ff", border: "1.5px solid #1e3a8a", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", color: "#172554", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>Equipo(s) a devolver</p>
              <p style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "15px" }}>
                {selectedLoan.detalles?.map((det: any) => {
                  const eq = equipos.find(e => e.idArt === det.idArt);
                  return `${eq?.nomArt || `Equipo`} (ID: #${det.idArt}) - ${det.canPre} ud.`;
                }).join(", ") || "—"}
              </p>
            </div>

            <form onSubmit={submitDevolucion} style={{ display: "grid", gap: "16px" }}>
              <label className="field" htmlFor="dev-qty">
                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>Cantidad a devolver *</span>
                <div className="input-shell">
                  <input id="dev-qty" type="number" required min={1} max={selectedLoan.detalles?.[0]?.canPre || 99}
                    value={devCantidad} onChange={(e) => setDevCantidad(Number(e.target.value))} />
                </div>
              </label>

              <label className="field" htmlFor="dev-estado">
                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>Estado Físico del Equipo *</span>
                <div className="input-shell">
                  <select id="dev-estado" value={devEstadoFisico} onChange={(e) => setDevEstadoFisico(e.target.value)}>
                    <option value="EXCELENTE">✅ Excelente – Sin ningún daño</option>
                    <option value="BUENO">👍 Bueno – Uso normal</option>
                    <option value="REGULAR">⚠️ Regular – Daños leves</option>
                    <option value="MALO">❌ Malo – Daños significativos</option>
                  </select>
                </div>
              </label>

              <label className="field" htmlFor="dev-obs">
                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>Observaciones</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea id="dev-obs" placeholder="Describa daños, rayaduras, problemas de funcionamiento..."
                    value={devObservaciones} onChange={(e) => setDevObservaciones(e.target.value)}
                    style={{ minHeight: "80px" }} />
                </div>
              </label>

              <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "12px 16px", color: "#92400e", fontSize: "13px", display: "flex", gap: "8px" }}>
                <span>⚠️</span>
                <span>El encargado verificará físicamente el equipo antes de confirmar la devolución.</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDevolucionModalOpen(false)}>Cancelar</button>
                <button type="submit" style={{
                  background: "linear-gradient(140deg,#172554,#1e3a8a)", border: "1.5px solid #172554",
                  color: "#fff", padding: "0 20px", borderRadius: "10px", fontWeight: 800, fontSize: "14px",
                  minHeight: "42px", cursor: "pointer", boxShadow: "0 4px 14px rgba(29,78,216,0.35)"
                }}>
                  📤 Enviar Solicitud de Devolución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
