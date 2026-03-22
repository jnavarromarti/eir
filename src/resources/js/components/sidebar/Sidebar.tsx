import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/enums';
import {
  CalendarDays,
  Users,
  FileText,
  Settings,
  UserCog,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
  {
    to: '/patients',
    icon: Users,
    label: 'Pacientes',
    roles: [UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.CHIROPODIST, UserRole.RADIOLOGY_TECHNICIAN],
  },
  {
    to: '/invoices',
    icon: FileText,
    label: 'Facturación',
    roles: [UserRole.ADMIN, UserRole.ADMINISTRATIVE],
  },
  {
    to: '/services',
    icon: Settings,
    label: 'Servicios',
    roles: [UserRole.ADMIN, UserRole.ADMINISTRATIVE],
  },
  {
    to: '/users',
    icon: UserCog,
    label: 'Usuarios',
    roles: [UserRole.ADMIN],
  },
  {
    to: '/analytics',
    icon: BarChart3,
    label: 'Analytics',
    roles: [UserRole.ADMIN],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { hasRole } = usePermissions();

  return (
    <aside
      className={cn(
        'relative flex flex-col overflow-hidden border-r border-white/8 bg-gradient-to-b from-secondary-500 via-secondary-500 to-secondary-600 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.14),transparent_24%)]" />

      {/* Logo */}
      <div className="relative flex h-20 items-center justify-center border-b border-white/10 px-3">
        {collapsed ? (
          <img
            src="/resources/images/LOGO-IMD-CENTRO-MEDICO_VERTICAL_COLOR.png"
            alt="IMD Centro Médico"
            className="h-10 w-auto object-contain"
          />
        ) : (
          <img
            src="/resources/images/LOGO-IMD-CENTRO-MEDICO_HORIZONTAL_COLOR.png"
            alt="IMD Centro Médico"
            className="h-11 w-auto object-contain"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 space-y-1.5 p-3">
        {NAV_ITEMS.map((item) => {
          if (item.roles && !hasRole(...item.roles)) return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/64 transition-all duration-200 hover:bg-white/10 hover:text-white',
                  isActive && 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-md shadow-primary-600/30 hover:from-primary-500 hover:to-primary-600',
                  collapsed && 'justify-center px-0',
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/6 transition-colors duration-200 group-hover:bg-white/12',
                collapsed && 'h-11 w-11',
              )}>
                <item.icon className="h-5 w-5 shrink-0" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="block truncate font-semibold">{item.label}</span>
                  <span className="block truncate text-[11px] text-white/45">Módulo operativo</span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="relative flex items-center justify-center border-t border-white/10 p-4 text-white/40 transition-colors hover:text-white"
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
    </aside>
  );
}
