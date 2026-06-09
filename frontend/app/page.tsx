"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ResourceKey =
  | "articulos"
  | "categorias"
  | "estados"
  | "ubicaciones"
  | "departamentos";

type FieldKind = "text" | "number" | "textarea";

type Field = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
};

type ResourceConfig = {
  key: ResourceKey;
  label: string;
  endpoint: string;
  idField: string;
  fields: Field[];
  columns: string[];
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  total?: number;
};

type Row = Record<string, string | number | null | undefined>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const resources: ResourceConfig[] = [
  {
    key: "articulos",
    label: "Artículos",
    endpoint: "/articulos",
    idField: "idArt",
    columns: ["idArt", "nomArt", "serArt", "canArt", "valArt", "idCat", "idEst"],
    fields: [
      { name: "nomArt", label: "Nombre", kind: "text", required: true },
      { name: "desArt", label: "Descripción", kind: "textarea" },
      { name: "serArt", label: "Serie", kind: "text" },
      { name: "marArt", label: "Marca", kind: "text" },
      { name: "modArt", label: "Modelo", kind: "text" },
      { name: "canArt", label: "Cantidad", kind: "number", required: true },
      { name: "valArt", label: "Valor", kind: "number", required: true },
      { name: "idCat", label: "Categoría ID", kind: "number", required: true },
      { name: "idEst", label: "Estado ID", kind: "number", required: true },
      { name: "idDep", label: "Departamento ID", kind: "number" },
      { name: "idUbi", label: "Ubicación ID", kind: "number" },
    ],
  },
  {
    key: "categorias",
    label: "Categorías",
    endpoint: "/categorias",
    idField: "idCat",
    columns: ["idCat", "nomCat", "desCat"],
    fields: [
      { name: "nomCat", label: "Nombre", kind: "text", required: true },
      { name: "desCat", label: "Descripción", kind: "textarea" },
    ],
  },
  {
    key: "estados",
    label: "Estados",
    endpoint: "/estados",
    idField: "idEst",
    columns: ["idEst", "nomEst", "tipoEst", "desEst"],
    fields: [
      { name: "nomEst", label: "Nombre", kind: "text", required: true },
      { name: "tipoEst", label: "Tipo", kind: "text", required: true },
      { name: "desEst", label: "Descripción", kind: "textarea" },
    ],
  },
  {
    key: "ubicaciones",
    label: "Ubicaciones",
    endpoint: "/ubicaciones",
    idField: "idUbi",
    columns: ["idUbi", "nomUbi", "idDep", "nomDep", "desUbi"],
    fields: [
      { name: "nomUbi", label: "Nombre", kind: "text", required: true },
      { name: "idDep", label: "Departamento ID", kind: "number", required: true },
      { name: "desUbi", label: "Descripción", kind: "textarea" },
    ],
  },
  {
    key: "departamentos",
    label: "Departamentos",
    endpoint: "/departamentos",
    idField: "idDep",
    columns: ["idDep", "nomDep", "desDep"],
    fields: [
      { name: "nomDep", label: "Nombre", kind: "text", required: true },
      { name: "desDep", label: "Descripción", kind: "textarea" },
    ],
  },
];

function emptyForm(config: ResourceConfig) {
  return Object.fromEntries(config.fields.map((field) => [field.name, ""]));
}

function normalizePayload(config: ResourceConfig, form: Record<string, string>) {
  return config.fields.reduce<Row>((payload, field) => {
    const value = form[field.name]?.trim();

    if (!value && !field.required) {
      return payload;
    }

    payload[field.name] = field.kind === "number" ? Number(value) : value;
    return payload;
  }, {});
}

function formatValue(value: Row[string]) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

