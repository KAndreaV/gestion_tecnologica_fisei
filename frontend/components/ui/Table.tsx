import type { ReactNode } from "react";

interface TableColumn<T> {
  key: keyof T;
  header: string;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Array<TableColumn<T>>;
  data: T[];
  emptyMessage?: string;
  renderActions?: (row: T) => ReactNode;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No hay registros disponibles.",
  renderActions,
}: TableProps<T>) {
  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.header}</th>
            ))}
            {renderActions ? <th>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={String(column.key)}>{String(row[column.key] ?? "-")}</td>
                ))}
                {renderActions ? <td>{renderActions(row)}</td> : null}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)}>{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}