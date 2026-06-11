"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { articulosService } from "@/features/equipos/equipo.service";
import { categoriasService } from "@/features/equipos/categoria.service";
import { estadosService } from "@/features/equipos/estado.service";
import { ubicacionesService } from "@/features/equipos/ubicacion.service";
import { departamentosService } from "@/features/equipos/departamento.service";
import { prestamosService } from "@/features/prestamos/prestamo.service";
import { useAuth } from "@/hooks/useAuth";
import type { Articulo, Categoria, Estado, Ubicacion, Departamento } from "@/types/api";

import { useNotifications } from "@/context/NotificationContext";

const estadoPillClass: Record<string, string> = {
  Disponible: "ok",
  Prestado: "info",
  Mantenimiento: "warn",
  Baja: "danger",
};

// SVG renderer helper for premium equipment cards
export function getEquipmentSvg(imgType: string) {
  switch (imgType) {
    case "desktop":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: "48px", height: "48px" }}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M6 21h12M12 17v4" />
        </svg>
      );
    case "router":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: "48px", height: "48px" }}>
          <rect x="2" y="14" width="20" height="6" rx="1" />
          <path d="M6 14v-4M18 14v-4M12 14V6M12 6l-3 3M12 6l3 3" />
        </svg>
      );
    case "oscilloscope":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: "48px", height: "48px" }}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 12h3l2-4 2 8 2-4h3" />
          <circle cx="17" cy="7" r="1" />
        </svg>
      );
    case "cable":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: "48px", height: "48px" }}>
          <path d="M6 2v6M18 2v6M6 8c0 4 3 6 6 6s6-2 6-6M12 14v8" />
        </svg>
      );
    case "laptop":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: "48px", height: "48px" }}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M2 20h20M5 16v4M19 16v4" />
        </svg>
      );
  }
}

// Metadata parser for [IMG:type] tag inside description
export function parseEquipoImage(desArt?: string, catName?: string): { cleanDesc: string; imageType: string } {
  if (!desArt) return { cleanDesc: "", imageType: "laptop" };
  const match = desArt.match(/\[IMG:(.*?)\]/);
  if (match) {
    const type = match[1];
    const clean = desArt.replace(/\[IMG:.*?\]/, "").trim();
    return { cleanDesc: clean, imageType: type };
  }
  const cat = catName?.toLowerCase() || "";
  let type = "laptop";
  if (cat.includes("red") || cat.includes("conect")) type = "router";
  else if (cat.includes("comput") || cat.includes("pc")) type = "desktop";
  return { cleanDesc: desArt, imageType: type };
}

