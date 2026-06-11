"use client";

import { useEffect, useState } from "react";
import { categoriasService } from "@/features/equipos/categoria.service";
import { useAuth } from "@/hooks/useAuth";
import type { Categoria } from "@/types/api";

export default function CategoriasPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrador" || !user;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  // Form Fields State
  const [nomCat, setNomCat] = useState("");
  const [desCat, setDesCat] = useState("");

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 5000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await categoriasService.findAll();
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditingCategoria(null);
    setNomCat("");
    setDesCat("");
    setIsModalOpen(true);
  };

  const openEdit = (cat: Categoria & { desCat?: string }) => {
    setEditingCategoria(cat);
    setNomCat(cat.nomCat || "");
    setDesCat(cat.desCat || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta categoría?")) {
      try {
        await categoriasService.delete(id);
        showNotification("success", "Categoría eliminada correctamente.");
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al eliminar: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCat) {
      showNotification("error", "El nombre es obligatorio");
      return;
    }

    const payload = {
      nomCat,
      desCat: desCat || undefined,
    };

    try {
      if (editingCategoria) {
        await categoriasService.update(editingCategoria.idCat, payload);
        showNotification("success", "Categoría actualizada correctamente.");
      } else {
        await categoriasService.create(payload);
        showNotification("success", "Categoría creada correctamente.");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al guardar: " + (err instanceof Error ? err.message : err));
    }
  };

  const filtered = categorias.filter((c: any) => {
    const matchSearch = !search || [c.nomCat, c.desCat || ""]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker">Módulo</p>
        <h1>Gestión de Categorías</h1>
        <p>Agrupación de equipos e insumos tecnológicos para catalogación y control de inventarios.</p>
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

      {/* Stat grid */}
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <article className="stat-card">
          <span>Categorías Totales</span>
          <strong>{categorias.length}</strong>
          <p>Grupos activos catalogados</p>
        </article>
        <article className="stat-card">
          <span>Último Registro</span>
          <strong>{categorias.length > 0 ? categorias[categorias.length - 1].nomCat : "—"}</strong>
          <p>Categoría añadida recientemente</p>
        </article>
      </section>

      {/* Toolbar */}
      <section className="surface" style={{ marginBottom: "14px" }}>
        <div className="toolbar">
          <label className="input-shell toolbar-search" htmlFor="cat-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="cat-search"
              type="search"
              placeholder="Buscar categoría por nombre o descripción…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          {isAdmin && (
            <button className="btn-primary" id="btn-nueva-categoria" onClick={openCreate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nueva categoría
            </button>
          )}
        </div>
      </section>

      {/* Table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2>Listado de categorías</h2>
            <p>{loading ? "Cargando catálogo..." : `${filtered.length} categoría${filtered.length !== 1 ? "s" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>

        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando categorías de la base de datos...
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  {isAdmin && <th style={{ width: "120px" }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((c: any) => (
                  <tr key={c.idCat}>
                    <td>
                      <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                        #{c.idCat}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.nomCat}</td>
                    <td style={{ color: "#9aafc8" }}>{c.desCat || "Sin descripción"}</td>
                    {isAdmin && (
                      <td>
                        <div className="actions-col">
                          <button className="icon-btn edit" onClick={() => openEdit(c)} aria-label={`Editar ${c.nomCat}`} title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16z" />
                            </svg>
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDelete(c.idCat)} aria-label={`Eliminar ${c.nomCat}`} title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron categorías.
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
                <h2>{editingCategoria ? "Editar Categoría" : "Nueva Categoría"}</h2>
                <p>{editingCategoria ? `Editando registro #${editingCategoria.idCat}` : "Añadir una nueva clasificación para el inventario."}</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mini-list" style={{ padding: 0 }}>
              <label className="field" htmlFor="field-nom">
                <span>Nombre de la Categoría</span>
                <div className="input-shell">
                  <input
                    id="field-nom"
                    type="text"
                    required
                    placeholder="Ej. Impresoras"
                    value={nomCat}
                    onChange={(e) => setNomCat(e.target.value)}
                  />
                </div>
              </label>

              <label className="field" htmlFor="field-des">
                <span>Descripción</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea
                    id="field-des"
                    placeholder="Detalles sobre este tipo de activos..."
                    value={desCat}
                    onChange={(e) => setDesCat(e.target.value)}
                  />
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategoria ? "Actualizar categoría" : "Guardar categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
