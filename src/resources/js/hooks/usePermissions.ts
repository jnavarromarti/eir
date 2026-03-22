import { UserRole } from '@/types/enums';
import { useAuth } from '@/contexts/AuthContext';

type PermissionMap = Record<string, UserRole[]>;

const PERMISSIONS: PermissionMap = {
  'users:manage': [UserRole.ADMIN],
  'patients:read': [UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.CHIROPODIST, UserRole.RADIOLOGY_TECHNICIAN],
  'patients:write': [UserRole.ADMIN, UserRole.ADMINISTRATIVE],
  'appointments:read': [UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.CHIROPODIST, UserRole.RADIOLOGY_TECHNICIAN],
  'appointments:write': [UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.CHIROPODIST, UserRole.RADIOLOGY_TECHNICIAN],
  'services:manage': [UserRole.ADMIN, UserRole.ADMINISTRATIVE],
  'invoices:manage': [UserRole.ADMIN, UserRole.ADMINISTRATIVE],
};

export function usePermissions() {
  const { user } = useAuth();

  function can(permission: string): boolean {
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    const allowed = PERMISSIONS[permission];
    if (!allowed) return false;
    return allowed.includes(user.role);
  }

  function hasRole(...roles: UserRole[]): boolean {
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    return roles.includes(user.role);
  }

  return { can, hasRole };
}
