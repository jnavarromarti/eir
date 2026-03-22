import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import AuthShell from '@/features/auth/components/AuthShell';

const schema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'Solo dígitos'),
});

type TwoFactorFormValues = z.infer<typeof schema>;

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const tempToken = (location.state as { tempToken?: string })?.tempToken;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(schema),
  });

  if (!tempToken) {
    navigate('/login', { replace: true });
    return null;
  }

  const onSubmit = async (values: TwoFactorFormValues) => {
    setLoading(true);
    try {
      const { data } = await authApi.verify2FA({
        code: values.code,
        temp_token: tempToken,
      });
      login(data.token, data.user);
      navigate('/');
    } catch {
      toast.error('Código incorrecto o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Verificación adicional"
      title="Confirma tu identidad antes de entrar"
      description="Mantenemos una capa extra de protección para preservar datos clínicos, operativa interna y accesos de equipo."
      footer={<span>La verificación caduca automáticamente por seguridad.</span>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Acceso verificado
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-gray-950">Verificación en dos pasos</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">Introduce el código de 6 dígitos generado por tu app de autenticación.</p>
          </div>
        </div>

        <Input
          id="code"
          label="Código"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          autoComplete="one-time-code"
          placeholder="000000"
          error={errors.code?.message}
          {...register('code')}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Verificando…' : 'Validar acceso'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="block w-full text-center text-sm font-medium text-gray-500 transition-colors hover:text-primary-500"
        >
          Volver al login
        </button>
      </form>
    </AuthShell>
  );
}
