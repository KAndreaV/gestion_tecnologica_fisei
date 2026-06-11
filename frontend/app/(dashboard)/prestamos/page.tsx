"use client";

import { useEffect, useState } from "react";
import { prestamosService } from "@/features/prestamos/prestamo.service";
import { articulosService } from "@/features/equipos/equipo.service";
import { usuariosService } from "@/features/usuarios/usuario.service";
import { estadosService } from "@/features/equipos/estado.service";
import { useAuth } from "@/hooks/useAuth";
import type { Articulo, Usuario, Estado } from "@/types/api";
import { useNotifications } from "@/context/NotificationContext";

interface TemporaryItem {
  idArt: number;
  nomArt: string;
  canPre: number;
  maxStock: number;
}

export default function PrestamosPage() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const isAdmin = user?.role === "Administrador" || user?.role === "Técnico" || !user;
  const isDocente = user?.role === "Docente";

  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEst, setFilterEst] = useState("Todos");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [loanDetails, setLoanDetails] = useState<any[]>([]);

  // Create Form State
  const [idUsr, setIdUsr] = useState<number>(0);
  const [fecPres, setFecPres] = useState("");
  const [fecDevolucion, setFecDevolucion] = useState("");
  const [obsPres, setObsPres] = useState("");
  const [selectedArtId, setSelectedArtId] = useState<number>(0);
  const [artQty, setArtQty] = useState<number>(1);
  const [tempItems, setTempItems] = useState<TemporaryItem[]>([]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 5000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [loanList, artList, usrList, estList] = await Promise.all([
        prestamosService.findAll(),
        articulosService.findAll(),
        usuariosService.findAll(),
        estadosService.findAll(),
      ]);

      setArticulos(artList || []);
      setUsuarios(usrList || []);
      setEstados(estList || []);

      if (usrList?.length > 0) setIdUsr(usrList[0].idUsr);
      if (artList?.length > 0) setSelectedArtId(artList[0].idArt);

      // Default dates
      const today = new Date().toISOString().split("T")[0];
      setFecPres(today);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFecDevolucion(nextWeek.toISOString().split("T")[0]);

      // Load details for all loans
      const loansWithDetails = await Promise.all(
        (loanList || []).map(async (loan: any) => {
          try {
            const details = await prestamosService.getDetalles(loan.idPres);
            return { ...loan, detalles: details || [] };
          } catch {
            return { ...loan, detalles: [] };
          }
        })
      );
      setPrestamos(loansWithDetails);

    } catch (err) {
      console.error("Error al cargar datos de préstamos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setTempItems([]);
    setObsPres("");
    setIsCreateOpen(true);
  };

  const addTempItem = () => {
    const art = articulos.find(a => a.idArt === Number(selectedArtId));
    if (!art) return;

    if (artQty > art.canArt) {
      showNotification("error", `Solo hay ${art.canArt} unidades disponibles.`);
      return;
    }

    if (tempItems.some(i => i.idArt === art.idArt)) {
      showNotification("error", "Este artículo ya ha sido añadido.");
      return;
    }

    setTempItems([
      ...tempItems,
      {
        idArt: art.idArt,
        nomArt: art.nomArt,
        canPre: Number(artQty),
        maxStock: art.canArt
      }
    ]);
  };

  const removeTempItem = (idArt: number) => {
    setTempItems(tempItems.filter(i => i.idArt !== idArt));
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tempItems.length === 0) {
      showNotification("error", "Debes añadir al menos un artículo al préstamo.");
      return;
    }

    // Find state ID for PENDIENTE in loans
    const estPendiente = estados.find(e => e.nomEst === "PENDIENTE")?.idEst ?? 4;

    const payload = {
      fecPres: new Date(fecPres).toISOString(),
      fecDevolucion: new Date(fecDevolucion).toISOString(),
      obsPres: obsPres || undefined,
      idUsr: Number(idUsr),
      idEst: estPendiente
    };

    try {
      // 1. Create Prestamo header
      const createdLoan = await prestamosService.create(payload);
      const loanId = createdLoan.idPres;

      // 2. Add details sequentially
      for (const item of tempItems) {
        await prestamosService.addDetalle(loanId, {
          idArt: item.idArt,
          canPre: item.canPre
        });
      }

      showNotification("success", `Préstamo #${loanId} registrado correctamente.`);
      setIsCreateOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al crear préstamo: " + (err instanceof Error ? err.message : err));
    }
  };

  const viewDetails = async (loan: any) => {
    setSelectedLoan(loan);
    try {
      const details = await prestamosService.getDetalles(loan.idPres);
      setLoanDetails(details || []);
      setIsDetailOpen(true);
    } catch (err) {
      showNotification("error", "Error al cargar detalles: " + (err instanceof Error ? err.message : err));
    }
  };

  const getArticleName = (idArt: number) => {
    return articulos.find(a => a.idArt === idArt)?.nomArt || `Artículo #${idArt}`;
  };

  const getRoleName = (idRol: number): string => {
    if (idRol === 1) return "Administrador";
    if (idRol === 2) return "Docente";
    if (idRol === 4) return "Técnico";
    return "Estudiante";
  };

  const handleApprove = async (loan: any) => {
    if (confirm(`¿Aprobar el préstamo #${loan.idPres}? El estado cambiará a Prestado.`)) {
      try {
        const estPrestado = estados.find(e => e.nomEst === "PRESTADO")?.idEst || 
                            estados.find(e => e.nomEst === "DISPONIBLE")?.idEst || 3;
        await prestamosService.update(loan.idPres, {
          idEst: estPrestado,
          fecEntrega: new Date().toISOString(),
          idUsr: loan.idUsr
        });
        showNotification("success", `Préstamo #${loan.idPres} aprobado.`);

        // Notify student
        const usrObj = usuarios.find(u => u.idUsr === loan.idUsr);
        if (usrObj) {
          const eqName = loan.detalles?.[0] ? getArticleName(loan.detalles[0].idArt) : "equipo";
          sendNotification(
            "✅ Solicitud de Préstamo Aprobada",
            `Tu solicitud para el préstamo #${loan.idPres} (${eqName}) ha sido aprobada. Puedes retirar el equipo.`,
            getRoleName(usrObj.idRol),
            usrObj.usuLogin
          );
        }

        fetchAll();
      } catch (err) {
        showNotification("error", "Error al aprobar: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleRejectLoan = async (loan: any) => {
    if (confirm(`¿Rechazar la solicitud de préstamo #${loan.idPres}?`)) {
      try {
        await prestamosService.delete(loan.idPres);
        showNotification("success", `Solicitud #${loan.idPres} rechazada.`);

        // Notify student
        const usrObj = usuarios.find(u => u.idUsr === loan.idUsr);
        if (usrObj) {
          const eqName = loan.detalles?.[0] ? getArticleName(loan.detalles[0].idArt) : "equipo";
          sendNotification(
            "❌ Solicitud de Préstamo Rechazada",
            `Tu solicitud para el préstamo #${loan.idPres} (${eqName}) ha sido rechazada por el encargado.`,
            getRoleName(usrObj.idRol),
            usrObj.usuLogin
          );
        }

        fetchAll();
      } catch (err) {
        showNotification("error", "Error al rechazar: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleReturn = async (loan: any) => {
    if (confirm(`¿Registrar la devolución del préstamo #${loan.idPres}? Esto liberará el stock.`)) {
      try {
        await prestamosService.delete(loan.idPres);
        showNotification("success", `Préstamo #${loan.idPres} marcado como devuelto.`);
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al registrar devolución: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  // Revision of Devolution handlers
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [selectedLoanForRevision, setSelectedLoanForRevision] = useState<any | null>(null);
  const [revCantidad, setRevCantidad] = useState(1);
  const [revEstadoFisico, setRevEstadoFisico] = useState("BUENO");
  const [revObservaciones, setRevObservaciones] = useState("");

  const openRevisionModal = (loan: any) => {
    setSelectedLoanForRevision(loan);
    let qty = loan.detalles?.[0]?.canPre || 1;
    let state = "BUENO";
    let obs = "";

    if (loan.obsPres && loan.obsPres.startsWith("DEVOLUCION_PENDIENTE")) {
      const parts = loan.obsPres.split("|");
      const cantPart = parts.find((part: string) => part.startsWith("Cant:"))?.split(":")[1];
      if (cantPart) qty = Number(cantPart);
      const estPart = parts.find((part: string) => part.startsWith("Estado:"))?.split(":")[1];
      if (estPart) state = estPart;
      const obsPart = parts.find((part: string) => part.startsWith("Obs:"))?.split(":")[1];
      if (obsPart) obs = obsPart;
    } else {
      obs = loan.obsPres || "";
    }

    setRevCantidad(qty);
    setRevEstadoFisico(state);
    setRevObservaciones(obs);
    setIsRevisionModalOpen(true);
  };

  const handleAcceptDevolucion = async () => {
    if (!selectedLoanForRevision) return;
    const loan = selectedLoanForRevision;
    if (confirm(`¿Aceptar la entrega física y procesar la devolución del préstamo #${loan.idPres}?`)) {
      try {
        await prestamosService.delete(loan.idPres);
        showNotification("success", `Devolución del préstamo #${loan.idPres} aprobada.`);

        // Notify student
        const usrObj = usuarios.find(u => u.idUsr === loan.idUsr);
        if (usrObj) {
          const eqName = loan.detalles?.[0] ? getArticleName(loan.detalles[0].idArt) : "el equipo";
          sendNotification(
            "Devolución aprobada",
            `La devolución física de ${eqName} ha sido aprobada y registrada en inventario.`,
            getRoleName(usrObj.idRol),
            usrObj.usuLogin
          );
        }

        setIsRevisionModalOpen(false);
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al procesar devolución: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleRejectDevolucion = async () => {
    if (!selectedLoanForRevision) return;
    const loan = selectedLoanForRevision;
    if (confirm(`¿Rechazar la devolución del préstamo #${loan.idPres}? El préstamo volverá a estar Activo.`)) {
      try {
        await prestamosService.update(loan.idPres, {
          obsPres: "Préstamo activo (Devolución rechazada por el encargado)",
        });
        showNotification("success", `Solicitud de devolución del préstamo #${loan.idPres} rechazada.`);

        // Notify student
        const usrObj = usuarios.find(u => u.idUsr === loan.idUsr);
        if (usrObj) {
          const eqName = loan.detalles?.[0] ? getArticleName(loan.detalles[0].idArt) : "el equipo";
          sendNotification(
            "Devolución rechazada",
            `La solicitud de devolución para ${eqName} fue rechazada por el encargado. Por favor revisa el estado del equipo.`,
            getRoleName(usrObj.idRol),
            usrObj.usuLogin
          );
        }

        setIsRevisionModalOpen(false);
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al rechazar devolución: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const filtered = prestamos.filter((p) => {
    const usrObj = usuarios.find(u => u.idUsr === p.idUsr);
    const usrName = usrObj ? `${usrObj.nomUsr} ${usrObj.apeUsr}`.toLowerCase() : "";
    const matchSearch = !search || usrName.includes(search.toLowerCase()) || String(p.idPres).includes(search);
    
    const estObj = estados.find(e => e.idEst === p.idEst);
    const estName = estObj?.nomEst || "";

    const matchEst = filterEst === "Todos" ||
      (filterEst === "Pendientes" && estName === "PENDIENTE") ||
      (filterEst === "Activos" && estName !== "PENDIENTE");

    const getRoleNameLocal = (idRol: number): string => {
      if (idRol === 1) return "Administrador";
      if (idRol === 2) return "Docente";
      if (idRol === 4) return "Técnico";
      return "Estudiante";
    };

    const isEstudiante = usrObj ? getRoleNameLocal(usrObj.idRol) === "Estudiante" : false;
    const isAllowed = isAdmin || (isDocente && isEstudiante);

    return matchSearch && matchEst && isAllowed;
  });

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker">Módulo</p>
        <h1>Gestión de Préstamos</h1>
        <p>Control de solicitudes de préstamo, entregas y devoluciones de equipos a docentes y alumnos.</p>
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

      {/* Stats */}
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <article className="stat-card">
          <span>Préstamos Totales</span>
          <strong>{prestamos.length}</strong>
          <p>Solicitudes y activos</p>
        </article>
        <article className="stat-card">
          <span>Pendientes de Aprobación</span>
          <strong>{prestamos.filter(p => estados.find(e => e.idEst === p.idEst)?.nomEst === "PENDIENTE").length}</strong>
          <p>Espera de entrega</p>
        </article>
        <article className="stat-card">
          <span>Artículos Disponibles</span>
          <strong>{articulos.reduce((sum, art) => sum + art.canArt, 0)}</strong>
          <p>Stock listo para préstamo</p>
        </article>
      </section>

      {/* Toolbar */}
      <section className="surface" style={{ marginBottom: "14px" }}>
        <div className="toolbar">
          <label className="input-shell toolbar-search" htmlFor="loan-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="loan-search"
              type="search"
              placeholder="Buscar préstamo por ID o usuario…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="input-shell" htmlFor="filter-loan-est" style={{ minWidth: "150px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
            </svg>
            <select id="filter-loan-est" value={filterEst} onChange={(e) => setFilterEst(e.target.value)} aria-label="Filtrar por estado de préstamo">
              <option value="Todos">Todos</option>
              <option value="Pendientes">Pendientes</option>
              <option value="Activos">Aprobados / Activos</option>
            </select>
          </label>

          {isAdmin && (
            <button className="btn-primary" id="btn-nuevo-prestamo" onClick={openCreate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Solicitar Préstamo
            </button>
          )}
        </div>
      </section>

      {/* Table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2>Listado de Préstamos</h2>
            <p>{loading ? "Cargando registros..." : `${filtered.length} préstamo${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>

        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando préstamos de la base de datos...
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Usuario</th>
                  <th>Fecha Préstamo</th>
                  <th>Fecha Devolución</th>
                  <th>Estado</th>
                  <th>Observación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((p: any) => {
                  const usrObj = usuarios.find(u => u.idUsr === p.idUsr);
                  const estObj = estados.find(e => e.idEst === p.idEst);
                  const isPendiente = estObj?.nomEst === "PENDIENTE";
                  const isDevolucionSolicitada = p.obsPres === "Solicitud de Devolución" || (p.obsPres && p.obsPres.includes("DEVOLUCION_PENDIENTE"));

                  let displayObs = p.obsPres || "Sin observaciones";
                  if (p.obsPres && p.obsPres.startsWith("DEVOLUCION_PENDIENTE")) {
                    const parts = p.obsPres.split("|");
                    const cantPart = parts.find((part: string) => part.startsWith("Cant:"))?.split(":")[1] || "";
                    const estPart = parts.find((part: string) => part.startsWith("Estado:"))?.split(":")[1] || "";
                    const obsPart = parts.find((part: string) => part.startsWith("Obs:"))?.split(":")[1] || "";
                    displayObs = `Devolución: ${cantPart} ud. (${estPart}). Obs: ${obsPart}`;
                  }

                  return (
                    <tr key={p.idPres}>
                      <td>
                        <code style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}>
                          #{p.idPres}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{usrObj ? `${usrObj.nomUsr} ${usrObj.apeUsr}` : `Usuario #${p.idUsr}`}</td>
                      <td>{new Date(p.fecPres).toLocaleDateString()}</td>
                      <td>{p.fecDevolucion ? new Date(p.fecDevolucion).toLocaleDateString() : "—"}</td>
                      <td>
                        <span className={`status-pill ${isPendiente ? "warn" : "ok"}`}>
                          {estObj?.nomEst || `Estado #${p.idEst}`}
                        </span>
                      </td>
                      <td>
                        {isDevolucionSolicitada ? (
                          <span className="badge" style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe", color: "#172554", fontWeight: 700, padding: "4px 8px", borderRadius: "6px" }}>
                            {displayObs}
                          </span>
                        ) : (
                          <span style={{ color: "#475569", fontSize: "13px" }}>{displayObs}</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-col">
                          <button className="icon-btn view" onClick={() => viewDetails(p)} title="Ver Detalle de Artículos">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {(isAdmin || isDocente) && isPendiente && (
                            <>
                              <button className="icon-btn edit" onClick={() => handleApprove(p)} title="Aprobar / Entregar" style={{ borderColor: "var(--ok-border)", color: "var(--ok-text)" }}>
                                ✓
                              </button>
                              <button className="icon-btn delete" onClick={() => handleRejectLoan(p)} title="Rechazar Solicitud" style={{ borderColor: "var(--danger-border)", color: "var(--danger-text)" }}>
                                ✕
                              </button>
                            </>
                          )}
                          {(isAdmin || isDocente) && !isPendiente && isDevolucionSolicitada && (
                            <button className="icon-btn delete" onClick={() => openRevisionModal(p)} title="Revisar Devolución Física" style={{ borderColor: "#1e3a8a", color: "#1e3a8a" }}>
                              ↺
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron préstamos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal: Create Loan */}
      {isCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <div>
                <h2>Registrar Solicitud de Préstamo</h2>
                <p>Crea una nueva solicitud con múltiples artículos del inventario.</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsCreateOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="mini-list" style={{ padding: 0 }}>
              <label className="field" htmlFor="field-usr">
                <span>Usuario Solicitante *</span>
                <div className="input-shell">
                  <select id="field-usr" value={idUsr} onChange={(e) => setIdUsr(Number(e.target.value))}>
                    {usuarios.map((u) => <option key={u.idUsr} value={u.idUsr}>{u.nomUsr} {u.apeUsr} ({u.usuLogin})</option>)}
                  </select>
                </div>
              </label>

              <div className="form-row">
                <label className="field" htmlFor="field-fec-pres">
                  <span>Fecha Préstamo</span>
                  <div className="input-shell">
                    <input id="field-fec-pres" type="date" value={fecPres} onChange={(e) => setFecPres(e.target.value)} />
                  </div>
                </label>
                <label className="field" htmlFor="field-fec-dev">
                  <span>Fecha Devolución</span>
                  <div className="input-shell">
                    <input id="field-fec-dev" type="date" value={fecDevolucion} onChange={(e) => setFecDevolucion(e.target.value)} />
                  </div>
                </label>
              </div>

              {/* Add articles component */}
              <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: "8px", background: "rgba(255,255,255,0.02)", marginTop: "8px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "#1e3a8a" }}>Selección de Equipos</h3>
                <div className="form-row" style={{ alignItems: "flex-end", gap: "8px" }}>
                  <label className="field" htmlFor="field-art" style={{ flex: 1 }}>
                    <span>Artículo</span>
                    <div className="input-shell">
                      <select id="field-art" value={selectedArtId} onChange={(e) => setSelectedArtId(Number(e.target.value))}>
                        {articulos.filter(a => a.canArt > 0).map((a) => <option key={a.idArt} value={a.idArt}>{a.nomArt} ({a.canArt} disp.)</option>)}
                      </select>
                    </div>
                  </label>
                  <label className="field" htmlFor="field-art-qty" style={{ width: "90px" }}>
                    <span>Cant.</span>
                    <div className="input-shell">
                      <input id="field-art-qty" type="number" min={1} value={artQty} onChange={(e) => setArtQty(Number(e.target.value))} />
                    </div>
                  </label>
                  <button type="button" className="btn-secondary" onClick={addTempItem} style={{ minHeight: "46px" }}>
                    Añadir
                  </button>
                </div>

                {/* Selected items list */}
                {tempItems.length > 0 && (
                  <div style={{ marginTop: "12px", display: "grid", gap: "6px" }}>
                    {tempItems.map((item) => (
                      <div key={item.idArt} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}>
                        <span>{item.nomArt} (Cant: <strong>{item.canPre}</strong>)</span>
                        <button type="button" onClick={() => removeTempItem(item.idArt)} style={{ background: "none", border: "none", color: "#ff4757", fontSize: "14px" }}>
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="field" htmlFor="field-obs">
                <span>Observaciones</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea id="field-obs" placeholder="Motivo del préstamo, proyecto..." value={obsPres} onChange={(e) => setObsPres(e.target.value)} />
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Loan Details */}
      {isDetailOpen && selectedLoan && (
        <div className="modal-backdrop" onClick={() => setIsDetailOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Artículos del Préstamo #{selectedLoan.idPres}</h2>
                <p>Equipos tecnológicos incluidos en esta transacción.</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsDetailOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <div style={{ padding: "0 0 16px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Artículo</th>
                    <th>Nombre del Equipo</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {loanDetails.length > 0 ? loanDetails.map((det: any) => {
                    const artObj = articulos.find(a => a.idArt === det.idArt);
                    return (
                      <tr key={det.idArt}>
                        <td>
                          <code style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}>
                            #{det.idArt}
                          </code>
                        </td>
                        <td style={{ fontWeight: 600 }}>{artObj ? artObj.nomArt : `Artículo #${det.idArt}`}</td>
                        <td>{det.canPre} unidades</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                        No hay artículos asignados a este préstamo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Revisión de Devolución Física */}
      {isRevisionModalOpen && selectedLoanForRevision && (
        <div className="modal-backdrop" onClick={() => setIsRevisionModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <div className="modal-header">
              <div>
                <h2 style={{ color: "#0f172a", fontWeight: 900 }}>🔍 Revisión de Devolución #{selectedLoanForRevision.idPres}</h2>
                <p style={{ color: "#475569" }}>Verifique físicamente el equipo reportado antes de aceptar.</p>
              </div>
              <button onClick={() => setIsRevisionModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ display: "grid", gap: "12px", marginBottom: "20px", padding: "0 20px" }}>
              {/* Equipos */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>Equipos a devolver</div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Solicitante</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    {selectedLoanForRevision.detalles?.map((det: any, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < selectedLoanForRevision.detalles.length - 1 ? "8px" : "0" }}>
                        <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{getArticleName(det.idArt)}</span>
                        <span style={{ fontWeight: 800, color: "#172554", fontSize: "14px" }}>{det.canPre} ud.</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontWeight: 700, color: "#1e3a8a", fontSize: "13px", textAlign: "right" }}>
                    {usuarios.find(u => u.idUsr === selectedLoanForRevision.idUsr)
                      ? `${usuarios.find(u => u.idUsr === selectedLoanForRevision.idUsr)?.nomUsr} ${usuarios.find(u => u.idUsr === selectedLoanForRevision.idUsr)?.apeUsr}`
                      : `Usuario #${selectedLoanForRevision.idUsr}`}
                  </div>
                </div>
              </div>

              {/* Datos clave */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Cantidad a Recibir</div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#172554" }}>{revCantidad} <span style={{ fontSize: "14px", fontWeight: 700 }}>ud.</span></div>
                </div>
                <div style={{ 
                  background: revEstadoFisico === "EXCELENTE" ? "#dcfce7" : revEstadoFisico === "BUENO" ? "#dbeafe" : revEstadoFisico === "REGULAR" ? "#fef3c7" : revEstadoFisico === "MALO" ? "#fee2e2" : "#f1f5f9",
                  border: `1.5px solid ${revEstadoFisico === "EXCELENTE" ? "#86efac" : revEstadoFisico === "BUENO" ? "#93c5fd" : revEstadoFisico === "REGULAR" ? "#fde68a" : revEstadoFisico === "MALO" ? "#fca5a5" : "#cbd5e1"}`, 
                  borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: revEstadoFisico === "EXCELENTE" ? "#166534" : revEstadoFisico === "BUENO" ? "#1e40af" : revEstadoFisico === "REGULAR" ? "#b45309" : revEstadoFisico === "MALO" ? "#b91c1c" : "#475569", opacity: 0.8, textTransform: "uppercase", marginBottom: "6px" }}>Estado Físico Reportado</div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: revEstadoFisico === "EXCELENTE" ? "#166534" : revEstadoFisico === "BUENO" ? "#1e40af" : revEstadoFisico === "REGULAR" ? "#b45309" : revEstadoFisico === "MALO" ? "#b91c1c" : "#475569", letterSpacing: "1px" }}>{revEstadoFisico}</div>
                </div>
              </div>

              {/* Observaciones */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>Comentarios del Estudiante</div>
                <div style={{ color: "#334155", fontSize: "14px", lineHeight: 1.6, fontWeight: 500 }}>{revObservaciones || "Sin observaciones"}</div>
              </div>

              {/* Advertencia si dañado */}
              {(revEstadoFisico === "MALO" || revEstadoFisico === "REGULAR") && (
                <div style={{ background: "#78350f", border: "1.5px solid #d97706", borderRadius: "8px", padding: "12px 16px", color: "#fde68a", fontSize: "13px", fontWeight: 700, display: "flex", gap: "8px" }}>
                  <span>⚠️</span>
                  <span>Al aceptar, el equipo será marcado automáticamente como <strong>En Mantenimiento</strong>.</span>
                </div>
              )}

              <div style={{ background: "#1e3a8a", border: "1.5px solid #1e3a8a", borderRadius: "8px", padding: "12px 16px", color: "#bfdbfe", fontSize: "13px", fontWeight: 700, display: "flex", gap: "8px" }}>
                <span>ℹ️</span>
                <span><strong>Verificación Obligatoria:</strong> Verifica físicamente que la cantidad y estado coincidan antes de aceptar.</span>
              </div>
            </div>

              <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsRevisionModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn-danger" onClick={handleRejectDevolucion}>
                  ✕ Rechazar
                </button>
                <button
                  type="button"
                  onClick={handleAcceptDevolucion}
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
      )}
    </div>
  );
}
