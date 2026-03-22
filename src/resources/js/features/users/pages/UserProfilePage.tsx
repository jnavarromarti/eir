import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ArrowLeft, Pencil, Shield, Mail, Calendar,
  ShieldCheck, ShieldOff, UserCircle,
} from 'lucide-react';
import { USER_ROLE_LABELS, UserRole } from '@/types/enums';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Acceso completo al sistema. Gestión de usuarios, facturación, agenda y configuración.',
  [UserRole.ADMINISTRATIVE]: 'Gestión de pacientes, facturación y agenda. Sin acceso a configuración del sistema.',
  [UserRole.CHIROPODIST]: 'Acceso a agenda propia, pacientes asignados y registros clínicos de podología.',
  [UserRole.PHYSIOTHERAPIST]: 'Acceso a agenda propia, pacientes asignados y registros clínicos de fisioterapia.',
  [UserRole.SPEECH_THERAPIST]: 'Acceso a agenda propia, pacientes asignados y registros clínicos de logopedia.',
  [UserRole.DENTIST]: 'Acceso a agenda propia, pacientes asignados y registros clínicos de odontología.',
  [UserRole.RADIOLOGY_TECHNICIAN]: 'Acceso a agenda de radiología, pacientes y registro de pruebas diagnósticas.',
};

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl skeleton" />
          <div className="h-4 w-48 rounded-full skeleton" />
        </div>
        <div className="h-48 w-full rounded-2xl skeleton" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="h-40 rounded-2xl skeleton" />
          </div>
          <div className="h-60 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Link
          to="/users"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-gray-400 shadow-sm transition-all duration-200 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
          Perfil de usuario
        </span>
      </div>

      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary-600 via-secondary-500 to-primary-500 p-8 shadow-2xl shadow-secondary-500/25">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-48 w-48 rounded-full bg-primary-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black text-white shadow-inner backdrop-blur-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {user.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-white/60">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/70 ring-1 ring-white/15"
                >
                  <Shield className="h-3 w-3" />
                  {USER_ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={user.is_active ? 'success' : 'danger'}>
              {user.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
            <Link to={`/users/${user.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Body: two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Account info */}
          <Card>
            <div className="border-b border-border-subtle px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Información de la cuenta
              </p>
            </div>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <ProfileField icon={UserCircle} label="Nombre completo" value={user.name} />
                <ProfileField icon={Mail} label="Correo electrónico" value={user.email} />
              </div>
              <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <ProfileField
                  icon={Calendar}
                  label="Fecha de registro"
                  value={format(new Date(user.created_at), "d 'de' MMMM yyyy", { locale: es })}
                />
                <ProfileField
                  icon={Calendar}
                  label="Última actualización"
                  value={format(new Date(user.updated_at), "d 'de' MMMM yyyy", { locale: es })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Role & permissions */}
          <Card>
            <div className="border-b border-border-subtle px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Rol y permisos
              </p>
            </div>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-100 text-secondary-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{USER_ROLE_LABELS[user.role]}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {ROLE_DESCRIPTIONS[user.role]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Security card */}
          <Card>
            <div className="border-b border-border-subtle px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Seguridad
              </p>
            </div>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    user.two_factor_enabled ? 'bg-emerald-100' : 'bg-gray-100',
                  )}
                >
                  {user.two_factor_enabled ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ShieldOff className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Autenticación en dos pasos
                  </p>
                  <p className={cn('text-xs', user.two_factor_enabled ? 'text-emerald-600' : 'text-gray-400')}>
                    {user.two_factor_enabled ? 'Activada' : 'Desactivada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    user.is_active ? 'bg-emerald-100' : 'bg-red-100',
                  )}
                >
                  <UserCircle className={cn('h-5 w-5', user.is_active ? 'text-emerald-600' : 'text-red-500')} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Estado de la cuenta</p>
                  <p className={cn('text-xs', user.is_active ? 'text-emerald-600' : 'text-red-500')}>
                    {user.is_active ? 'Cuenta activa' : 'Cuenta desactivada'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <div className="border-b border-border-subtle px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Acciones
              </p>
            </div>
            <div className="space-y-2.5 p-4">
              <Link to={`/users/${user.id}/edit`} className="block">
                <Button variant="secondary" className="w-full">
                  <Pencil className="h-4 w-4" /> Editar usuario
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="px-6 py-4">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-gray-300" />
        <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{label}</dt>
      </div>
      <dd className="text-sm font-medium leading-snug text-gray-900">{value}</dd>
    </div>
  );
}
