"use client";

import { useEffect, useState } from "react";
import { usuariosService } from "@/features/usuarios/usuario.service";
import { departamentosService } from "@/features/equipos/departamento.service";
import { ubicacionesService } from "@/features/equipos/ubicacion.service";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Usuario, Departamento, Ubicacion } from "@/types/api";

const rolPillClass: Record<string, string> = {
  Administrador: "admin",
  Técnico:       "tecnico",
  Docente:       "docente",
  Estudiante:    "estudiante",
};

const rolPillColors: Record<string, { bg: string; border: string; color: string }> = {
  Administrador: { bg: "#ede9fe", border: "#7c3aed", color: "#5b21b6" },
  Técnico:       { bg: "#ffedd5", border: "#c2410c", color: "#9a3412" },
  Docente:       { bg: "#dbeafe", border: "#1d4ed8", color: "#1e3a8a" },
  Estudiante:    { bg: "#dcfce7", border: "#16a34a", color: "#14532d" },
};

const estadoPillColors: Record<string, { bg: string; border: string; color: string }> = {
  Activo:     { bg: "#dcfce7", border: "#16a34a", color: "#15803d" },
  Inactivo:   { bg: "#fef3c7", border: "#d97706", color: "#92400e" },
  Suspendido: { bg: "#fee2e2", border: "#dc2626", color: "#b91c1c" },
};

const estadoPillClass: Record<string, string> = {
  Activo:     "ok",
  Inactivo:   "warn",
  Suspendido: "danger",
};


