import { useAuth } from '@/contexts/AuthContext';
import { UserRoleLabel } from '@/types/enums';
import { LogOut, Menu } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-border bg-white/88 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          aria-label="Menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 lg:hidden">
          <img
            src="/resources/images/LOGO-IMD-CENTRO-MEDICO_HORIZONTAL_COLOR.png"
            alt="IMD Centro Médico"
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-500/68">IMD Workspace</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Plataforma interna para coordinación clínica</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Sesión activa</p>
            <p className="mt-1 text-sm text-gray-500">Entorno operativo seguro</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 text-sm font-bold text-white shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-[11px] font-medium text-gray-400">{UserRoleLabel[user.role]}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      )}
    </header>
  );
}
