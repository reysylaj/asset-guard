import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  onRowClick,
  className,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border bg-card", className)}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <ChevronsUpDown className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr 
                key={item.id || index}
                onClick={() => onRowClick?.(item)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
