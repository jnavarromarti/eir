import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { usersApi } from '@/api/users';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Users, Shield, Pencil, UserX } from 'lucide-react';
import { USER_ROLE_LABELS } from '@/types/enums';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import type { User } from '@/types/user';
import { PageShell } from '@/components/shared/PageShell';

export default function UserListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario desactivado');
      setDeactivateUser(null);
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (USER_ROLE_LABELS[u.role] ?? '').toLowerCase().includes(q),
    );
  }, [users, search]);

  const activeCount = users?.filter((u) => u.is_active).length ?? 0;

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 text-xs font-bold text-primary-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user) => <Badge variant="violet">{USER_ROLE_LABELS[user.role]}</Badge>,
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (user) => (
        <Badge variant={user.is_active ? 'success' : 'danger'}>
          {user.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'two_factor_enabled',
      header: '2FA',
      render: (user) => (
        <span className={`text-xs font-medium ${user.two_factor_enabled ? 'text-emerald-500' : 'text-gray-300'}`}>
          {user.two_factor_enabled ? 'Activado' : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (user) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            title="Editar usuario"
            onClick={() => navigate(`/users/${user.id}/edit`)}
            className="text-gray-400 hover:text-primary-500"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {user.is_active && (
            <Button
              variant="ghost"
              size="sm"
              title="Desactivar usuario"
              onClick={() => setDeactivateUser(user)}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              <UserX className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageShell
      icon={Shield}
      eyebrow="Control de accesos"
      title="Usuarios"
      description="Gestión de cuentas, roles y permisos del equipo."
      metrics={users ? [
        { label: 'Total usuarios', value: users.length },
        { label: 'Activos', value: activeCount },
      ] : undefined}
      actions={
        <Link to="/users/new">
          <Button>
            <Plus className="h-4 w-4" /> Nuevo usuario
          </Button>
        </Link>
      }
    >
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre, email o rol…"
        className="max-w-md"
      />

      {!isLoading && filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No hay usuarios"
          description={search ? 'No se encontraron usuarios con esa búsqueda.' : 'Crea el primer usuario del sistema.'}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(u) => u.id}
          isLoading={isLoading}
          onRowClick={(u) => navigate(`/users/${u.id}`)}
          emptyMessage="No hay usuarios."
        />
      )}

      <ConfirmDialog
        open={!!deactivateUser}
        onClose={() => setDeactivateUser(null)}
        onConfirm={() => deactivateUser && deactivateMutation.mutate(deactivateUser.id)}
        title="Desactivar usuario"
        message={`¿Estás seguro de desactivar a ${deactivateUser?.name}? No podrá acceder al sistema.`}
        confirmLabel="Desactivar"
        destructive
        loading={deactivateMutation.isPending}
      />
    </PageShell>
  );
}
