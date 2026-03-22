import { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { appointmentsApi } from '@/api/appointments';
import { usersApi } from '@/api/users';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, addMinutes, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarRange, Clock3, Activity } from 'lucide-react';
import CalendarToolbar from '@/features/agenda/components/CalendarToolbar';
import DayView from '@/features/agenda/components/DayView';
import WeekView from '@/features/agenda/components/WeekView';
import MonthView from '@/features/agenda/components/MonthView';
import AppointmentModal from '@/features/agenda/components/AppointmentModal';
import CreationPanel from '@/features/agenda/components/CreationPanel';
import { AppointmentCardOverlay } from '@/features/agenda/components/AppointmentCard';
import { getPractitionerColor } from '@/features/agenda/config';
import type { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from '@/types/appointment';
import { AGENDA_END_HOUR } from '@/features/agenda/config';
import { toast } from 'sonner';

export type ViewMode = 'day' | 'week' | 'month';

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [prefilledSlot, setPrefilledSlot] = useState<{ date: string; time: string } | null>(null);
  const [prefilledPatientId, setPrefilledPatientId] = useState<string | undefined>();
  const [prefilledSpecialtyId, setPrefilledSpecialtyId] = useState<string | undefined>();
  const [activeDragAppointment, setActiveDragAppointment] = useState<Appointment | null>(null);
  const [activeDragNew, setActiveDragNew] = useState<{ patientName: string; serviceName: string; practitionerName: string; durationMinutes: number } | null>(null);

  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Rango de fechas según la vista
  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      return { start: format(currentDate, 'yyyy-MM-dd'), end: format(currentDate, 'yyyy-MM-dd') };
    }
    if (viewMode === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { start: format(ws, 'yyyy-MM-dd'), end: format(we, 'yyyy-MM-dd') };
    }
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return { start: format(firstDay, 'yyyy-MM-dd'), end: format(lastDay, 'yyyy-MM-dd') };
  }, [currentDate, viewMode]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', dateRange.start, dateRange.end, selectedPractitioner],
    queryFn: () =>
      appointmentsApi
        .list({
          from: dateRange.start,
          to: dateRange.end,
          ...(selectedPractitioner ? { practitioner_id: selectedPractitioner } : {}),
        })
        .then((r) => r.data),
  });

  // Fetch practitioners for the toolbar filter
  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const practitionerOptions = useMemo(() => {
    if (!allUsers) return [];
    const clinicians = allUsers.filter((u) => u.is_active && u.role !== 'ADMIN' && u.role !== 'ADMINISTRATIVE');
    return clinicians.map((u, i) => ({
      id: u.id,
      name: u.name,
      colorSolid: getPractitionerColor(i).solid,
    }));
  }, [allUsers]);

  // Practitioner index for DragOverlay coloring
  const practitionerIndex = useMemo(() => {
    const ids = [...new Set(appointments.map((a) => a.practitioner_id))];
    const map: Record<string, number> = {};
    ids.forEach((id, i) => (map[id] = i));
    return map;
  }, [appointments]);

  // Navegación
  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (viewMode === 'day') setCurrentDate((d) => subDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subMonths(d, 1));
  };
  const goNext = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  // Título según vista
  const title = useMemo(() => {
    if (viewMode === 'day') return format(currentDate, "EEEE d 'de' MMMM, yyyy", { locale: es });
    if (viewMode === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const wf = addDays(ws, 4);
      return `${format(ws, 'd MMM', { locale: es })} — ${format(wf, 'd MMM yyyy', { locale: es })}`;
    }
    return format(currentDate, "MMMM 'de' yyyy", { locale: es });
  }, [currentDate, viewMode]);

  // Mutaciones
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAppointmentPayload }) =>
      appointmentsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Cita actualizada');
    },
    onError: () => toast.error('Error al mover la cita'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      appointmentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Cita creada');
    },
    onError: () => toast.error('Error al crear la cita'),
  });

  // Parsea un slot ID tipo "2026-03-23|09:00"
  const parseSlotId = (id: string) => {
    const sep = id.indexOf('|');
    if (sep === -1) return null;
    return { date: id.slice(0, sep), time: id.slice(sep + 1) };
  };

  // DragOverlay: track active drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.appointment) {
      setActiveDragAppointment(data.appointment as Appointment);
    } else if (data?.type === 'new') {
      setActiveDragNew({
        patientName: data.patientName as string ?? 'Paciente',
        serviceName: data.serviceName as string ?? 'Servicio',
        practitionerName: data.practitionerName as string ?? 'Profesional',
        durationMinutes: (data.durationMinutes as number) ?? 30,
      });
    }
  }, []);

  // DnD handler para la vista semanal
  const handleWeekDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragAppointment(null);
      setActiveDragNew(null);
      const { active, over } = event;
      if (!over) return;

      const slot = parseSlotId(over.id.toString());
      if (!slot) return;

      // ¿Cita nueva desde el panel de creación?
      if (active.data.current?.type === 'new') {
        const { patientId, specialtyId, serviceId, practitionerId, durationMinutes } = active.data.current as {
          patientId: string; specialtyId: string; serviceId: string; practitionerId: string; durationMinutes: number;
        };

        const startsAt = new Date(`${slot.date}T${slot.time}:00`);
        const endsAt = addMinutes(startsAt, durationMinutes);

        const endHour = endsAt.getHours() + endsAt.getMinutes() / 60;
        if (endHour > AGENDA_END_HOUR) {
          toast.error('La cita excede el horario de la agenda');
          return;
        }

        createMutation.mutate({
          patient_id: patientId,
          practitioner_id: practitionerId,
          service_id: serviceId,
          specialty_id: specialtyId,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
        });
        return;
      }

      // Mover cita existente
      const appointment = active.data.current?.appointment as Appointment | undefined;
      if (!appointment) return;

      const originalStart = new Date(appointment.starts_at);
      const originalEnd = new Date(appointment.ends_at);
      const duration = differenceInMinutes(originalEnd, originalStart);

      const newStart = new Date(`${slot.date}T${slot.time}:00`);
      const newEnd = addMinutes(newStart, duration);

      const endHour = newEnd.getHours() + newEnd.getMinutes() / 60;
      if (endHour > AGENDA_END_HOUR) return;
      if (newStart.getTime() === originalStart.getTime()) return;

      updateMutation.mutate({
        id: appointment.id,
        payload: { starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() },
      });
    },
    [updateMutation, createMutation],
  );

  // Handlers
  const handleSlotClick = useCallback((date: string, time: string) => {
    setEditingAppointment(null);
    setPrefilledSlot({ date, time });
    setPrefilledPatientId(undefined);
    setPrefilledSpecialtyId(undefined);
    setModalOpen(true);
  }, []);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setPrefilledSlot(null);
    setPrefilledPatientId(undefined);
    setPrefilledSpecialtyId(undefined);
    setEditingAppointment(appointment);
    setModalOpen(true);
  }, []);

  const handleDayDrop = useCallback(
    (appointmentId: string, newStartsAt: string, newEndsAt: string) => {
      updateMutation.mutate({
        id: appointmentId,
        payload: { starts_at: newStartsAt, ends_at: newEndsAt },
      });
    },
    [updateMutation],
  );

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingAppointment(null);
    setPrefilledSlot(null);
    setPrefilledPatientId(undefined);
    setPrefilledSpecialtyId(undefined);
  };

  return (
    <div className="flex h-full flex-col space-y-3">
      {/* ─── Compact hero strip ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(253,245,250,0.98)_44%,rgba(243,236,245,0.96)_100%)] px-5 py-4 shadow-[0_8px_30px_rgba(82,24,105,0.08)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-200/25 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-950">Agenda clínica</h1>
              <p className="text-xs text-gray-500">Coordinación de citas en tiempo real</p>
            </div>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <div className="flex items-center gap-2 rounded-xl border border-white/75 bg-white/80 px-3 py-2 shadow-sm">
              <CalendarRange className="h-3.5 w-3.5 text-primary-400" />
              <span className="text-xs font-semibold text-gray-700">{viewMode === 'week' ? 'Semana' : viewMode === 'day' ? 'Día' : 'Mes'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/75 bg-white/80 px-3 py-2 shadow-sm">
              <Clock3 className="h-3.5 w-3.5 text-secondary-400" />
              <span className="text-xs font-semibold text-gray-700 capitalize">{title}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/75 bg-white/80 px-3 py-2 shadow-sm">
              <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-primary-50 px-1 text-[10px] font-bold text-primary-600">{appointments.length}</span>
              <span className="text-xs font-semibold text-gray-700">citas</span>
            </div>
          </div>
        </div>
      </section>

      <CalendarToolbar
        title={title}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        selectedPractitioner={selectedPractitioner}
        onPractitionerChange={setSelectedPractitioner}
        practitioners={practitionerOptions}
      />

      {viewMode === 'week' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleWeekDragEnd}>
          <div className="flex flex-1 gap-3 overflow-hidden">
            <CreationPanel />
            <div className="flex-1 overflow-auto rounded-2xl border border-border bg-surface shadow-sm">
              <WeekView
                currentDate={currentDate}
                appointments={appointments}
                onSlotClick={handleSlotClick}
                onAppointmentClick={handleAppointmentClick}
                isLoading={isLoading}
              />
            </div>
          </div>
          {/* DragOverlay: portaled to body so it renders above everything */}
          {createPortal(
            <DragOverlay dropAnimation={null} zIndex={9999}>
              {activeDragAppointment && (
                <AppointmentCardOverlay
                  appointment={activeDragAppointment}
                  colorClasses={getPractitionerColor(practitionerIndex[activeDragAppointment.practitioner_id] ?? 0)}
                />
              )}
              {activeDragNew && (
                <div className="w-44 rounded-lg border-l-[4px] border-primary-400 bg-white/95 px-2.5 py-2 shadow-2xl ring-2 ring-primary-300/40 rotate-[1.5deg] scale-105 backdrop-blur-sm">
                  <p className="truncate text-[11px] font-semibold text-gray-900">{activeDragNew.patientName}</p>
                  <p className="mt-0.5 truncate text-[10px] text-gray-500">{activeDragNew.serviceName}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-primary-500">{activeDragNew.durationMinutes} min</p>
                </div>
              )}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      ) : (
        <div className="flex-1 overflow-auto rounded-2xl border border-border bg-surface shadow-sm">
          {viewMode === 'day' && (
            <DayView
              date={currentDate}
              appointments={appointments}
              onSlotClick={handleSlotClick}
              onAppointmentClick={handleAppointmentClick}
              onDrop={handleDayDrop}
              isLoading={isLoading}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              appointments={appointments}
              onDayClick={(date) => {
                setCurrentDate(date);
                setViewMode('day');
              }}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </div>
      )}

      <AppointmentModal
        open={modalOpen}
        onClose={handleModalClose}
        appointment={editingAppointment}
        prefilledSlot={prefilledSlot}
        prefilledPatientId={prefilledPatientId}
        prefilledSpecialtyId={prefilledSpecialtyId}
      />
    </div>
  );
}
