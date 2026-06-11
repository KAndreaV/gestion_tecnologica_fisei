"use client";

import { useEffect, useState } from "react";
import { departamentosService } from "@/features/equipos/departamento.service";
import { useAuth } from "@/hooks/useAuth";
import type { Departamento } from "@/types/api";
import Link from "next/link";

export default function DepartamentosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrador" || !user;

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null);

  // Form Fields State
  const [nomDep, setNomDep] = useState("");
  const [desDep, setDesDep] = useState("");

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 5000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await departamentosService.findAll();
      setDepartamentos(data || []);
    } catch (err) {
      console.error("Error al cargar departamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditingDepartamento(null);
    setNomDep("");
    setDesDep("");
    setIsModalOpen(true);
  };

  const openEdit = (dep: Departamento & { desDep?: string }) => {
    setEditingDepartamento(dep);
    setNomDep(dep.nomDep || "");
    setDesDep(dep.desDep || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este departamento?")) {
      try {
        await departamentosService.delete(id);
        showNotification("success", "Departamento eliminado correctamente.");
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al eliminar: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomDep) {
      showNotification("error", "El nombre es obligatorio");
      return;
    }

    const payload = {
      nomDep,
      desDep: desDep || undefined,
    };

    try {
      if (editingDepartamento) {
        await departamentosService.update(editingDepartamento.idDep, payload);
        showNotification("success", "Departamento actualizado correctamente.");
      } else {
        await departamentosService.create(payload);
        showNotification("success", "Departamento creado correctamente.");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al guardar: " + (err instanceof Error ? err.message : err));
    }
  };

  const filtered = departamentos.filter((d: any) => {
    const matchSearch = !search || [d.nomDep, d.desDep || ""]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker">Módulo</p>
        <h1>Gestión de Departamentos</h1>
        <p>Administración de unidades académicas y administrativas del centro FISEI.</p>
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
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <article className="stat-card">
          <span>Departamentos Registrados</span>
          <strong>{departamentos.length}</strong>
          <p>Unidades activas catalogadas</p>
        </article>
        <article className="stat-card">
          <span>Último Departamento</span>
          <strong>{departamentos.length > 0 ? departamentos[departamentos.length - 1].nomDep : "—"}</strong>
          <p>Unidad agregada recientemente</p>
        </article>
      </section>

      {/* Toolbar */}
      <section className="surface" style={{ marginBottom: "14px" }}>
        <div className="toolbar">
          <label className="input-shell toolbar-search" htmlFor="dep-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="dep-search"
              type="search"
              placeholder="Buscar departamento por nombre o descripción…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          {isAdmin && (
            <button className="btn-primary" id="btn-nuevo-departamento" onClick={openCreate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nuevo departamento
            </button>
          )}
        </div>
      </section>

      {/* Table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2>Listado de departamentos</h2>
            <p>{loading ? "Cargando departamentos..." : `${filtered.length} departamento${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>

        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando departamentos de la base de datos...
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th style={{ width: "160px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((d: any) => (
                  <tr key={d.idDep}>
                    <td>
                      <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                        #{d.idDep}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.nomDep}</td>
                    <td style={{ color: "#9aafc8" }}>{d.desDep || "Sin descripción"}</td>
                    <td>
                      <div className="actions-col">
                        <Link href={`/departamentos/${d.idDep}`} className="icon-btn view" title="Ver Detalle">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                        {isAdmin && (
                          <>
                            <button className="icon-btn edit" onClick={() => openEdit(d)} aria-label={`Editar ${d.nomDep}`} title="Editar">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16z" />
                              </svg>
                            </button>
                            <button className="icon-btn delete" onClick={() => handleDelete(d.idDep)} aria-label={`Eliminar ${d.nomDep}`} title="Eliminar">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron departamentos.
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
                <h2>{editingDepartamento ? "Editar Departamento" : "Nuevo Departamento"}</h2>
                <p>{editingDepartamento ? `Editando registro #${editingDepartamento.idDep}` : "Añadir una nueva área organizativa."}</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mini-list" style={{ padding: 0 }}>
              <label className="field" htmlFor="field-nom">
                <span>Nombre del Departamento</span>
                <div className="input-shell">
                  <input
                    id="field-nom"
                    type="text"
                    required
                    placeholder="Ej. Redes e Internet"
                    value={nomDep}
                    onChange={(e) => setNomDep(e.target.value)}
                  />
                </div>
              </label>

              <label className="field" htmlFor="field-des">
                <span>Descripción</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea
                    id="field-des"
                    placeholder="Detalles del departamento académico o área de trabajo..."
                    value={desDep}
                    onChange={(e) => setDesDep(e.target.value)}
                  />
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingDepartamento ? "Actualizar depto" : "Guardar depto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
