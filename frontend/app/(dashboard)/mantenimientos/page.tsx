"use client";

import { useEffect, useState } from "react";
import { mantenimientosService } from "@/features/mantenimientos/mantenimiento.service";
import { articulosService } from "@/features/equipos/equipo.service";
import { usuariosService } from "@/features/usuarios/usuario.service";
import { estadosService } from "@/features/equipos/estado.service";
import { useAuth } from "@/hooks/useAuth";
import type { Articulo, Usuario, Estado, Mantenimiento } from "@/types/api";

export default function MantenimientosPage() {
  const { user } = useAuth();
  const isAdminOrTec = user?.role === "Administrador" || user?.role === "Técnico";

  const [maintenances, setMaintenances] = useState<Mantenimiento[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Todos");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState<Mantenimiento | null>(null);

  // Create Form State
  const [desMan, setDesMan] = useState("");
  const [tipMan, setTipMan] = useState("PREVENTIVO");
  const [fecIni, setFecIni] = useState("");
  const [idArt, setIdArt] = useState<number>(0);
  const [idUsr, setIdUsr] = useState<number>(0);

  // Complete Form State
  const [fecFin, setFecFin] = useState("");
  const [obsMan, setObsMan] = useState("");

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 5000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [maintList, artList, usrList, estList] = await Promise.all([
        mantenimientosService.findAll(),
        articulosService.findAll(),
        usuariosService.findAll(),
        estadosService.findAll(),
      ]);

      setMaintenances(maintList || []);
      setArticulos(artList || []);
      // Filter technicians or allow all users
      setUsuarios(usrList || []);
      setEstados(estList || []);

      if (artList?.length > 0) setIdArt(artList[0].idArt);
      // Try to find a technician first, or default to first user
      const tecs = usrList.filter(u => u.idRol === 4);
      if (tecs.length > 0) {
        setIdUsr(tecs[0].idUsr);
      } else if (usrList?.length > 0) {
        setIdUsr(usrList[0].idUsr);
      }

      setFecIni(new Date().toISOString().split("T")[0]);
      setFecFin(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Error al cargar mantenimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setDesMan("");
    setTipMan("PREVENTIVO");
    setFecIni(new Date().toISOString().split("T")[0]);
    if (articulos.length > 0) setIdArt(articulos[0].idArt);
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desMan) {
      showNotification("error", "La descripción es requerida");
      return;
    }

    // 5 is EN_MANTENIMIENTO
    const maintEst = estados.find(es => es.nomEst === "EN_MANTENIMIENTO" || es.nomEst === "EN MANTENIMIENTO")?.idEst ?? 5;

    const payload = {
      desMan,
      tipMan,
      fecIni: new Date(fecIni).toISOString(),
      idArt: Number(idArt),
      idUsr: Number(idUsr),
      idEst: maintEst
    };

    try {
      // 1. Create Maintenance
      await mantenimientosService.create(payload);
      
      // 2. Set Article State to EN_MANTENIMIENTO (5)
      await articulosService.update(Number(idArt), { idEst: maintEst });

      showNotification("success", "Mantenimiento registrado y equipo puesto en estado 'En Mantenimiento'.");
      setIsCreateOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al crear: " + (err instanceof Error ? err.message : err));
    }
  };

  const openComplete = (m: Mantenimiento) => {
    setSelectedMaint(m);
    setFecFin(new Date().toISOString().split("T")[0]);
    setObsMan("");
    setIsCompleteOpen(true);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaint) return;

    try {
      // 1. Update Maintenance with end date and observations
      await mantenimientosService.update(selectedMaint.idMan, {
        fecFin: new Date(fecFin).toISOString(),
        obsMen: obsMan || "Completado correctamente",
      });

      // 2. Return article status to DISPONIBLE (2)
      await articulosService.update(selectedMaint.idArt, { idEst: 2 });

      showNotification("success", `Mantenimiento #${selectedMaint.idMan} completado. Equipo retornado a estado 'Disponible'.`);
      setIsCompleteOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al completar: " + (err instanceof Error ? err.message : err));
    }
  };

  const handleDelete = async (id: number, artId: number) => {
    if (confirm("¿Está seguro de que desea eliminar este registro?")) {
      try {
        await mantenimientosService.delete(id);
        // Retornar artículo a disponible
        await articulosService.update(artId, { idEst: 2 });
        showNotification("success", "Registro eliminado y equipo liberado.");
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al eliminar: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const filtered = maintenances.filter((m) => {
    const artObj = articulos.find(a => a.idArt === m.idArt);
    const artName = artObj ? artObj.nomArt.toLowerCase() : "";
    const matchSearch = !search || (m.desMan || "").toLowerCase().includes(search.toLowerCase()) || artName.includes(search.toLowerCase());

    const matchType = filterType === "Todos" ||
      (filterType === "En curso" && !m.fecFin) ||
      (filterType === "Finalizados" && m.fecFin);

    return matchSearch && matchType;
  });

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker" style={{ color: "#1e3a8a", fontWeight: 700 }}>Módulo</p>
        <h1 style={{ color: "#0f172a" }}>Control de Mantenimientos</h1>
        <p style={{ color: "#475569" }}>Agenda de mantenimiento técnico preventivo y correctivo de los equipos tecnológicos de la FISEI.</p>
      </section>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>
      )}

      {/* Metrics */}
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <article className="stat-card">
          <span style={{ color: "#475569", fontWeight: 600 }}>Revisiones Agendadas</span>
          <strong style={{ color: "#0f172a" }}>{maintenances.length}</strong>
          <p style={{ color: "#64748b" }}>Mantenimientos totales</p>
        </article>
        <article className="stat-card">
          <span style={{ color: "#475569", fontWeight: 600 }}>Servicios en Curso</span>
          <strong style={{ color: "#0f172a" }}>{maintenances.filter(m => !m.fecFin).length}</strong>
          <p style={{ color: "#64748b" }}>Equipos en mantenimiento activo</p>
        </article>
        <article className="stat-card">
          <span style={{ color: "#475569", fontWeight: 600 }}>Servicios Completados</span>
          <strong style={{ color: "#0f172a" }}>{maintenances.filter(m => m.fecFin).length}</strong>
          <p style={{ color: "#64748b" }}>Mantenimientos finalizados</p>
        </article>
      </section>

      {/* Toolbar */}
      <section className="surface" style={{ marginBottom: "14px" }}>
        <div className="toolbar">
          <label className="input-shell toolbar-search" htmlFor="maint-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="maint-search"
              type="search"
              placeholder="Buscar por descripción o equipo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="input-shell" htmlFor="filter-maint-type" style={{ minWidth: "160px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            <select id="filter-maint-type" value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Filtrar por tipo de mantenimiento">
              <option value="Todos">Todos los estados</option>
              <option value="En curso">En curso</option>
              <option value="Finalizados">Finalizados</option>
            </select>
          </label>

          {isAdminOrTec && (
            <button className="btn-primary" id="btn-nuevo-mantenimiento" onClick={openCreate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Agendar Mantenimiento
            </button>
          )}
        </div>
      </section>

      {/* Main Table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2 style={{ color: "#0f172a" }}>Listado de Mantenimientos Técnicos</h2>
            <p>{loading ? "Cargando agenda..." : `${filtered.length} registro${filtered.length !== 1 ? "s" : ""} agendado${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>

        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando mantenimientos desde Oracle DB...
            </div>
          ) : (
            <table className="table" style={{ minWidth: "750px" }}>
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Artículo / Equipo</th>
                  <th>Descripción del Servicio</th>
                  <th>Tipo</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Técnico</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((m: any) => {
                  const artObj = articulos.find(a => a.idArt === m.idArt);
                  const usrObj = usuarios.find(u => u.idUsr === m.idUsr);
                  const isActivo = !m.fecFin;

                  return (
                    <tr key={m.idMan}>
                      <td>
                        <code style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}>
                          #{m.idMan}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{artObj?.nomArt || `Equipo #${m.idArt}`}</td>
                      <td>{m.desMan}</td>
                      <td>
                        <span className={`status-pill ${m.tipMan === "PREVENTIVO" ? "info" : "warn"}`}>
                          {m.tipMan}
                        </span>
                      </td>
                      <td>{new Date(m.fecIni).toLocaleDateString()}</td>
                      <td>{m.fecFin ? new Date(m.fecFin).toLocaleDateString() : "—"}</td>
                      <td>{usrObj ? `${usrObj.nomUsr} ${usrObj.apeUsr}` : `Operador #${m.idUsr}`}</td>
                      <td>
                        <div className="actions-col">
                          {isAdminOrTec && isActivo && (
                            <button className="icon-btn edit" onClick={() => openComplete(m)} title="Finalizar Mantenimiento">
                              ✓
                            </button>
                          )}
                          {isAdminOrTec && (
                            <button className="icon-btn delete" onClick={() => handleDelete(m.idMan, m.idArt)} title="Eliminar Registro">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron mantenimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal: Agendar Mantenimiento */}
      {isCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <div className="modal-header">
              <div>
                <h2>Agendar Mantenimiento Técnico</h2>
                <p>Registra una orden de mantenimiento preventivo o correctivo para un artículo.</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsCreateOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>✕</button>
            </div>

            <form onSubmit={handleCreate} className="mini-list" style={{ padding: 0 }}>
              <label className="field" htmlFor="field-art">
                <span>Artículo / Equipo a Intervenir</span>
                <div className="input-shell">
                  <select id="field-art" value={idArt} onChange={(e) => setIdArt(Number(e.target.value))}>
                    {articulos.map((a) => <option key={a.idArt} value={a.idArt}>{a.nomArt} (Serie: {a.serArt || "Sin serie"})</option>)}
                  </select>
                </div>
              </label>

              <div className="form-row">
                <label className="field" htmlFor="field-tipo">
                  <span>Tipo de Mantenimiento</span>
                  <div className="input-shell">
                    <select id="field-tipo" value={tipMan} onChange={(e) => setTipMan(e.target.value)}>
                      <option value="PREVENTIVO">PREVENTIVO</option>
                      <option value="CORRECTIVO">CORRECTIVO</option>
                    </select>
                  </div>
                </label>

                <label className="field" htmlFor="field-fec-ini">
                  <span>Fecha de Inicio</span>
                  <div className="input-shell">
                    <input id="field-fec-ini" type="date" value={fecIni} onChange={(e) => setFecIni(e.target.value)} required />
                  </div>
                </label>
              </div>

              <label className="field" htmlFor="field-usr">
                <span>Técnico Asignado</span>
                <div className="input-shell">
                  <select id="field-usr" value={idUsr} onChange={(e) => setIdUsr(Number(e.target.value))}>
                    {usuarios.map((u) => <option key={u.idUsr} value={u.idUsr}>{u.nomUsr} {u.apeUsr} ({u.idRol === 1 ? "Admin" : u.idRol === 4 ? "Técnico" : "Docente"})</option>)}
                  </select>
                </div>
              </label>

              <label className="field" htmlFor="field-desc">
                <span>Descripción del Trabajo / Falla reportada</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea id="field-desc" value={desMan} onChange={(e) => setDesMan(e.target.value)} placeholder="Detalla las tareas a realizar o la anomalía presentada del equipo..." required />
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Aceptar / Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Mantenimiento */}
      {isCompleteOpen && (
        <div className="modal-backdrop" onClick={() => setIsCompleteOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <div>
                <h2>Finalizar Mantenimiento</h2>
                <p>Cierra la orden técnica registrando la fecha de conclusión y observaciones.</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsCompleteOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>✕</button>
            </div>

            <form onSubmit={handleComplete} className="mini-list" style={{ padding: 0 }}>
              <label className="field" htmlFor="field-fec-fin">
                <span>Fecha de Conclusión</span>
                <div className="input-shell">
                  <input id="field-fec-fin" type="date" value={fecFin} onChange={(e) => setFecFin(e.target.value)} required />
                </div>
              </label>

              <label className="field" htmlFor="field-obs">
                <span>Diagnóstico / Observaciones Técnicas</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea id="field-obs" value={obsMan} onChange={(e) => setObsMan(e.target.value)} placeholder="Detalla los repuestos cambiados, solución de la falla, estado final..." required />
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsCompleteOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Finalizar Mantenimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
