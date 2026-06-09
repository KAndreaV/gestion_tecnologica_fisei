import { Table } from "@/components/ui/Table";

interface ActivityRow {
  fecha: string;
  modulo: string;
  detalle: string;
  estado: string;
}

const dashboardStats = [
  { label: "Laboratorios activos", value: "12", note: "Disponibles para clases y soporte" },
  { label: "Equipos registrados", value: "248", note: "Inventario auditado" },
  { label: "Usuarios con acceso", value: "86", note: "Roles operativos y administrativos" },
  { label: "Reportes emitidos", value: "34", note: "Últimos 30 días" },
];

const activityRows: ActivityRow[] = [
  {
    fecha: "2026-06-01",
    modulo: "Laboratorios",
    detalle: "Se actualizó la disponibilidad del laboratorio 3",
    estado: "Completado",
  },
  {
    fecha: "2026-05-31",
    modulo: "Equipos",
    detalle: "Se registró mantenimiento preventivo de 4 equipos",
    estado: "Completado",
  },
  {
    fecha: "2026-05-30",
    modulo: "Usuarios",
    detalle: "Se creó un nuevo usuario con rol de docente",
    estado: "Pendiente de revisión",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <section className="page-header">
        <p className="section-kicker">Resumen general</p>
        <h1>Dashboard</h1>
        <p>Vista general del estado operativo del sistema.</p>
      </section>

      <section className="stat-grid">
        {dashboardStats.map((metric) => (
          <article className="stat-card" key={metric.label}>
            <span>{metric.label}</span>
            <h3>{metric.value}</h3>
            <p>{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="panel panel-grid">
        <div>
          <div className="panel-header">
            <div>
              <h2>Actividad reciente</h2>
              <p>Eventos recientes de operación.</p>
            </div>
          </div>

          <Table
            columns={[
              { key: "fecha", header: "Fecha" },
              { key: "modulo", header: "Módulo" },
              { key: "detalle", header: "Detalle" },
              { key: "estado", header: "Estado" },
            ]}
            data={activityRows}
          />
        </div>

        <div className="empty-card">
          <div>
            <h2>Panel de estado</h2>
            <p>Espacio para gráficos, KPIs y accesos rápidos.</p>
          </div>
        </div>
      </section>
    </div>
  );
}