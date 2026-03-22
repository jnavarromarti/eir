import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { patientsApi } from '@/api/patients';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { Plus, FileText, UserCheck, UserX, Users, Eye, Pencil } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Patient } from '@/types/patient';
import { PageShell } from '@/components/shared/PageShell';

export default function PatientListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>('last_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [confirmPatient, setConfirmPatient] = useState<Patient | null>(null);
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, page, sortField, sortDir],
    queryFn: () =>
      patientsApi
        .list({
          search: search || undefined,
          page,
          sort: sortField || undefined,
          direction: sortDir,
        })
        .then((r) => r.data),
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => patientsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente desactivado');
    },
    onError: () => toast.error('Error al desactivar'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => patientsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente activado');
    },
    onError: () => toast.error('Error al activar'),
  });

  const columns: Column<Patient>[] = [
    {
      key: 'last_name',
      header: 'Nombre',
      sortable: true,
      render: (p) => (
        <span className="font-medium text-gray-900">
          {p.first_name} {p.last_name}
        </span>
      ),
    },
    { key: 'dni', header: 'DNI', sortable: true, render: (p) => p.dni },
    {
      key: 'birth_date',
      header: 'F. nacimiento',
      sortable: true,
      render: (p) => (p.birth_date ? format(new Date(p.birth_date), 'dd/MM/yyyy') : '—'),
    },
    { key: 'phone', header: 'Teléfono', render: (p) => p.phone || '—' },
    { key: 'email', header: 'Email', sortable: true, render: (p) => p.email || '—' },
    { key: 'city', header: 'Ciudad', sortable: true, render: (p) => p.city || '—' },
    {
      key: 'next_appointment',
      header: 'Próxima cita',
      render: (p) =>
        p.next_appointment ? (
          <Badge variant="primary">
            {format(new Date(p.next_appointment.starts_at), "d MMM yyyy · HH:mm", { locale: es })}
          </Badge>
        ) : (
          <span className="text-gray-400">Sin cita</span>
        ),
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (p) =>
        p.is_active ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="danger">Inactivo</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (p) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            title="Ver ficha del paciente"
            onClick={() => navigate(`/patients/${p.id}`)}
            className="text-gray-500 hover:text-primary-500"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {can('patients:write') && (
            <Button
              variant="ghost"
              size="sm"
              title="Editar paciente"
              onClick={() => navigate(`/patients/${p.id}/edit`)}
              className="text-gray-500 hover:text-primary-500"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            title="Historial de facturas"
            onClick={() => navigate(`/invoices?patient_id=${p.id}`)}
            className="text-gray-500 hover:text-secondary-500"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {p.is_active ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-600 hover:bg-red-50"
              title="Desactivar paciente"
              onClick={() => setConfirmPatient(p)}
              disabled={deactivateMutation.isPending}
            >
              <UserX className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
              title="Activar paciente"
              onClick={() => activateMutation.mutate(p.id)}
              disabled={activateMutation.isPending}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageShell
      icon={Users}
      eyebrow="Directorio de pacientes"
      title="Pacientes"
      description="Registro centralizado de pacientes con historial, citas y datos de contacto."
      metrics={data ? [
        { label: 'Total registrados', value: data.total },
      ] : undefined}
      actions={
        can('patients:write') ? (
          <Link to="/patients/new">
            <Button>
              <Plus className="h-4 w-4" /> Nuevo paciente
            </Button>
          </Link>
        ) : undefined
      }
    >
      <SearchInput
        value={search}
        onChange={handleSearch}
        placeholder="Buscar por nombre, DNI o email…"
        className="max-w-md"
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        pagination={data ? { current_page: data.current_page, last_page: data.last_page, per_page: data.per_page, total: data.total } : undefined}
        onPageChange={setPage}
        sortField={sortField}
        sortDirection={sortDir}
        onSort={handleSort}
        onRowClick={(p) => navigate(`/patients/${p.id}`)}
        emptyMessage={search ? 'No se encontraron pacientes.' : 'Aun no hay pacientes registrados.'}
      />

      <ConfirmDialog
        open={!!confirmPatient}
        onClose={() => setConfirmPatient(null)}
        onConfirm={() => confirmPatient && deactivateMutation.mutate(confirmPatient.id, { onSuccess: () => setConfirmPatient(null) })}
        title="Desactivar paciente"
        message={`¿Estás seguro de desactivar a ${confirmPatient ? `${confirmPatient.first_name} ${confirmPatient.last_name}` : ''}? No aparecerá en las búsquedas activas.`}
        confirmLabel="Desactivar"
        destructive
        loading={deactivateMutation.isPending}
      />
    </PageShell>
  );
}
