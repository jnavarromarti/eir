import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { UserRole } from '@/types/enums';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';

// Auth pages
import LoginPage from '@/features/auth/pages/LoginPage';
import TwoFactorPage from '@/features/auth/pages/TwoFactorPage';

// App pages
import AgendaPage from '@/features/agenda/pages/AgendaPage';
import PatientListPage from '@/features/patients/pages/PatientListPage';
import PatientDetailPage from '@/features/patients/pages/PatientDetailPage';
import PatientFormPage from '@/features/patients/pages/PatientFormPage';
import InvoiceListPage from '@/features/billing/pages/InvoiceListPage';
import InvoiceDetailPage from '@/features/billing/pages/InvoiceDetailPage';
import InvoiceCreatePage from '@/features/billing/pages/InvoiceCreatePage';
import UserListPage from '@/features/users/pages/UserListPage';
import UserFormPage from '@/features/users/pages/UserFormPage';
import UserProfilePage from '@/features/users/pages/UserProfilePage';
import ServiceListPage from '@/features/services/pages/ServiceListPage';
import AnalyticsDashboardPage from '@/features/analytics/pages/AnalyticsDashboardPage';

const PATIENT_ROLES = [UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.CHIROPODIST, UserRole.RADIOLOGY_TECHNICIAN];
const BILLING_ROLES = [UserRole.ADMIN, UserRole.ADMINISTRATIVE];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/2fa" element={<TwoFactorPage />} />
        </Route>

        {/* Rutas protegidas */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/agenda" replace />} />

          {/* Agenda — acceso para todos los autenticados */}
          <Route path="/agenda" element={<AgendaPage />} />

          {/* Pacientes */}
          <Route path="/patients" element={<RoleGuard roles={PATIENT_ROLES}><PatientListPage /></RoleGuard>} />
          <Route path="/patients/new" element={<RoleGuard roles={BILLING_ROLES}><PatientFormPage /></RoleGuard>} />
          <Route path="/patients/:id" element={<RoleGuard roles={PATIENT_ROLES}><PatientDetailPage /></RoleGuard>} />
          <Route path="/patients/:id/edit" element={<RoleGuard roles={BILLING_ROLES}><PatientFormPage /></RoleGuard>} />

          {/* Facturación */}
          <Route path="/invoices" element={<RoleGuard roles={BILLING_ROLES}><InvoiceListPage /></RoleGuard>} />
          <Route path="/invoices/new" element={<RoleGuard roles={BILLING_ROLES}><InvoiceCreatePage /></RoleGuard>} />
          <Route path="/invoices/:id" element={<RoleGuard roles={BILLING_ROLES}><InvoiceDetailPage /></RoleGuard>} />

          {/* Usuarios — sólo ADMIN */}
          <Route path="/users" element={<RoleGuard roles={[UserRole.ADMIN]}><UserListPage /></RoleGuard>} />
          <Route path="/users/new" element={<RoleGuard roles={[UserRole.ADMIN]}><UserFormPage /></RoleGuard>} />
          <Route path="/users/:id" element={<RoleGuard roles={[UserRole.ADMIN]}><UserProfilePage /></RoleGuard>} />
          <Route path="/users/:id/edit" element={<RoleGuard roles={[UserRole.ADMIN]}><UserFormPage /></RoleGuard>} />

          {/* Servicios */}
          <Route path="/services" element={<RoleGuard roles={BILLING_ROLES}><ServiceListPage /></RoleGuard>} />

          {/* Analytics — sólo ADMIN */}
          <Route path="/analytics" element={<RoleGuard roles={[UserRole.ADMIN]}><AnalyticsDashboardPage /></RoleGuard>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
