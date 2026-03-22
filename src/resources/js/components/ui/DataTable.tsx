import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── Types ─── */
export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  sortField?: string | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

/* ─── Component ─── */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pagination,
  onPageChange,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  isLoading,
  emptyMessage = 'No hay datos.',
}: DataTableProps<T>) {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-primary-500" />
      : <ChevronDown className="h-3.5 w-3.5 text-primary-500" />;
  };

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-600',
                    col.className,
                  )}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && <SortIcon field={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, r) => (
                <tr key={r}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="skeleton h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'transition-colors duration-150 hover:bg-primary-50/30',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-gray-600', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-gray-500">
          <span className="text-xs text-gray-400">
            Mostrando {(pagination.current_page - 1) * pagination.per_page + 1}–
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de{' '}
            {pagination.total}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers(pagination.current_page, pagination.last_page).map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-300">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p as number)}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150',
                    p === pagination.current_page
                      ? 'bg-gradient-to-r from-primary-400 to-primary-500 font-semibold text-white shadow-sm'
                      : 'hover:bg-gray-100',
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Build an array like [1, '...', 4, 5, 6, '...', 10] */
function pageNumbers(current: number, last: number): (number | string)[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < last - 2) pages.push('...');
  pages.push(last);
  return pages;
}
