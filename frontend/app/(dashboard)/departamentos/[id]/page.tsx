"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { departamentosService } from "@/features/equipos/departamento.service";
import { ubicacionesService } from "@/features/equipos/ubicacion.service";
import { articulosService } from "@/features/equipos/equipo.service";
import type { Departamento, Ubicacion, Articulo } from "@/types/api";

export default function DepartamentoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idDep = Number(params.id);

  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dep, allUbi, allArt] = await Promise.all([
        departamentosService.findOne(idDep),
        ubicacionesService.findAll(),
        articulosService.findAll(),
      ]);

      setDepartamento(dep);
      
      // Filter locations belonging to this department
      const filteredUbi = (allUbi || []).filter((u) => u.idDep === idDep);
      setUbicaciones(filteredUbi);

      // Filter articles belonging to this department
      const filteredArt = (allArt || []).filter((a) => a.idDep === idDep);
      setArticulos(filteredArt);
    } catch (err) {
      console.error("Error al obtener detalle del departamento:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idDep) {
      fetchData();
    }
  }, [idDep]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "var(--muted)" }}>
        Cargando detalles del departamento...
      </div>
    );
  }

  if (!departamento) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2>Departamento no encontrado</h2>
        <button className="btn-secondary" onClick={() => router.push("/departamentos")} style={{ marginTop: "16px" }}>
          Volver a Departamentos
        </button>
      </div>
    );
  }

  // Calculate stats
  const totalValue = articulos.reduce((sum, art) => sum + art.valArt * art.canArt, 0);
  const totalItemsCount = articulos.reduce((sum, art) => sum + art.canArt, 0);

  return (
    <div>
      {/* Header */}
      <section className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="section-kicker">Detalle del Departamento</p>
          <h1>{departamento.nomDep}</h1>
          <p>{(departamento as any).desDep || "Sin descripción detallada disponible."}</p>
        </div>
        <button className="btn-secondary" onClick={() => router.push("/departamentos")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Volver
        </button>
      </section>

      {/* Stats Cards */}
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <article className="stat-card">
          <span>Ubicaciones Físicas</span>
          <strong>{ubicaciones.length}</strong>
          <p>Espacios asignados</p>
        </article>
        <article className="stat-card">
          <span>Cantidad de Equipos</span>
          <strong>{totalItemsCount}</strong>
          <p>Unidades totales registradas</p>
        </article>
        <article className="stat-card">
          <span>Valor del Inventario</span>
          <strong>${totalValue.toFixed(2)}</strong>
          <p>Valor total de los activos</p>
        </article>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px", alignItems: "start" }}>
        {/* Ubicaciones Section */}
        <section className="surface" style={{ padding: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid var(--line)" }}>
            Ubicaciones / Laboratorios
          </h2>
          {ubicaciones.length > 0 ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {ubicaciones.map((ubi) => (
                <div key={ubi.idUbi} style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--line)",
                }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e3a8a" }}>{ubi.nomUbi}</div>
                  <small style={{ color: "var(--muted)", fontSize: "12px" }}>{ubi.desUbi || "Sin descripción física"}</small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
              No hay ubicaciones asociadas a este departamento.
            </p>
          )}
        </section>

        {/* Equipos Section */}
        <section className="surface">
          <div className="block-head">
            <h2>Artículos e Inventario Tecnológico</h2>
            <p>Listado de equipos y stock asignados a este departamento.</p>
          </div>
          <div className="table-shell" style={{ padding: "10px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Artículo</th>
                  <th>Serie / Marca</th>
                  <th>Cantidad</th>
                  <th>Valor Unitario</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {articulos.length > 0 ? (
                  articulos.map((art) => (
                    <tr key={art.idArt}>
                      <td>
                        <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                          #{art.idArt}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{art.nomArt}</td>
                      <td>
                        <div>{art.serArt || "—"}</div>
                        <small style={{ color: "var(--muted)" }}>{art.marArt || "—"}</small>
                      </td>
                      <td>{art.canArt} unidades</td>
                      <td>${art.valArt.toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>
                        ${(art.valArt * art.canArt).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron artículos asignados a este departamento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
