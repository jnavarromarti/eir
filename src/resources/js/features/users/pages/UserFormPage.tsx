import { useNavigate, useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole, USER_ROLE_LABELS, ACTIVE_PHASE_ONE_ROLES } from '@/types/enums';

const userSchema = z.object({
  name: z.string().min(2, 'Nombre obligatorio'),
  email: z.string().email('Email no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
  role: z.nativeEnum(UserRole),
  specialty_id: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.get(id!).then((r) => r.data),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(
      isEdit
        ? userSchema.extend({ password: z.string().optional().or(z.literal('')) })
        : userSchema.extend({ password: z.string().min(8, 'Mínimo 8 caracteres') }),
    ),
    values: isEdit && user
      ? {
          name: user.name,
          email: user.email,
          password: '',
          role: user.role,
          specialty_id: user.specialty_id ?? '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: UserFormValues) => {
      const payload = {
        ...values,
        password: values.password || undefined,
        specialty_id: values.specialty_id || undefined,
      };
      return isEdit ? usersApi.update(id!, payload) : usersApi.create(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado');
      navigate('/users');
    },
    onError: () => {
      toast.error('Error al guardar el usuario');
    },
  });

  if (isEdit && isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-48 rounded-lg skeleton" />
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="h-5 w-40 rounded skeleton" />
          <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full rounded-lg skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const roleOptions = ACTIVE_PHASE_ONE_ROLES.map((r) => ({
    value: r,
    label: USER_ROLE_LABELS[r],
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/users" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-gray-400 shadow-sm transition-colors hover:bg-primary-50 hover:text-primary-500">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-gray-950">
          {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        </h1>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Datos del usuario</h3>
          </CardHeader>
          <CardContent>
            <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="name"
                label="Nombre completo"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                id="password"
                label={isEdit ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Select
                id="role"
                label="Rol"
                options={roleOptions}
                error={errors.role?.message}
                {...register('role')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate('/users')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
}
