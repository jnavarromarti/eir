import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { type UserRole } from '@/types/enums';
import type { ReactNode } from 'react';

interface Props {
  roles: UserRole[];
  children: ReactNode;
}

export default function RoleGuard({ roles, children }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const hasAccess = user.role === 'ADMIN' || roles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Acceso denegado</h2>
          <p className="mt-2 text-gray-500">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
