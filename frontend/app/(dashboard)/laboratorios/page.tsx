"use client";

import { useEffect, useState } from "react";
import { ubicacionesService } from "@/features/equipos/ubicacion.service";
import { departamentosService } from "@/features/equipos/departamento.service";
import { articulosService } from "@/features/equipos/equipo.service";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Ubicacion, Departamento, Articulo } from "@/types/api";

const estadoPillClass: Record<string, string> = {
  Disponible:    "ok",
  Ocupado:       "info",
  Mantenimiento: "warn",
  Reservado:     "warn",
};

export default function LaboratoriosPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "Administrador") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [equipos, setEquipos] = useState<Articulo[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("Todos");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 5000);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUbi, setEditingUbi] = useState<Ubicacion | null>(null);

  // Form Fields State
  const [nomUbi, setNomUbi] = useState("");
  const [desUbi, setDesUbi] = useState("");
  const [idDep, setIdDep] = useState<number>(0);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ubiList, depList, artList] = await Promise.all([
        ubicacionesService.findAll(),
        departamentosService.findAll(),
        articulosService.findAll(),
      ]);

      setUbicaciones(ubiList || []);
      setDepartamentos(depList || []);
      setEquipos(artList || []);

      if (depList?.length > 0 && idDep === 0) {
        setIdDep(depList[0].idDep);
      }
    } catch (err) {
      console.error("Error al cargar laboratorios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditingUbi(null);
    setNomUbi("");
    setDesUbi("");
    setIdDep(departamentos[0]?.idDep ?? 1);
    setIsModalOpen(true);
  };

  const openEdit = (u: Ubicacion) => {
    setEditingUbi(u);
    setNomUbi(u.nomUbi);
    setDesUbi(u.desUbi || "");
    setIdDep(u.idDep);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este laboratorio/ubicación?")) {
      try {
        await ubicacionesService.delete(id);
        showNotification("success", "Laboratorio/ubicación eliminado correctamente.");
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al eliminar: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomUbi) {
      showNotification("error", "El nombre es obligatorio");
      return;
    }

    const payload = {
      nomUbi,
      desUbi: desUbi || undefined,
      idDep: Number(idDep),
    };

    try {
      if (editingUbi) {
        await ubicacionesService.update(editingUbi.idUbi, payload);
        showNotification("success", "Laboratorio/ubicación actualizado correctamente.");
      } else {
        await ubicacionesService.create(payload);
        showNotification("success", "Laboratorio/ubicación creado correctamente.");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al guardar: " + (err instanceof Error ? err.message : err));
    }
  };

  // Filtrado
  const filtered = ubicaciones.filter((u) => {
    const matchSearch = !search || [u.nomUbi, u.desUbi]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
    
    // El estado del laboratorio lo podemos simular o derivar
    const matchEst = selectedEstado === "Todos" || "Disponible" === selectedEstado;

    return matchSearch && matchEst;
  });

  // Métricas
  const counts = {
    total:       ubicaciones.length,
    equipados:   ubicaciones.filter((u) => equipos.some((e) => e.idUbi === u.idUbi)).length,
    departamentos: departamentos.length,
  };

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker">Módulo</p>
        <h1>Laboratorios y Espacios</h1>
        <p>Administración de laboratorios, asignación de departamentos y trazabilidad física del equipamiento.</p>
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

      {/* Stat cards */}
      <section className="stat-grid" aria-label="Resumen de laboratorios" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total laboratorios", value: counts.total,       note: "Espacios registrados", cls: "info" },
          { label: "Con equipos asociados", value: counts.equipados, note: "Espacios con stock activo", cls: "ok"   },
          { label: "Departamentos asociados", value: counts.departamentos, note: "Unidades académicas", cls: "warn" },
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
          <label className="input-shell toolbar-search" htmlFor="lab-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="lab-search"
              type="search"
              placeholder="Buscar laboratorio por nombre o descripción…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <button className="btn-primary" id="btn-nuevo-lab" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo laboratorio
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2>Listado de laboratorios / ubicaciones</h2>
            <p>{loading ? "Cargando espacios..." : `${filtered.length} espacio${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>
        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando laboratorios de la base de datos...
            </div>
          ) : (
            <table className="table" style={{ minWidth: "700px" }}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Departamento</th>
                  <th>Equipos asociados</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((u) => {
                  const depObj = departamentos.find(d => d.idDep === u.idDep);
                  const equipCount = equipos.filter(e => e.idUbi === u.idUbi).reduce((acc, curr) => acc + curr.canArt, 0);

                  return (
                    <tr key={u.idUbi}>
                      <td>
                        <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                          LAB-{String(u.idUbi).padStart(2, "0")}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.nomUbi}</td>
                      <td style={{ color: "#9aafc8", fontSize: "13px" }}>{u.desUbi || "Sin descripción"}</td>
                      <td>{depObj?.nomDep || `Depto. #${u.idDep}`}</td>
                      <td style={{ fontWeight: 700 }}>{equipCount} equipo(s)</td>
                      <td>
                        <span className="status-pill ok">
                          Disponible
                        </span>
                      </td>
                      <td>
                        <div className="actions-col">
                          <button className="icon-btn edit" onClick={() => openEdit(u)} aria-label={`Editar ${u.nomUbi}`} title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16z" />
                            </svg>
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDelete(u.idUbi)} aria-label={`Eliminar ${u.nomUbi}`} title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron laboratorios con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingUbi ? "Editar Laboratorio" : "Nuevo Laboratorio"}</h2>
                <p>{editingUbi ? `Editando registro #${editingUbi.idUbi}` : "Añadir una nueva ubicación física."}</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mini-list" style={{ padding: 0 }}>
              <label className="field" htmlFor="field-nom">
                <span>Nombre del Laboratorio / Ubicación</span>
                <div className="input-shell">
                  <input
                    id="field-nom"
                    type="text"
                    required
                    placeholder="Ej. Laboratorio de Software 1"
                    value={nomUbi}
                    onChange={(e) => setNomUbi(e.target.value)}
                  />
                </div>
              </label>

              <label className="field" htmlFor="field-des">
                <span>Descripción / Aula</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea
                    id="field-des"
                    placeholder="Detalles sobre el bloque, planta, capacidad..."
                    value={desUbi}
                    onChange={(e) => setDesUbi(e.target.value)}
                  />
                </div>
              </label>

              <label className="field" htmlFor="field-dep">
                <span>Departamento Responsable</span>
                <div className="input-shell">
                  <select
                    id="field-dep"
                    value={idDep}
                    onChange={(e) => setIdDep(Number(e.target.value))}
                  >
                    {departamentos.map((d) => <option key={d.idDep} value={d.idDep}>{d.nomDep}</option>)}
                  </select>
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUbi ? "Actualizar espacio" : "Guardar espacio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}