const roles = [
  { id: 1, name: "Administrador" },
  { id: 2, name: "Docente" },
  { id: 3, name: "Estudiante" },
  { id: 4, name: "Técnico" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "Administrador") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 5000);
  };

  const [search, setSearch] = useState("");
  const [selectedRol, setSelectedRol] = useState("Todos");
  const [selectedEst, setSelectedEst] = useState("Todos");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  // Form Fields State
  const [nomUsr, setNomUsr] = useState("");
  const [apeUsr, setApeUsr] = useState("");
  const [corUsr, setCorUsr] = useState("");
  const [telUsr, setTelUsr] = useState("");
  const [usuLogin, setUsuLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [idRol, setIdRol] = useState<number>(2);
  const [idDep, setIdDep] = useState<number | undefined>(undefined);
  const [idUbi, setIdUbi] = useState<number | undefined>(undefined);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usrList, depList, ubiList] = await Promise.all([
        usuariosService.findAll(),
        departamentosService.findAll(),
        ubicacionesService.findAll(),
      ]);

      setUsuarios(usrList || []);
      setDepartamentos(depList || []);
      setUbicaciones(ubiList || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditingUsuario(null);
    setNomUsr("");
    setApeUsr("");
    setCorUsr("");
    setTelUsr("");
    setUsuLogin("");
    setPassword("");
    setShowPassword(false);
    setIdRol(2);
    setIdDep(departamentos[0]?.idDep);
    setIdUbi(ubicaciones[0]?.idUbi);
    setIsModalOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditingUsuario(u);
    setNomUsr(u.nomUsr);
    setApeUsr(u.apeUsr || "");
    setCorUsr(u.corUsr);
    setTelUsr(u.telUsr || "");
    setUsuLogin(u.usuLogin);
    setPassword(""); // vacía al editar por seguridad
    setShowPassword(false);
    setIdRol(u.idRol);
    // no requiere mapear idDep/idUbi si no existen de origen
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea suspender/eliminar este usuario?")) {
      try {
        await usuariosService.delete(id);
        showNotification("success", "Usuario suspendido/eliminado correctamente.");
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al eliminar usuario: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (confirm("¿Está seguro de que desea activar este usuario?")) {
      try {
        await usuariosService.update(id, { estUsr: 1 });
        showNotification("success", "Usuario activado correctamente.");
        fetchAll();
      } catch (err) {
        showNotification("error", "Error al activar usuario: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomUsr || !apeUsr || !corUsr || !usuLogin) {
      showNotification("error", "Por favor completa los campos requeridos");
      return;
    }

    if (!editingUsuario && !password) {
      showNotification("error", "La contraseña es obligatoria para un usuario nuevo");
      return;
    }

    const payload: any = {
      nomUsr,
      apeUsr,
      corUsr,
      telUsr: telUsr || undefined,
      usuLogin,
      idRol: Number(idRol),
      idDep: idDep ? Number(idDep) : undefined,
      idUbi: idUbi ? Number(idUbi) : undefined,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (editingUsuario) {
        await usuariosService.update(editingUsuario.idUsr, payload);
        showNotification("success", "Usuario actualizado correctamente.");
      } else {
        await usuariosService.create(payload);
        showNotification("success", "Usuario creado correctamente.");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      showNotification("error", "Error al guardar: " + (err instanceof Error ? err.message : err));
    }
  };

  // Filtrado
  const filtered = usuarios.filter((u) => {
    const fullName = `${u.nomUsr} ${u.apeUsr || ""}`.toLowerCase();
    const matchSearch = !search || [fullName, u.corUsr, u.usuLogin, String(u.idUsr)]
      .some((f) => f.includes(search.toLowerCase()));

    const rolObj = roles.find(r => r.id === u.idRol);
    const matchRol = selectedRol === "Todos" || rolObj?.name === selectedRol;

    const estText = u.estUsr === 1 ? "Activo" : "Inactivo";
    const matchEst = selectedEst === "Todos" || estText === selectedEst;

    return matchSearch && matchRol && matchEst;
  });

  return (
    <div>
      {/* Header */}
      <section className="page-header">
        <p className="section-kicker">Módulo</p>
        <h1>Usuarios</h1>
        <p>Gestión de perfiles, roles y permisos de acceso al sistema de laboratorios.</p>
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

      {/* Stat row */}
      <section className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total usuarios",  value: usuarios.length, note: "Registrados en el sistema" },
          { label: "Activos", value: usuarios.filter((u) => u.estUsr === 1).length, note: "Con acceso habilitado" },
          { label: "Administradores", value: usuarios.filter((u) => u.idRol === 1).length, note: "Acceso total" },
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
          <label className="input-shell toolbar-search" htmlFor="user-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
            </svg>
            <input
              id="user-search"
              type="search"
              placeholder="Buscar por nombre, correo o usuario…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="input-shell" htmlFor="filter-rol" style={{ minWidth: "150px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c1.7-3.2 4.2-4.8 8-4.8S18.3 16.8 20 20" />
            </svg>
            <select id="filter-rol" value={selectedRol} onChange={(e) => setSelectedRol(e.target.value)} aria-label="Filtrar por rol">
              <option value="Todos">Todos los roles</option>
              {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </label>

          <label className="input-shell" htmlFor="filter-estado-usr" style={{ minWidth: "150px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
            </svg>
            <select id="filter-estado-usr" value={selectedEst} onChange={(e) => setSelectedEst(e.target.value)} aria-label="Filtrar por estado">
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </label>

          <button className="btn-primary" id="btn-nuevo-usuario" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo usuario
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="surface">
        <div className="block-head">
          <div>
            <h2>Listado de usuarios</h2>
            <p>{loading ? "Cargando perfiles..." : `${filtered.length} usuario${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
        </div>
        <div className="table-shell" style={{ padding: "0 10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando usuarios de la base de datos...
            </div>
          ) : (
            <table className="table" style={{ minWidth: "750px" }}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((u) => {
                  const rolObj = roles.find(r => r.id === u.idRol);
                  const rolLabel = rolObj?.name || `Rol #${u.idRol}`;
                  const estadoLabel = u.estUsr === 1 ? "Activo" : "Inactivo";

                  return (
                    <tr key={u.idUsr}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className="avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                            {getInitials(u.nomUsr)}
                          </span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: "14px" }}>{u.nomUsr} {u.apeUsr}</p>
                            <p style={{ fontSize: "12px", color: "#9aafc8" }}>@{u.usuLogin} (id: {u.idUsr})</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#1e40af", fontSize: "13px", fontWeight: 600 }}>{u.corUsr}</td>
                      <td>
                        {(() => {
                          const colors = rolPillColors[rolLabel] || { bg: "#f1f5f9", border: "#94a3b8", color: "#475569" };
                          return (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              background: colors.bg, border: `1.5px solid ${colors.border}`,
                              color: colors.color, padding: "4px 12px", borderRadius: "20px",
                              fontSize: "12px", fontWeight: 800, letterSpacing: "0.2px"
                            }}>
                              {rolLabel}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        {(() => {
                          const colors = estadoPillColors[estadoLabel] || estadoPillColors["Inactivo"];
                          return (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              background: colors.bg, border: `1.5px solid ${colors.border}`,
                              color: colors.color, padding: "4px 12px", borderRadius: "20px",
                              fontSize: "12px", fontWeight: 800
                            }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.border, flexShrink: 0 }}></span>
                              {estadoLabel}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <div className="actions-col">
                          <button className="icon-btn edit" onClick={() => openEdit(u)} aria-label={`Editar ${u.nomUsr}`} title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16z" />
                            </svg>
                          </button>
                          {u.estUsr === 1 ? (
                            <button className="icon-btn delete" onClick={() => handleDelete(u.idUsr)} aria-label={`Suspender ${u.nomUsr}`} title="Suspender">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                              </svg>
                            </button>
                          ) : (
                            <button className="icon-btn activate" onClick={() => handleActivate(u.idUsr)} aria-label={`Activar ${u.nomUsr}`} title="Activar">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      No se encontraron usuarios con esos filtros.
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
                <h2>{editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}</h2>
                <p>{editingUsuario ? `Editando registro de @${editingUsuario.usuLogin}` : "Crear una nueva cuenta de acceso institucional."}</p>
              </div>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)} style={{ minHeight: "auto", padding: "4px" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mini-list" style={{ padding: 0 }}>
              <div className="form-row">
                <label className="field" htmlFor="field-nom">
                  <span>Nombre(s) *</span>
                  <div className="input-shell">
                    <input
                      id="field-nom"
                      type="text"
                      required
                      placeholder="Ej. Juan"
                      value={nomUsr}
                      onChange={(e) => setNomUsr(e.target.value)}
                    />
                  </div>
                </label>

                <label className="field" htmlFor="field-ape">
                  <span>Apellido(s) *</span>
                  <div className="input-shell">
                    <input
                      id="field-ape"
                      type="text"
                      required
                      placeholder="Ej. Pérez"
                      value={apeUsr}
                      onChange={(e) => setApeUsr(e.target.value)}
                    />
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="field" htmlFor="field-cor">
                  <span>Correo institucional *</span>
                  <div className="input-shell">
                    <input
                      id="field-cor"
                      type="email"
                      required
                      placeholder="Ej. juan.perez@uta.edu.ec"
                      value={corUsr}
                      onChange={(e) => setCorUsr(e.target.value)}
                    />
                  </div>
                </label>

                <label className="field" htmlFor="field-tel">
                  <span>Teléfono</span>
                  <div className="input-shell">
                    <input
                      id="field-tel"
                      type="text"
                      placeholder="Ej. 0999999999"
                      value={telUsr}
                      onChange={(e) => setTelUsr(e.target.value)}
                    />
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="field" htmlFor="field-login">
                  <span>Nombre de usuario *</span>
                  <div className="input-shell">
                    <input
                      id="field-login"
                      type="text"
                      required
                      placeholder="Ej. jperez"
                      value={usuLogin}
                      onChange={(e) => setUsuLogin(e.target.value)}
                    />
                  </div>
                </label>

                <label className="field" htmlFor="field-pass">
                  <span>Contraseña {editingUsuario ? "(opcional)" : "*"}</span>
                  <div className="input-shell" style={{ position: "relative" }}>
                    <input
                      id="field-pass"
                      type={showPassword ? "text" : "password"}
                      required={!editingUsuario}
                      placeholder={editingUsuario ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted)",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="field" htmlFor="field-rol">
                  <span>Rol del Sistema</span>
                  <div className="input-shell">
                    <select
                      id="field-rol"
                      value={idRol}
                      onChange={(e) => setIdRol(Number(e.target.value))}
                    >
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </label>

                <label className="field" htmlFor="field-dep">
                  <span>Departamento (Opcional)</span>
                  <div className="input-shell">
                    <select
                      id="field-dep"
                      value={idDep || ""}
                      onChange={(e) => setIdDep(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">Ninguno</option>
                      {departamentos.map((d) => <option key={d.idDep} value={d.idDep}>{d.nomDep}</option>)}
                    </select>
                  </div>
                </label>
              </div>

              <label className="field" htmlFor="field-ubi">
                <span>Ubicación asociada (Opcional)</span>
                <div className="input-shell">
                  <select
                    id="field-ubi"
                    value={idUbi || ""}
                    onChange={(e) => setIdUbi(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Ninguna</option>
                    {ubicaciones.map((u) => <option key={u.idUbi} value={u.idUbi}>{u.nomUbi}</option>)}
                  </select>
                </div>
              </label>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUsuario ? "Actualizar usuario" : "Guardar usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}