export default function Home() {
  const [activeKey, setActiveKey] = useState<ResourceKey>("articulos");
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Record<string, string>>(
    emptyForm(resources[0]),
  );
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Listo para consultar el inventario.");
  const [error, setError] = useState("");

  const activeResource = useMemo(
    () => resources.find((item) => item.key === activeKey) ?? resources[0],
    [activeKey],
  );

  async function request<T>(path: string, init?: RequestInit) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    const result = (await response.json().catch(() => ({}))) as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(result.message ?? "No se pudo completar la operación");
    }

    return result;
  }

  async function loadData(config = activeResource) {
    setIsLoading(true);
    setError("");

    try {
      const result = await request<Row[]>(config.endpoint);
      const data = Array.isArray(result.data) ? result.data : [];
      setRows(data);
      setMessage(`${config.label}: ${data.length} registros cargados.`);
    } catch (requestError) {
      setRows([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Error consultando el backend",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setForm(emptyForm(activeResource));
    setEditingId(null);
    void loadData(activeResource);
  }, [activeResource]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = normalizePayload(activeResource, form);
      const isEditing = editingId !== null;

      await request<Row>(
        isEditing
          ? `${activeResource.endpoint}/${editingId}`
          : activeResource.endpoint,
        {
          method: isEditing
            ? activeResource.key === "articulos"
              ? "PATCH"
              : "PUT"
            : "POST",
          body: JSON.stringify(payload),
        },
      );

      setMessage(
        isEditing
          ? `${activeResource.label}: registro actualizado.`
          : `${activeResource.label}: registro creado.`,
      );
      setForm(emptyForm(activeResource));
      setEditingId(null);
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo guardar",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(row: Row) {
    const id = row[activeResource.idField];

    if (id === undefined || id === null) {
      setError("No se puede eliminar: ID no encontrado en la fila.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await request(`${activeResource.endpoint}/${id}`, { method: "DELETE" });
      setMessage(`${activeResource.label}: registro eliminado.`);
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo eliminar",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(row: Row) {
    const id = row[activeResource.idField];

    setEditingId(id ?? null);
    setForm(
      Object.fromEntries(
        activeResource.fields.map((field) => [
          field.name,
          row[field.name] === null || row[field.name] === undefined
            ? ""
            : String(row[field.name]),
        ]),
      ),
    );
    setMessage(`${activeResource.label}: editando registro.`);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#18201d]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#cfd8d1] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5a6b61]">
              Gestión Tecnológica FISEI
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#18201d] sm:text-4xl">
              Inventario institucional
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Metric label="API" value={API_URL.replace("http://", "")} />
            <Metric label="Vista" value={activeResource.label} />
            <Metric label="Registros" value={String(rows.length)} />
            <Metric label="Estado" value={isLoading ? "Cargando" : "Activo"} />
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-[#d8ddd5] pb-3">
          {resources.map((resource) => (
            <button
              key={resource.key}
              className={`h-10 shrink-0 rounded-md border px-4 text-sm font-medium transition ${
                activeKey === resource.key
                  ? "border-[#245b43] bg-[#245b43] text-white"
                  : "border-[#cbd5ce] bg-white text-[#314239] hover:border-[#245b43]"
              }`}
              type="button"
              onClick={() => setActiveKey(resource.key)}
            >
              {resource.label}
            </button>
          ))}
        </nav>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            className="rounded-lg border border-[#d7ddd7] bg-white p-4 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingId === null ? "Nuevo registro" : "Editar registro"}
                </h2>
                <p className="text-sm text-[#65746a]">{activeResource.label}</p>
              </div>
              {editingId !== null && (
                <button
                  className="h-9 rounded-md border border-[#cbd5ce] px-3 text-sm font-medium"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm(activeResource));
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>

            <div className="grid gap-3">
              {activeResource.fields.map((field) => (
                <label className="grid gap-1.5 text-sm" key={field.name}>
                  <span className="font-medium text-[#314239]">
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  {field.kind === "textarea" ? (
                    <textarea
                      className="min-h-20 rounded-md border border-[#cbd5ce] bg-[#fbfcfa] px-3 py-2 outline-none focus:border-[#245b43]"
                      value={form[field.name] ?? ""}
                      onChange={(event) =>
                        setForm({ ...form, [field.name]: event.target.value })
                      }
                    />
                  ) : (
                    <input
                      className="h-10 rounded-md border border-[#cbd5ce] bg-[#fbfcfa] px-3 outline-none focus:border-[#245b43]"
                      min={field.kind === "number" ? 0 : undefined}
                      required={field.required}
                      type={field.kind}
                      value={form[field.name] ?? ""}
                      onChange={(event) =>
                        setForm({ ...form, [field.name]: event.target.value })
                      }
                    />
                  )}
                </label>
              ))}
            </div>

            <button
              className="mt-5 h-11 w-full rounded-md bg-[#245b43] px-4 text-sm font-semibold text-white transition hover:bg-[#1d4a37] disabled:cursor-not-allowed disabled:bg-[#9aaaa1]"
              disabled={isLoading}
              type="submit"
            >
              {editingId === null ? "Crear" : "Guardar cambios"}
            </button>
          </form>

          <section className="min-w-0 rounded-lg border border-[#d7ddd7] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#e0e5e0] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{activeResource.label}</h2>
                <p className="text-sm text-[#65746a]">{message}</p>
                {error && <p className="mt-1 text-sm text-[#b42318]">{error}</p>}
              </div>
              <button
                className="h-10 rounded-md border border-[#cbd5ce] px-4 text-sm font-medium transition hover:border-[#245b43]"
                disabled={isLoading}
                type="button"
                onClick={() => void loadData()}
              >
                Actualizar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-[#eef2ed] text-[#405046]">
                  <tr>
                    {activeResource.columns.map((column) => (
                      <th className="px-4 py-3 font-semibold" key={column}>
                        {column}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-10 text-center text-[#65746a]"
                        colSpan={activeResource.columns.length + 1}
                      >
                        {isLoading ? "Cargando registros..." : "Sin registros"}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => {
                      const rowId = row[activeResource.idField] ?? index;

                      return (
                        <tr
                          className="border-t border-[#edf0ed] hover:bg-[#fbfcfa]"
                          key={String(rowId)}
                        >
                          {activeResource.columns.map((column) => (
                            <td className="max-w-56 px-4 py-3" key={column}>
                              <span className="line-clamp-2">
                                {formatValue(row[column])}
                              </span>
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                className="h-9 rounded-md border border-[#cbd5ce] px-3 font-medium hover:border-[#245b43]"
                                type="button"
                                onClick={() => startEdit(row)}
                              >
                                Editar
                              </button>
                              <button
                                className="h-9 rounded-md border border-[#e4b7b2] px-3 font-medium text-[#9d251b] hover:border-[#b42318]"
                                type="button"
                                onClick={() => void handleDelete(row)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d4dbd4] bg-white px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#69786f]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[#18201d]">
        {value}
      </p>
    </div>
  );
}
