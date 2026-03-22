import { Outlet, Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f0f8_100%)]">
        <div className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/90 px-6 py-4 shadow-[0_20px_60px_rgba(82,24,105,0.12)] backdrop-blur-sm">
          <Spinner size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Cargando entorno seguro</p>
            <p className="text-xs text-gray-500">Preparando acceso a la plataforma IMD</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
