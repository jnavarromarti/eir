import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/api/patients';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { toast } from 'sonner';
import { ArrowLeft, UserCircle } from 'lucide-react';
import { Link } from 'react-router';

const patientSchema = z.object({
  first_name: z.string().min(1, 'Nombre obligatorio'),
  last_name: z.string().min(1, 'Apellidos obligatorios'),
  dni: z.string().min(1, 'DNI obligatorio'),
  birth_date: z.string().min(1, 'Fecha de nacimiento obligatoria'),
  phone: z.string().optional(),
  email: z.string().email('Email no válido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  medical_notes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: patient } = useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsApi.get(id!).then((r) => r.data),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        dni: patient.dni,
        birth_date: patient.birth_date,
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        city: patient.city || '',
        postal_code: patient.postal_code || '',
        medical_notes: patient.medical_notes || '',
      });
    }
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: (values: PatientFormValues) =>
      isEdit ? patientsApi.update(id!, values) : patientsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(isEdit ? 'Paciente actualizado' : 'Paciente creado');
      navigate('/patients');
    },
    onError: () => {
      toast.error('Error al guardar el paciente');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <Link to="/patients" className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-gray-400 shadow-sm transition-colors hover:bg-primary-50 hover:text-primary-500">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
            <UserCircle className="h-3.5 w-3.5" />
            {isEdit ? 'Editar paciente' : 'Alta de paciente'}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950">
            {isEdit ? 'Editar paciente' : 'Nuevo paciente'}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
              <UserCircle className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900">Datos del paciente</h3>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="first_name" label="Nombre" error={errors.first_name?.message} {...register('first_name')} />
              <Input id="last_name" label="Apellidos" error={errors.last_name?.message} {...register('last_name')} />
              <Input id="dni" label="DNI" error={errors.dni?.message} {...register('dni')} />
              <Input id="birth_date" label="Fecha de nacimiento" type="date" error={errors.birth_date?.message} {...register('birth_date')} />
              <Input id="phone" label="Teléfono" error={errors.phone?.message} {...register('phone')} />
              <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input id="address" label="Dirección" error={errors.address?.message} {...register('address')} />
              <Input id="city" label="Ciudad" error={errors.city?.message} {...register('city')} />
              <Input id="postal_code" label="Código postal" error={errors.postal_code?.message} {...register('postal_code')} />
            </div>

            <div>
              <label htmlFor="medical_notes" className="block text-sm font-medium text-gray-700">
                Notas médicas
              </label>
              <textarea
                id="medical_notes"
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200/50"
                {...register('medical_notes')}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => navigate('/patients')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear paciente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