export default function EquiposPage() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const isUser = user?.role === "Docente" || user?.role === "Estudiante";
  const isAdmin = !isUser;
  const showActions = isAdmin || isUser;

  const [equipos, setEquipos] = useState<Articulo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Todas");
  const [selectedEst, setSelectedEst] = useState("Todos");
  const [selectedUbi, setSelectedUbi] = useState("Todas");
  const [selectedDep, setSelectedDep] = useState("Todos");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New States for User Loans
  const [misPrestamos, setMisPrestamos] = useState<any[]>([]);
  const [loadingPrestamos, setLoadingPrestamos] = useState(false);
  const [isSolicitudModalOpen, setIsSolicitudModalOpen] = useState(false);
  const [selectedEquipoForLoan, setSelectedEquipoForLoan] = useState<Articulo | null>(null);
  const [loanCantidad, setLoanCantidad] = useState(1);
  const [loanFechaDevolucion, setLoanFechaDevolucion] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Devolución Form States
  const [isDevolucionModalOpen, setIsDevolucionModalOpen] = useState(false);
  const [selectedLoanForDevolucion, setSelectedLoanForDevolucion] = useState<any | null>(null);
  const [devCantidad, setDevCantidad] = useState(1);
  const [devEstadoFisico, setDevEstadoFisico] = useState("BUENO");
  const [devObservaciones, setDevObservaciones] = useState("");

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 5000);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Articulo | null>(null);

  // Form Fields State
  const [nomArt, setNomArt] = useState("");
  const [desArt, setDesArt] = useState("");
  const [serArt, setSerArt] = useState("");
  const [marArt, setMarArt] = useState("");
  const [modArt, setModArt] = useState("");
  const [canArt, setCanArt] = useState(1);
  const [valArt, setValArt] = useState<number | "">("");
  const [idCat, setIdCat] = useState<number>(0);
  const [idEst, setIdEst] = useState<number>(0);
  const [idUbi, setIdUbi] = useState<number>(0);
  const [selectedImg, setSelectedImg] = useState("laptop");

  const fetchMisPrestamos = async () => {
    if (!user) return;
    try {
      setLoadingPrestamos(true);
      const all = await prestamosService.findAll();
      const myLoans = all.filter((p: any) => String(p.idUsr) === String(user.id ?? ""));

      const loansWithDetails = await Promise.all(
        myLoans.map(async (loan: any) => {
          try {
            const details = await prestamosService.getDetalles(loan.idPres);
            return { ...loan, detalles: details || [] };
          } catch {
            return { ...loan, detalles: [] };
          }
        })
      );
      setMisPrestamos(loansWithDetails);
    } catch (err) {
      console.error("Error fetching my loans:", err);
    } finally {
      setLoadingPrestamos(false);
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [artList, catList, estList, ubiList, depList] = await Promise.all([
        articulosService.findAll(),
        categoriasService.findAll(),
        estadosService.findAll(),
        ubicacionesService.findAll(),
        departamentosService.findAll().catch(() => []),
      ]);

      setEquipos(artList || []);
      setCategorias(catList || []);
      setDepartamentos(depList || []);

      const filteredEst = (estList || []).filter(
        (e: any) => !e.tipoEst || e.tipoEst.toUpperCase() === "ARTICULO"
      );
      setEstados(filteredEst);
      setUbicaciones(ubiList || []);

      if (catList?.length > 0 && idCat === 0) setIdCat(catList[0].idCat);
      if (filteredEst?.length > 0 && idEst === 0) setIdEst(filteredEst[0].idEst);
      if (ubiList?.length > 0 && idUbi === 0) setIdUbi(ubiList[0].idUbi);

    } catch (err) {
      console.error("Error al cargar datos en EquiposPage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    if (isUser) {
      fetchMisPrestamos();
    }
  }, [user, isUser]);

  // User self-service handlers
  const handleOpenSolicitudModal = (eq: Articulo) => {
    setSelectedEquipoForLoan(eq);
    setLoanCantidad(1);
    setLoanFechaDevolucion(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setIsSolicitudModalOpen(true);
  };

  const handleCreateLoanSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipoForLoan || !user) return;
    if (loanCantidad <= 0 || loanCantidad > selectedEquipoForLoan.canArt) {
      showNotification("error", `La cantidad debe estar entre 1 y ${selectedEquipoForLoan.canArt}.`);
      return;
    }
    if (!loanFechaDevolucion) {
      showNotification("error", "Debe seleccionar una fecha de devolución.");
      return;
    }

    try {
      const payload = {
        fecPres: new Date().toISOString(),
        fecDevolucion: new Date(loanFechaDevolucion).toISOString(),
        idUsr: Number(user.id ?? 0),
        idEst: 4, // PENDIENTE
        obsPres: "Solicitud de Préstamo",
      };

      const createdLoan = await prestamosService.create(payload);
      const loanId = createdLoan.idPres;

      await prestamosService.addDetalle(loanId, {
        idArt: selectedEquipoForLoan.idArt,
        canPre: loanCantidad,
      });

      // Dispatch notifications to managers
      sendNotification(
        "✅ Nueva Solicitud de Préstamo",
        `${user.name || user.email} ha solicitado ${loanCantidad} ud. de ${selectedEquipoForLoan.nomArt}.`,
        "Docente"
      );
      sendNotification(
        "✅ Nueva Solicitud de Préstamo",
        `${user.name || user.email} ha solicitado ${loanCantidad} ud. de ${selectedEquipoForLoan.nomArt}.`,
        "Técnico"
      );

      showNotification("success", `Solicitud de préstamo #${loanId} enviada con éxito.`);
      setIsSolicitudModalOpen(false);
      fetchAll();
      fetchMisPrestamos();
    } catch (err) {
      showNotification("error", "Error al enviar la solicitud: " + (err instanceof Error ? err.message : err));
    }
  };

  const handleCancelSolicitud = async (loanId: number) => {
    if (confirm(`¿Está seguro de que desea cancelar la solicitud #${loanId}?`)) {
      try {
        await prestamosService.delete(loanId);
        showNotification("success", "Solicitud cancelada correctamente.");
        fetchAll();
        fetchMisPrestamos();
      } catch (err) {
        showNotification("error", "Error al cancelar la solicitud: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  // Devolution modal handlers
  const handleOpenDevolucionModal = (loan: any) => {
    setSelectedLoanForDevolucion(loan);
    setDevCantidad(loan.detalles?.[0]?.canPre || 1);
    setDevEstadoFisico("BUENO");
    setDevObservaciones("");
    setIsDevolucionModalOpen(true);
  };

  const handleCreateDevolucionSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForDevolucion || !user) return;
    try {
      const devObs = `DEVOLUCION_PENDIENTE|Cant:${devCantidad}|Estado:${devEstadoFisico}|Obs:${devObservaciones || "Sin observaciones"}`;
      await prestamosService.update(selectedLoanForDevolucion.idPres, {
        obsPres: devObs,
      });

      const eqName = selectedLoanForDevolucion.detalles?.[0]?.articulo?.nomArt || "equipo";
      sendNotification(
        "📦 Solicitud de Devolución",
        `${user.name || user.email} solicita devolver ${devCantidad} ud. de ${eqName} (Estado: ${devEstadoFisico}).`,
        "Docente"
      );
      sendNotification(
        "📦 Solicitud de Devolución",
        `${user.name || user.email} solicita devolver ${devCantidad} ud. de ${eqName} (Estado: ${devEstadoFisico}).`,
        "Técnico"
      );

      showNotification("success", "Solicitud de devolución enviada.");
      setIsDevolucionModalOpen(false);
      fetchMisPrestamos();
    } catch (err) {
      showNotification("error", "Error al enviar la devolución: " + (err instanceof Error ? err.message : err));
    }
  };

  const handleCancelarDevolucion = async (loanId: number) => {
    if (confirm("¿Cancelar la solicitud de devolución?")) {
      try {
        await prestamosService.update(loanId, {
          obsPres: "Préstamo activo",
        });
        showNotification("success", "Solicitud de devolución cancelada.");
        fetchMisPrestamos();
      } catch (err) {
        showNotification("error", "Error al cancelar la devolución: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const openCreate = () => {
    setEditingEquipo(null);
    setNomArt("");
    setDesArt("");
    setSelectedImg("laptop");
    setSerArt("");
    setMarArt("");
    setModArt("");
    setCanArt(1);
    setValArt("");
    setIdCat(categorias[0]?.idCat ?? 1);
    setIdEst(estados[0]?.idEst ?? 1);
    setIdUbi(ubicaciones[0]?.idUbi ?? 1);
    setIsModalOpen(true);
  };

  const openEdit = (eq: Articulo) => {
    const catObj = categorias.find(c => c.idCat === eq.idCat);
    const { cleanDesc, imageType } = parseEquipoImage(eq.desArt, catObj?.nomCat);

    setEditingEquipo(eq);
    setNomArt(eq.nomArt || "");
    setDesArt(cleanDesc);
    setSelectedImg(imageType);
    setSerArt(eq.serArt || "");
    setMarArt(eq.marArt || "");
    setModArt(eq.modArt || "");
    setCanArt(eq.canArt || 1);
    setValArt(eq.valArt !== undefined && eq.valArt !== null ? eq.valArt : "");
    setIdCat(eq.idCat);
    setIdEst(eq.idEst);
    setIdUbi(eq.idUbi ?? (ubicaciones[0]?.idUbi ?? 1));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este equipo?")) {
      try {
        await articulosService.delete(id);
        showNotification("success", "Equipo eliminado correctamente.");
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al eliminar: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomArt) {
      showNotification("error", "El nombre del equipo es obligatorio");
      return;
    }

    const selectedUbi = ubicaciones.find(u => u.idUbi === Number(idUbi));
    const descWithImg = desArt ? `${desArt} [IMG:${selectedImg}]` : `[IMG:${selectedImg}]`;

    const payload = {
      nomArt,
      desArt: descWithImg,
      serArt: serArt || undefined,
      marArt: marArt || undefined,
      modArt: modArt || undefined,
      canArt: Number(canArt),
      valArt: valArt === "" ? 0 : Number(valArt),
      idCat: Number(idCat),
      idEst: Number(idEst),
      idUbi: idUbi ? Number(idUbi) : undefined,
      idDep: selectedUbi ? Number(selectedUbi.idDep) : undefined,
    };

    try {
      if (editingEquipo) {
        await articulosService.update(editingEquipo.idArt, payload);
        showNotification("success", "Equipo actualizado correctamente.");
      } else {
        await articulosService.create(payload);
        showNotification("success", "Equipo creado correctamente.");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al guardar: " + (err instanceof Error ? err.message : err));
    }
  };

  const filtered = equipos.filter((eq) => {
    const matchSearch = !search || [eq.nomArt, eq.desArt, eq.serArt, eq.marArt, eq.modArt]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()));

    const catObj = categorias.find(c => c.idCat === eq.idCat);
    const matchCat = selectedCat === "Todas" || catObj?.nomCat === selectedCat;

    const estObj = estados.find(s => s.idEst === eq.idEst);
    const matchEst = selectedEst === "Todos" || estObj?.nomEst === selectedEst;

    const ubiObj = ubicaciones.find(u => u.idUbi === eq.idUbi);
    const matchUbi = selectedUbi === "Todas" || ubiObj?.nomUbi === selectedUbi;

    const depObj = departamentos.find(d => d.idDep === eq.idDep);
    const matchDep = selectedDep === "Todos" || depObj?.nomDep === selectedDep;

    return matchSearch && matchCat && matchEst && matchUbi && matchDep;
  });

  return (
    <div>
      {isAdmin ? (
        <section className="page-header">
          <p className="section-kicker" style={{ color: "#1e3a8a", fontWeight: 700 }}>Módulo</p>
          <h1 style={{ color: "#0f172a" }}>Gestión de Equipos</h1>
          <p style={{ color: "#475569" }}>Control de stock, estados de disponibilidad y trazabilidad por ubicación en tiempo real.</p>
        </section>
      ) : (
        <section className="hero-banner" style={{ backgroundImage: "url('/images/laboratorio-bg.png')" }}>
          <div className="hero-banner-content">
            <p className="section-kicker" style={{ color: "#ffffff", fontWeight: 800, marginBottom: "4px" }}>Módulo</p>
            <h1 style={{ color: "#ffffff" }}>Gestión de Equipos</h1>
            <p style={{ color: "#ffffff" }}>Control de stock, estados de disponibilidad y trazabilidad por ubicación en tiempo real.</p>
          </div>
        </section>
      )}

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

      {/* Toolbar */}
      <section className="surface" style={{ marginBottom: "14px" }}>
        <div className="toolbar">
          {/* Search */}
          <label className="input-shell toolbar-search" htmlFor="equipo-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="equipo-search"
              type="search"
              placeholder="Buscar por nombre, serie, marca, modelo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          {/* Categoría */}
          <label className="input-shell" htmlFor="filter-categoria" style={{ minWidth: "160px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            <select
              id="filter-categoria"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="Todas">Todas las categorías</option>
              {categorias.map((c) => <option key={c.idCat} value={c.nomCat}>{c.nomCat}</option>)}
            </select>
          </label>

          {/* Estado */}
          <label className="input-shell" htmlFor="filter-estado" style={{ minWidth: "160px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            </svg>
            <select
              id="filter-estado"
              value={selectedEst}
              onChange={(e) => setSelectedEst(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="Todos">Todos los estados</option>
              {estados.map((s) => <option key={s.idEst} value={s.nomEst}>{s.nomEst}</option>)}
            </select>
          </label>

          {/* Ubicación */}
          <label className="input-shell" htmlFor="filter-ubicacion" style={{ minWidth: "160px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
            <select
              id="filter-ubicacion"
              value={selectedUbi}
              onChange={(e) => setSelectedUbi(e.target.value)}
              aria-label="Filtrar por ubicación"
            >
              <option value="Todas">Todas las ubicaciones</option>
              {ubicaciones.map((u) => <option key={u.idUbi} value={u.nomUbi}>{u.nomUbi}</option>)}
            </select>
          </label>

          {/* Responsable (Departamento) */}
          <label className="input-shell" htmlFor="filter-responsable" style={{ minWidth: "160px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <select
              id="filter-responsable"
              value={selectedDep}
              onChange={(e) => setSelectedDep(e.target.value)}
              aria-label="Filtrar por responsable"
            >
              <option value="Todos">Todos los responsables</option>
              {departamentos.map((d) => <option key={d.idDep} value={d.nomDep}>{d.nomDep}</option>)}
            </select>
          </label>

          {/* CTA */}
          {isAdmin && (
            <button className="btn-primary" id="btn-nuevo-equipo" onClick={openCreate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nuevo equipo
            </button>
          )}
        </div>
      </section>

      {/* Cards Grid */}
      <section className="surface" style={{ padding: "20px" }}>
        <div className="block-head" style={{ borderBottom: "none", padding: "0 0 16px 0" }}>
          <div>
            <h2 style={{ color: "#0f172a" }}>Inventario de equipos</h2>
            <p>{loading ? "Cargando inventario..." : `${filtered.length} equipo${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            Cargando equipos de la base de datos...
          </div>
        ) : (
          <>
            {isAdmin ? (
              <div className="table-shell" style={{ padding: "0 10px 12px" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>ID</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Ubicación</th>
                      <th>Stock</th>
                      <th>Serie</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map((eq) => {
                      const catObj = categorias.find(c => c.idCat === eq.idCat);
                      const ubiObj = ubicaciones.find(u => u.idUbi === eq.idUbi);
                      const estObj = estados.find(s => s.idEst === eq.idEst);
                      const stateClass = estadoPillClass[estObj?.nomEst || ""] || "info";

                      return (
                        <tr key={eq.idArt}>
                          <td>
                            <Link href={`/equipos/${eq.idArt}`} title="Ver ficha técnica" style={{ textDecoration: "none" }}>
                              <code style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}>
                                #{eq.idArt}
                              </code>
                            </Link>
                          </td>
                          <td style={{ fontWeight: 600 }}>{eq.nomArt}</td>
                          <td>{catObj?.nomCat || `Cat. #${eq.idCat}`}</td>
                          <td>{ubiObj?.nomUbi || `Ubicación #${eq.idUbi}`}</td>
                          <td>
                            <strong style={{ color: eq.canArt > 0 ? "var(--ok-text)" : "var(--danger-text)" }}>
                              {eq.canArt} ud.
                            </strong>
                          </td>
                          <td>{eq.serArt || "—"}</td>
                          <td>
                            <span className={`status-pill ${stateClass}`}>
                              {estObj?.nomEst || `Estado #${eq.idEst}`}
                            </span>
                          </td>
                          <td>
                            <div className="actions-col">
                              <button className="icon-btn edit" onClick={() => openEdit(eq)} aria-label={`Editar ${eq.nomArt}`} title="Editar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                  <path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16z" />
                                </svg>
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(eq.idArt)} aria-label={`Eliminar ${eq.nomArt}`} title="Eliminar">
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
                        <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                          No se encontraron equipos con esos filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="equipos-grid">
                {filtered.length > 0 ? filtered.map((eq) => {
                  const catObj = categorias.find(c => c.idCat === eq.idCat);
                  const ubiObj = ubicaciones.find(u => u.idUbi === eq.idUbi);
                  const estObj = estados.find(s => s.idEst === eq.idEst);

                  const stateClass = estadoPillClass[estObj?.nomEst || ""] || "info";
                  const canRequest = estObj?.nomEst === "DISPONIBLE" && eq.canArt > 0;
                  const isMaintenance = estObj?.nomEst === "EN_MANTENIMIENTO" || estObj?.nomEst === "MANTENIMIENTO" || eq.idEst === 5;
                  const { cleanDesc, imageType } = parseEquipoImage(eq.desArt, catObj?.nomCat);

                  return (
                    <article className="equipo-card" key={eq.idArt}>
                      <div className="equipo-card-image">
                        {getEquipmentSvg(imageType)}
                        <span style={{ position: "absolute", top: "12px", left: "12px" }}>
                          <Link href={`/equipos/${eq.idArt}`} title="Ver ficha técnica" style={{ textDecoration: "none" }}>
                            <code style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 800 }}>
                              #{eq.idArt}
                            </code>
                          </Link>
                        </span>
                        <span className={`status-pill ${stateClass}`} style={{ position: "absolute", top: "12px", right: "12px" }}>
                          {estObj?.nomEst || `Estado #${eq.idEst}`}
                        </span>
                      </div>
                      <div className="equipo-card-body">
                        <h3 className="equipo-card-title">{eq.nomArt}</h3>
                        {cleanDesc && <p className="equipo-card-desc">{cleanDesc}</p>}

                        <div className="equipo-card-meta">
                          <div className="equipo-card-meta-row">
                            <span style={{ color: "#64748b" }}>Categoría:</span>
                            <strong style={{ color: "#1e293b" }}>{catObj?.nomCat || `Cat. #${eq.idCat}`}</strong>
                          </div>
                          <div className="equipo-card-meta-row">
                            <span style={{ color: "#64748b" }}>Ubicación:</span>
                            <strong style={{ color: "#1e293b" }}>{ubiObj?.nomUbi || `Ubicación #${eq.idUbi}`}</strong>
                          </div>
                          <div className="equipo-card-meta-row">
                            <span style={{ color: "#64748b" }}>Stock:</span>
                            <strong style={{ color: eq.canArt > 0 ? "#16a34a" : "#dc2626" }}>{eq.canArt} unidades</strong>
                          </div>
                          <div className="equipo-card-meta-row">
                            <span style={{ color: "#64748b" }}>Serie:</span>
                            <strong style={{ color: "#1e293b" }}>{eq.serArt || "—"}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="equipo-card-footer">
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                          ${eq.valArt.toFixed(2)}
                        </span>

                        {showActions && (
                          <div>
                            {isMaintenance ? (
                              <button
                                className="btn-secondary"
                                style={{ minHeight: "34px", padding: "0 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, color: "#dc2626", borderColor: "#fca5a5" }}
                                disabled
                                title="Equipo no disponible"
                              >
                                No disponible - En mantenimiento
                              </button>
                            ) : (
                              <button
                                className="btn-primary"
                                style={{ minHeight: "34px", padding: "0 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}
                                onClick={() => handleOpenSolicitudModal(eq)}
                                disabled={!canRequest}
                                title={canRequest ? "Solicitar préstamo de este equipo" : "Equipo no disponible"}
                              >
                                Solicitar Préstamo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                }) : (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--muted)", width: "100%" }}>
                    No se encontraron equipos con esos filtros.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingEquipo ? "Editar Equipo" : "Nuevo Equipo"}</h2>
                <p>{editingEquipo ? `Editando registro #${editingEquipo.idArt}` : "Añadir un nuevo artículo de tecnología al inventario."}</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mini-list" style={{ padding: 0 }}>
              <label className="field" htmlFor="field-nom">
                <span>Nombre del equipo</span>
                <div className="input-shell">
                  <input
                    id="field-nom"
                    type="text"
                    required
                    placeholder="Ej. Laptop HP ProBook"
                    value={nomArt}
                    onChange={(e) => setNomArt(e.target.value)}
                  />
                </div>
              </label>

              <label className="field" htmlFor="field-des">
                <span>Descripción</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea
                    id="field-des"
                    placeholder="Detalles sobre especificaciones, procesador, RAM..."
                    value={desArt}
                    onChange={(e) => setDesArt(e.target.value)}
                  />
                </div>
              </label>

              <div className="form-row">
                <label className="field" htmlFor="field-ser">
                  <span>Nº de Serie</span>
                  <div className="input-shell">
                    <input
                      id="field-ser"
                      type="text"
                      placeholder="Ej. SN-7738B"
                      value={serArt}
                      onChange={(e) => setSerArt(e.target.value)}
                    />
                  </div>
                </label>

                <label className="field" htmlFor="field-mar">
                  <span>Marca</span>
                  <div className="input-shell">
                    <input
                      id="field-mar"
                      type="text"
                      placeholder="Ej. HP"
                      value={marArt}
                      onChange={(e) => setMarArt(e.target.value)}
                    />
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="field" htmlFor="field-mod">
                  <span>Modelo</span>
                  <div className="input-shell">
                    <input
                      id="field-mod"
                      type="text"
                      placeholder="Ej. ProBook 450"
                      value={modArt}
                      onChange={(e) => setModArt(e.target.value)}
                    />
                  </div>
                </label>

                <label className="field" htmlFor="field-can">
                  <span>Cantidad</span>
                  <div className="input-shell">
                    <input
                      id="field-can"
                      type="number"
                      required
                      min={1}
                      value={canArt}
                      onChange={(e) => setCanArt(Number(e.target.value))}
                    />
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="field" htmlFor="field-val">
                  <span>Valor Unitario ($)</span>
                  <div className="input-shell">
                    <input
                      id="field-val"
                      type="number"
                      step="0.01"
                      required
                      min={0}
                      value={valArt}
                      onChange={(e) => setValArt(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                </label>

                <label className="field" htmlFor="field-cat">
                  <span>Categoría</span>
                  <div className="input-shell">
                    <select
                      id="field-cat"
                      value={idCat}
                      onChange={(e) => setIdCat(Number(e.target.value))}
                    >
                      {categorias.map((c) => <option key={c.idCat} value={c.idCat}>{c.nomCat}</option>)}
                    </select>
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="field" htmlFor="field-est">
                  <span>Estado</span>
                  <div className="input-shell">
                    <select
                      id="field-est"
                      value={idEst}
                      onChange={(e) => setIdEst(Number(e.target.value))}
                    >
                      {estados.map((s) => <option key={s.idEst} value={s.idEst}>{s.nomEst}</option>)}
                    </select>
                  </div>
                </label>

                <label className="field" htmlFor="field-ubi">
                  <span>Ubicación</span>
                  <div className="input-shell">
                    <select
                      id="field-ubi"
                      value={idUbi}
                      onChange={(e) => setIdUbi(Number(e.target.value))}
                    >
                      {ubicaciones.map((u) => <option key={u.idUbi} value={u.idUbi}>{u.nomUbi}</option>)}
                    </select>
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="field" htmlFor="field-img">
                  <span>Ilustración del Equipo</span>
                  <div className="input-shell">
                    <select
                      id="field-img"
                      value={selectedImg}
                      onChange={(e) => setSelectedImg(e.target.value)}
                    >
                      <option value="laptop">Computadora Portátil (Laptop)</option>
                      <option value="desktop">PC de Escritorio</option>
                      <option value="router">Enrutador / Switch (Router)</option>
                      <option value="oscilloscope">Osciloscopio / Instrumento</option>
                      <option value="cable">Cables / Accesorios</option>
                    </select>
                  </div>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingEquipo ? "Actualizar equipo" : "Guardar equipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Link to Mis Solicitudes for user roles */}
      {isUser && (
        <section className="surface" style={{ marginTop: "24px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h3 style={{ color: "#0f172a", fontWeight: 800, marginBottom: "4px" }}>Mis Solicitudes y Préstamos</h3>
            <p style={{ color: "#475569", fontSize: "13px" }}>Consulta el estado de tus solicitudes de préstamo y gestiona tus devoluciones.</p>
          </div>
          <a
            href="/mis-solicitudes"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(140deg, #1e40af 0%, #0b1329 100%)",
              color: "#ffffff", fontWeight: 700, fontSize: "14px",
              padding: "10px 20px", borderRadius: "10px", textDecoration: "none",
              border: "1px solid #1e40af", whiteSpace: "nowrap"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            Ver mis solicitudes
          </a>
        </section>
      )}


      {/* Modal: Solicitar Préstamo */}
      {isSolicitudModalOpen && selectedEquipoForLoan && (
        <div className="modal-backdrop" onClick={() => setIsSolicitudModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <div>
                <h2>Solicitar Préstamo</h2>
                <p>Solicitar el equipo: <strong>{selectedEquipoForLoan.nomArt}</strong></p>
              </div>
              <button className="btn-ghost" onClick={() => setIsSolicitudModalOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoanSolicitud} className="mini-list" style={{ padding: 0 }}>
              <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", display: "block" }}>Stock disponible:</span>
                <strong style={{ fontSize: "16px", color: "#1e293b" }}>{selectedEquipoForLoan.canArt} unidades</strong>
              </div>

              <label className="field" htmlFor="field-loan-qty">
                <span>Cantidad a solicitar *</span>
                <div className="input-shell">
                  <input
                    id="field-loan-qty"
                    type="number"
                    required
                    min={1}
                    max={selectedEquipoForLoan.canArt}
                    value={loanCantidad}
                    onChange={(e) => setLoanCantidad(Number(e.target.value))}
                  />
                </div>
              </label>

              <label className="field" htmlFor="field-loan-date">
                <span>Fecha esperada de devolución *</span>
                <div className="input-shell">
                  <input
                    id="field-loan-date"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={loanFechaDevolucion}
                    onChange={(e) => setLoanFechaDevolucion(e.target.value)}
                  />
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsSolicitudModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Formulario de Devolución */}
      {isDevolucionModalOpen && selectedLoanForDevolucion && (
        <div className="modal-backdrop" onClick={() => setIsDevolucionModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <div>
                <h2>Formulario de Devolución</h2>
                <p>Registrar el estado de entrega física para la devolución.</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsDevolucionModalOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDevolucionSolicitud} className="mini-list" style={{ padding: 0 }}>
              <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", display: "block" }}>Equipo solicitado:</span>
                <strong style={{ fontSize: "15px", color: "#1e293b" }}>
                  {selectedLoanForDevolucion.detalles?.map((det: any) => {
                    const eq = equipos.find(e => e.idArt === det.idArt);
                    return `${eq?.nomArt || `Equipo #${det.idArt}`} (${det.canPre} ud.)`;
                  }).join(", ") || "—"}
                </strong>
              </div>

              <label className="field" htmlFor="field-dev-qty">
                <span>Cantidad a devolver *</span>
                <div className="input-shell">
                  <input
                    id="field-dev-qty"
                    type="number"
                    required
                    min={1}
                    max={selectedLoanForDevolucion.detalles?.[0]?.canPre || 1}
                    value={devCantidad}
                    onChange={(e) => setDevCantidad(Number(e.target.value))}
                  />
                </div>
              </label>

              <label className="field" htmlFor="field-dev-state">
                <span>Estado Físico del Equipo *</span>
                <div className="input-shell">
                  <select
                    id="field-dev-state"
                    value={devEstadoFisico}
                    onChange={(e) => setDevEstadoFisico(e.target.value)}
                  >
                    <option value="EXCELENTE">Excelente</option>
                    <option value="BUENO">Bueno</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MALO">Malo</option>
                  </select>
                </div>
              </label>

              <label className="field" htmlFor="field-dev-obs">
                <span>Observaciones técnicas / Comentarios</span>
                <div className="input-shell" style={{ height: "auto" }}>
                  <textarea
                    id="field-dev-obs"
                    placeholder="Describa si hay daños, rayones, o cualquier detalle sobre el funcionamiento del equipo…"
                    value={devObservaciones}
                    onChange={(e) => setDevObservaciones(e.target.value)}
                  />
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDevolucionModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}