import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { invoicesApi } from '@/api/invoices';
import { Button } from '@/components/ui/Button';
import { InvoiceStatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, FileText, Receipt, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageShell } from '@/components/shared/PageShell';
import type { Invoice } from '@/types/invoice';

export default function InvoiceListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, statusFilter, search],
    queryFn: () =>
      invoicesApi
        .list({ page, status: statusFilter || undefined, search: search || undefined })
        .then((r) => r.data),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice_number',
      header: 'Nº Factura',
      render: (inv) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {inv.invoice_number}
        </span>
      ),
    },
    {
      key: 'patient',
      header: 'Paciente',
      render: (inv) => (
        <span className="text-gray-600">
          {inv.patient ? `${inv.patient.first_name} ${inv.patient.last_name}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (inv) => <InvoiceStatusBadge status={inv.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (inv) => (
        <span className="font-semibold tabular-nums text-gray-900">
          {Number(inv.total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (inv) => (
        <span className="text-gray-500">
          {format(new Date(inv.created_at), 'dd/MM/yyyy', { locale: es })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (inv) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            title="Ver factura"
            onClick={() => navigate(`/invoices/${inv.id}`)}
            className="text-gray-400 hover:text-primary-500"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      icon={Receipt}
      eyebrow="Control de facturación"
      title="Facturación"
      description="Gestión de facturas, estados de pago y control operativo financiero."
      metrics={data ? [
        { label: 'Total facturas', value: data.total },
      ] : undefined}
      actions={
        <Link to="/invoices/new">
          <Button>
            <Plus className="h-4 w-4" /> Nueva factura
          </Button>
        </Link>
      }
    >
      {/* ── Filters row ── */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por nº factura o paciente…"
          className="max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: '', label: 'Todas' },
            { value: 'DRAFT', label: 'Borrador' },
            { value: 'ISSUED', label: 'Emitida' },
            { value: 'PAID', label: 'Pagada' },
            { value: 'CANCELLED', label: 'Anulada' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                statusFilter === opt.value
                  ? 'bg-primary-400 text-white shadow-sm'
                  : 'border border-border bg-surface text-gray-500 hover:border-primary-200 hover:text-primary-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!isLoading && !data?.data.length ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No hay facturas"
          description={search || statusFilter ? 'No se encontraron facturas con estos filtros.' : 'Crea tu primera factura.'}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(inv) => inv.id}
          isLoading={isLoading}
          pagination={data ? { current_page: data.current_page, last_page: data.last_page, per_page: data.per_page, total: data.total } : undefined}
          onPageChange={setPage}
          onRowClick={(inv) => navigate(`/invoices/${inv.id}`)}
          emptyMessage="No hay facturas."
        />
      )}
    </PageShell>
  );
}
