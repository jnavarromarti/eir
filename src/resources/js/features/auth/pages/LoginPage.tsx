import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import type { AuthResponse, TwoFactorRequiredResponse } from '@/types/auth';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import AuthShell from '@/features/auth/components/AuthShell';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(values);

      if ('two_factor_required' in data && data.two_factor_required) {
        const tfData = data as TwoFactorRequiredResponse;
        navigate('/2fa', { state: { tempToken: tfData.temp_token } });
        return;
      }

      const authData = data as AuthResponse;
      login(authData.token, authData.user);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Acceso del equipo"
      title="Inicia sesión en el workspace clínico de IMD"
      description="Una entrada pensada para equipos sanitarios: clara, veloz y confiable. La interfaz prioriza legibilidad, foco y continuidad operativa."
      footer={<span>Acceso restringido a profesionales y personal autorizado.</span>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600">
            <LockKeyhole className="h-3.5 w-3.5" />
            Entorno seguro
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-gray-950">Bienvenido de nuevo</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">Introduce tus credenciales corporativas para acceder al sistema.</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            id="username"
            label="Usuario"
            type="text"
            autoComplete="username"
            placeholder="nombre o email corporativo"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Accediendo…' : 'Acceder al sistema'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
