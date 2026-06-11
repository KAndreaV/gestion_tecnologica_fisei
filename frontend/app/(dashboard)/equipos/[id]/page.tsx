"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { articulosService } from "@/features/equipos/equipo.service";
import { categoriasService } from "@/features/equipos/categoria.service";
import { estadosService } from "@/features/equipos/estado.service";
import { ubicacionesService } from "@/features/equipos/ubicacion.service";
import { departamentosService } from "@/features/equipos/departamento.service";
import { movimientosService } from "@/features/equipos/movimiento.service";
import { mantenimientosService } from "@/features/mantenimientos/mantenimiento.service";
import { usuariosService } from "@/features/usuarios/usuario.service";
import type { Articulo, Categoria, Estado, Ubicacion, Departamento } from "@/types/api";

export default function EquipoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idArt = Number(params.id);

  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // History timeline states
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [art, catList, estList, ubiList, depList, movList, maintList, usrList] = await Promise.all([
        articulosService.findOne(idArt),
        categoriasService.findAll(),
        estadosService.findAll(),
        ubicacionesService.findAll(),
        departamentosService.findAll(),
        movimientosService.findAll().catch(() => []),
        mantenimientosService.findAll().catch(() => []),
        usuariosService.findAll().catch(() => []),
      ]);

      setArticulo(art);
      setCategorias(catList || []);
      setEstados(estList || []);
      setUbicaciones(ubiList || []);
      setDepartamentos(depList || []);
      setUsuarios(usrList || []);

      // Filter movements related to this article
      const filteredMovs = (movList || []).filter((m: any) => m.idArt === idArt);
      setMovimientos(filteredMovs);

      // Filter maintenances related to this article
      const filteredMaints = (maintList || []).filter((m: any) => m.idArt === idArt);
      setMaintenances(filteredMaints);
    } catch (err) {
      console.error("Error al obtener detalle de artículo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idArt) {
      fetchData();
    }
  }, [idArt]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "var(--muted)" }}>
        Cargando detalles de equipo...
      </div>
    );
  }

  if (!articulo) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2 style={{ color: "#0f172a" }}>Equipo no encontrado</h2>
        <button className="btn-secondary" onClick={() => router.push("/equipos")} style={{ marginTop: "16px" }}>
          Volver a Equipos
        </button>
      </div>
    );
  }

  const catObj = categorias.find((c) => c.idCat === articulo.idCat);
  const estObj = estados.find((s) => s.idEst === articulo.idEst);
  const ubiObj = ubicaciones.find((u) => u.idUbi === articulo.idUbi);
  const depObj = departamentos.find((d) => d.idDep === articulo.idDep);

  // Category Icon Mock
  const isRed = catObj?.nomCat?.toUpperCase().includes("RED") || catObj?.nomCat?.toUpperCase().includes("CONECTIVIDAD");
  const iconMarkup = isRed ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" style={{ width: "90px", height: "90px" }}>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="10" x2="6" y2="14" />
      <line x1="18" y1="10" x2="18" y2="14" />
      <circle cx="6" cy="6" r="1" fill="#2563eb" />
      <circle cx="12" cy="6" r="1" fill="#2563eb" />
      <circle cx="6" cy="18" r="1" fill="#2563eb" />
      <circle cx="12" cy="18" r="1" fill="#2563eb" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" style={{ width: "90px", height: "90px" }}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );

  return (
    <div>
      {/* Header */}
      <section className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="section-kicker" style={{ color: "#1e3a8a", fontWeight: 700 }}>Ficha Técnica del Artículo</p>
          <h1 style={{ color: "#0f172a" }}>{articulo.nomArt}</h1>
          <p style={{ color: "#475569" }}>Consulta el estado, historial y trazabilidad del equipo tecnológico.</p>
        </div>
        <button className="btn-secondary" onClick={() => router.push("/equipos")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Volver
        </button>
      </section>

      {/* Main Grid: Card Details & Photo Mock */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", alignItems: "start", marginBottom: "20px" }}>
        {/* Left Side: Technical Info */}
        <section className="surface" style={{ padding: "24px" }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>Especificaciones Técnicas</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Identificador único
              </span>
              <strong style={{ fontSize: "14px", color: "#1e293b" }}>#{articulo.idArt}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Estado de Disponibilidad
              </span>
              <span className={`status-pill ${
                estObj?.nomEst === "DISPONIBLE" ? "ok" : estObj?.nomEst === "PRESTADO" ? "info" : "warn"
              }`} style={{ marginTop: "4px" }}>
                {estObj?.nomEst || `Estado #${articulo.idEst}`}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Marca
              </span>
              <strong style={{ fontSize: "14px", color: "#1e293b" }}>{articulo.marArt || "—"}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Modelo
              </span>
              <strong style={{ fontSize: "14px", color: "#1e293b" }}>{articulo.modArt || "—"}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Número de Serie
              </span>
              <code style={{ fontSize: "13px", color: "#475569", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                {articulo.serArt || "—"}
              </code>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Categoría del Bien
              </span>
              <strong style={{ fontSize: "14px", color: "#1e293b" }}>{catObj?.nomCat || `Categoría #${articulo.idCat}`}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Stock en Inventario
              </span>
              <strong style={{ fontSize: "14px", color: "#1e293b" }}>{articulo.canArt} unidad(es)</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Valor Unitario
              </span>
              <strong style={{ fontSize: "14px", color: "#334155" }}>${articulo.valArt.toFixed(2)}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Laboratorio asignado
              </span>
              <strong style={{ fontSize: "14px", color: "#1e293b" }}>{ubiObj?.nomUbi || `Ubicación #${articulo.idUbi}`}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block" }}>
                Departamento responsable
              </span>
              <strong style={{ fontSize: "14px", color: "#1e293b" }}>{depObj?.nomDep || `Depto. #${articulo.idDep}`}</strong>
            </div>
          </div>

          <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              Descripción física
            </span>
            <p style={{ color: "#475569", fontSize: "13.5px", lineHeight: "1.5" }}>{articulo.desArt || "Sin descripción física registrada."}</p>
          </div>
        </section>

        {/* Right Side: Photo Mockup & Ficha */}
        <section className="surface" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "340px", textAlign: "center" }}>
          <div style={{ width: "160px", height: "160px", borderRadius: "12px", border: "2px dashed #cbd5e1", display: "grid", placeItems: "center", background: "#f8fafc", marginBottom: "16px" }}>
            {iconMarkup}
          </div>
          <h2 style={{ fontSize: "15px", color: "#1e293b", fontWeight: 700, marginBottom: "4px" }}>Fotografía del Equipo</h2>
          <p style={{ fontSize: "12px", color: "#64748b", maxWidth: "220px", marginBottom: "16px" }}>
            Representación fotográfica según catálogo e inventario.
          </p>
          <span className="badge" style={{ backgroundColor: "#eff6ff", borderColor: "#3b82f6", color: "#1e3a8a", fontWeight: 700 }}>
            Bien Público UTA-FISEI
          </span>
        </section>
      </div>

      {/* Timelines Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        
        {/* Movements History (Trazabilidad) */}
        <section className="surface">
          <div className="block-head">
            <h2 style={{ color: "#0f172a" }}>Trazabilidad e Historial de Movimientos</h2>
            <p>Registro cronológico de asignaciones y traslados físicos de este activo.</p>
          </div>
          <div className="table-shell" style={{ padding: "10px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Código Mov.</th>
                  <th>Tipo Mov.</th>
                  <th>Fecha</th>
                  <th>Ubicación Origen</th>
                  <th>Ubicación Destino</th>
                  <th>Operador Encargado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length > 0 ? movimientos.map((m: any) => {
                  const ubiOriObj = ubicaciones.find(u => u.idUbi === m.idUbiOri);
                  const ubiDesObj = ubicaciones.find(u => u.idUbi === m.idUbiDes);
                  const usrObj = usuarios.find(u => u.idUsr === m.idUsr);

                  return (
                    <tr key={m.idMov}>
                      <td>
                        <code style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                          MOV-{String(m.idMov).padStart(3, "0")}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.tipMov}</td>
                      <td>{m.fecMov ? new Date(m.fecMov).toLocaleDateString() : "—"}</td>
                      <td>{ubiOriObj?.nomUbi || "Bodega General (Bodega)"}</td>
                      <td>{ubiDesObj?.nomUbi || "Bodega General (Bodega)"}</td>
                      <td>{usrObj ? `${usrObj.nomUsr} ${usrObj.apeUsr}` : `Usuario #${m.idUsr}`}</td>
                      <td style={{ color: "#64748b", fontSize: "13px" }}>{m.obsMov || "Sin observaciones"}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                      No se registran movimientos para este artículo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Maintenance History */}
        <section className="surface">
          <div className="block-head">
            <h2 style={{ color: "#0f172a" }}>Historial Técnico y de Mantenimiento</h2>
            <p>Control de revisiones preventivas y reparaciones correctivas.</p>
          </div>
          <div className="table-shell" style={{ padding: "10px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Código Mant.</th>
                  <th>Descripción</th>
                  <th>Tipo Mant.</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Técnico Responsable</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {maintenances.length > 0 ? maintenances.map((m: any) => {
                  const usrObj = usuarios.find(u => u.idUsr === m.idUsr);

                  return (
                    <tr key={m.idMan}>
                      <td>
                        <code style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "6px", fontSize: "13px" }}>
                          MAN-{String(m.idMan).padStart(3, "0")}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.desMan}</td>
                      <td>
                        <span className={`status-pill ${m.tipMan === "PREVENTIVO" ? "info" : "warn"}`}>
                          {m.tipMan}
                        </span>
                      </td>
                      <td>{m.fecIni ? new Date(m.fecIni).toLocaleDateString() : "—"}</td>
                      <td>{m.fecFin ? new Date(m.fecFin).toLocaleDateString() : "En curso (Activo)"}</td>
                      <td>{usrObj ? `${usrObj.nomUsr} ${usrObj.apeUsr}` : `Técnico #${m.idUsr}`}</td>
                      <td style={{ color: "#64748b", fontSize: "13px" }}>{m.obsMen || m.obsMan || "Sin observaciones técnicas"}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                      No se registran revisiones técnicas para este artículo.
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
