import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { appointmentsApi } from '@/api/appointments';
import { patientsApi } from '@/api/patients';
import { servicesApi } from '@/api/services';
import { usersApi } from '@/api/users';
import { specialtiesApi } from '@/api/specialties';
import { AppointmentStatus, AppointmentStatusLabel } from '@/types/enums';
import { AppointmentStatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { format, addMinutes } from 'date-fns';
import type { Appointment } from '@/types/appointment';
import { SLOT_DURATION_MINUTES } from '../config';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  prefilledSlot: { date: string; time: string } | null;
  prefilledPatientId?: string;
  prefilledSpecialtyId?: string;
}

const schema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  practitioner_id: z.string().min(1, 'Selecciona un profesional'),
  specialty_id: z.string().min(1, 'Selecciona una especialidad'),
  service_id: z.string().optional(),
  starts_at: z.string().min(1, 'Fecha y hora de inicio obligatoria'),
  ends_at: z.string().min(1, 'Fecha y hora de fin obligatoria'),
  notes: z.string().optional(),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AppointmentModal({ open, onClose, appointment, prefilledSlot, prefilledPatientId, prefilledSpecialtyId }: AppointmentModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!appointment;

  const { data: patients } = useQuery({
    queryKey: ['patients', 'select'],
    queryFn: () => patientsApi.list().then((r) => r.data.data),
    enabled: open,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
    enabled: open,
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list().then((r) => r.data),
    enabled: open,
  });

  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesApi.list().then((r) => r.data),
    enabled: open,
  });

  const practitioners = users?.filter((u) => u.is_active && u.role !== 'ADMIN' && u.role !== 'ADMINISTRATIVE') ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Prefill al abrir
  useEffect(() => {
    if (!open) return;
    if (appointment) {
      reset({
        patient_id: appointment.patient_id,
        practitioner_id: appointment.practitioner_id,
        specialty_id: appointment.specialty_id,
        service_id: appointment.service_id || '',
        starts_at: format(new Date(appointment.starts_at), "yyyy-MM-dd'T'HH:mm"),
        ends_at: format(new Date(appointment.ends_at), "yyyy-MM-dd'T'HH:mm"),
        notes: appointment.notes || '',
        status: appointment.status,
      });
    } else if (prefilledSlot) {
      const startStr = `${prefilledSlot.date}T${prefilledSlot.time}`;
      const start = new Date(startStr);
      const end = addMinutes(start, SLOT_DURATION_MINUTES);
      reset({
        patient_id: prefilledPatientId || '',
        practitioner_id: '',
        specialty_id: prefilledSpecialtyId || '',
        service_id: '',
        starts_at: format(start, "yyyy-MM-dd'T'HH:mm"),
        ends_at: format(end, "yyyy-MM-dd'T'HH:mm"),
        notes: '',
      });
    } else {
      reset({
        patient_id: '',
        practitioner_id: '',
        specialty_id: '',
        service_id: '',
        starts_at: '',
        ends_at: '',
        notes: '',
      });
    }
  }, [open, appointment, prefilledSlot, reset]);

  // Al seleccionar servicio, auto-ajustar duración y especialidad
  const startsAt = watch('starts_at');
  const serviceId = watch('service_id');
  useEffect(() => {
    if (serviceId && startsAt && services) {
      const svc = services.find((s) => s.id === serviceId);
      if (svc) {
        const start = new Date(startsAt);
        const end = addMinutes(start, svc.duration_minutes);
        setValue('ends_at', format(end, "yyyy-MM-dd'T'HH:mm"));
        if (svc.specialty_id) setValue('specialty_id', svc.specialty_id);
      }
    }
  }, [serviceId, startsAt, services, setValue]);

  // Al seleccionar profesional, auto-rellenar su especialidad
  const practitionerId = watch('practitioner_id');
  useEffect(() => {
    if (practitionerId && practitioners.length) {
      const prac = practitioners.find((u) => u.id === practitionerId);
      if (prac?.specialty_id) {
        setValue('specialty_id', prac.specialty_id);
      }
    }
  }, [practitionerId, practitioners, setValue]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        patient_id: values.patient_id,
        practitioner_id: values.practitioner_id,
        specialty_id: values.specialty_id,
        service_id: values.service_id || undefined,
        starts_at: new Date(values.starts_at).toISOString(),
        ends_at: new Date(values.ends_at).toISOString(),
        notes: values.notes || undefined,
      };

      if (isEdit) {
        return appointmentsApi.update(appointment!.id, {
          ...payload,
          status: (values.status as AppointmentStatus) || undefined,
        });
      }
      return appointmentsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(isEdit ? 'Cita actualizada' : 'Cita creada');
      onClose();
    },
    onError: () => {
      toast.error('Error al guardar la cita');
    },
  });

  const statusOptions = Object.values(AppointmentStatus).map((s) => ({
    value: s,
    label: AppointmentStatusLabel[s],
  }));

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar cita' : 'Nueva cita'} className="max-w-xl">
      {isEdit && appointment && (
        <div className="mb-4">
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      )}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Select
          id="patient_id"
          label="Paciente"
          placeholder="Seleccionar paciente"
          options={patients?.map((p) => ({ value: p.id, label: `${p.first_name} ${p.last_name}` })) ?? []}
          error={errors.patient_id?.message}
          {...register('patient_id')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="practitioner_id"
            label="Profesional"
            placeholder="Seleccionar"
            options={practitioners.map((u) => ({ value: u.id, label: u.name }))}
            error={errors.practitioner_id?.message}
            {...register('practitioner_id')}
          />

          <Select
            id="service_id"
            label="Servicio (opcional)"
            placeholder="Sin servicio"
            options={services?.map((s) => ({ value: s.id, label: `${s.name} (${s.duration_minutes} min)` })) ?? []}
            {...register('service_id')}
          />
        </div>

        <Select
          id="specialty_id"
          label="Especialidad"
          placeholder="Seleccionar"
          options={specialties?.map((sp) => ({ value: sp.id, label: sp.name })) ?? []}
          error={errors.specialty_id?.message}
          {...register('specialty_id')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="starts_at"
            label="Inicio"
            type="datetime-local"
            error={errors.starts_at?.message}
            {...register('starts_at')}
          />
          <Input
            id="ends_at"
            label="Fin"
            type="datetime-local"
            error={errors.ends_at?.message}
            {...register('ends_at')}
          />
        </div>

        {isEdit && (
          <Select
            id="status"
            label="Estado"
            options={statusOptions}
            {...register('status')}
          />
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notas
          </label>
          <textarea
            id="notes"
            rows={2}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear cita'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
