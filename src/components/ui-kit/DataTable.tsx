import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  empty?: ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  empty,
}: DataTableProps<T>) {
  if (data.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`text-left font-medium px-4 py-3 text-xs uppercase tracking-wide ${c.className ?? ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-muted/40 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-foreground ${c.className ?? ""}`}>
                    {c.render ? c.render(row) : (row[c.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
