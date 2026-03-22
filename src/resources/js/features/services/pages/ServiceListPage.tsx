import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/api/services';
import { specialtiesApi } from '@/api/specialties';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Plus, Stethoscope, Clock, Pencil,
  Activity, Search, Layers, Timer, Euro,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Service } from '@/types/service';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════════
   VALIDATION
   ═══════════════════════════════════════════════════════════════════════════ */

const serviceSchema = z.object({
  name: z.string().min(2, 'Nombre obligatorio'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Precio no válido'),
  duration_minutes: z.coerce.number().min(15, 'Mínimo 15 min'),
  specialty_id: z.string().min(1, 'Especialidad obligatoria'),
});
type ServiceFormValues = z.infer<typeof serviceSchema>;

/* ═══════════════════════════════════════════════════════════════════════════════
   SPECIALTY ACCENT SYSTEM — one palette per specialty, deterministic by order
   ═══════════════════════════════════════════════════════════════════════════ */

const ACCENT_PALETTES = [
  { bar: 'from-rose-400 to-pink-500',     iconBg: 'bg-rose-100',    iconText: 'text-rose-500',    chip: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
  { bar: 'from-blue-400 to-indigo-500',   iconBg: 'bg-blue-100',    iconText: 'text-blue-500',    chip: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  { bar: 'from-violet-400 to-purple-500', iconBg: 'bg-violet-100',  iconText: 'text-violet-500',  chip: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
  { bar: 'from-emerald-400 to-teal-500',  iconBg: 'bg-emerald-100', iconText: 'text-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  { bar: 'from-amber-400 to-orange-500',  iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  { bar: 'from-cyan-400 to-sky-500',      iconBg: 'bg-cyan-100',    iconText: 'text-cyan-500',    chip: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200' },
  { bar: 'from-fuchsia-400 to-pink-600',  iconBg: 'bg-fuchsia-100', iconText: 'text-fuchsia-500', chip: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-200' },
];

interface AccentPalette {
  bar: string;
  iconBg: string;
  iconText: string;
  chip: string;
}

const FALLBACK_ACCENT: AccentPalette = {
  bar: 'from-gray-300 to-gray-400',
  iconBg: 'bg-gray-100',
  iconText: 'text-gray-500',
  chip: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
};

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function splitPrice(price: number) {
  const formatted = Number(price).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [integer, decimal] = formatted.split(',');
  return { integer, decimal: decimal ?? '00' };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SKELETON — mirrors the final layout for seamless loading
   ═══════════════════════════════════════════════════════════════════════════ */

function CatalogSkeleton() {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="space-y-3">
        <div className="h-7 w-40 rounded-full skeleton" />
        <div className="h-9 w-52 rounded-lg skeleton" />
        <div className="h-4 w-96 max-w-full rounded skeleton" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[76px] rounded-xl skeleton" />
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full skeleton" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[310px] rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SERVICE CARD — premium catalog card with price hero & specialty accent
   ═══════════════════════════════════════════════════════════════════════════ */

function ServiceCard({
  service,
  accent,
  onEdit,
  onDeactivate,
  index,
}: {
  service: Service;
  accent: AccentPalette;
  onEdit: () => void;
  onDeactivate: () => void;
  index: number;
}) {
  const { integer, decimal } = useMemo(() => splitPrice(service.price), [service.price]);

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border bg-surface overflow-hidden',
        'shadow-sm transition-all duration-300 ease-out',
        'hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300',
        'focus-within:ring-2 focus-within:ring-primary-200 focus-within:ring-offset-2',
        !service.is_active && 'opacity-55',
      )}
      style={{ animation: `slide-up 0.4s ease-out ${index * 60}ms both` }}
    >
      {/* ── Top accent gradient bar ── */}
      <div
        className={cn(
          'h-[3px] w-full bg-gradient-to-r transition-all duration-300 group-hover:h-1',
          accent.bar,
          !service.is_active && 'grayscale opacity-50',
        )}
      />

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col p-5">
        {/* Specialty icon + chip + status */}
        <div className="mb-3.5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                'transition-transform duration-300 group-hover:scale-105',
                accent.iconBg,
              )}
            >
              <Stethoscope className={cn('h-[18px] w-[18px]', accent.iconText)} />
            </div>
            {service.specialty && (
              <span
                className={cn(
                  'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]',
                  accent.chip,
                )}
              >
                {service.specialty.name}
              </span>
            )}
          </div>
          {!service.is_active && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              Inactivo
            </span>
          )}
        </div>

        {/* Service name */}
        <h3 className="mb-1 text-[15px] font-extrabold leading-snug tracking-tight text-gray-900">
          {service.name}
        </h3>

        {/* Description — 2-line clamp, fixed min-height for alignment */}
        <p className="mb-5 min-h-[2.6rem] text-[13px] leading-relaxed text-gray-400 line-clamp-2">
          {service.description || 'Sin descripción disponible'}
        </p>

        {/* ── Pricing & duration zone — sunken surface for visual separation ── */}
        <div className="mt-auto rounded-xl bg-surface-sunken/70 p-3.5">
          <div className="flex items-end justify-between">
            {/* Price hero */}
            <div className="flex items-baseline gap-0.5">
              <span className="mr-0.5 text-xs font-semibold text-gray-400">€</span>
              <span className="text-[26px] font-black leading-none tracking-tight text-gray-900">
                {integer}
              </span>
              <span className="text-sm font-bold text-gray-300">,{decimal}</span>
            </div>
            {/* Duration capsule */}
            <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-600">{service.duration_minutes}</span>
              <span className="text-[10px] font-medium text-gray-400">min</span>
            </div>
          </div>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-gray-300">
            por sesión
          </p>
        </div>
      </div>

      {/* ── Actions footer ── */}
      <div className="flex items-center justify-between border-t border-border-subtle px-5 py-2.5">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700"
        >
          <Pencil className="h-3 w-3" />
          Editar
        </button>
        {service.is_active ? (
          <button
            onClick={onDeactivate}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-emerald-500 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Activo
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-gray-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            Inactivo
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN — ServiceListPage
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ServiceListPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Service | null>(null);
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Queries ── */
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list().then((r) => r.data),
  });

  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesApi.list().then((r) => r.data),
  });

  /* ── Form ── */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as any,
  });

  /* ── Mutations ── */
  const saveMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => {
      const payload = { ...values, specialty_id: values.specialty_id || undefined };
      return editingService
        ? servicesApi.update(editingService.id, payload as any)
        : servicesApi.create(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(editingService ? 'Servicio actualizado' : 'Servicio creado');
      setShowModal(false);
    },
    onError: () => toast.error('Error al guardar el servicio'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => servicesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Servicio desactivado');
      setDeactivateTarget(null);
    },
  });

  /* ── Specialty → color mapping (deterministic by API order) ── */
  const accentMap = useMemo(() => {
    const map = new Map<string, AccentPalette>();
    specialties?.forEach((sp, i) => {
      map.set(sp.id, ACCENT_PALETTES[i % ACCENT_PALETTES.length]);
    });
    return map;
  }, [specialties]);

  /* ── Filtering ── */
  const filteredServices = useMemo(() => {
    if (!services) return [];
    const q = searchQuery.toLowerCase();
    return services
      .filter((s) => !activeSpecialty || s.specialty_id === activeSpecialty)
      .filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [services, activeSpecialty, searchQuery]);

  /* ── Metrics ── */
  const metrics = useMemo(() => {
    if (!services?.length) return null;
    const active = services.filter((s) => s.is_active);
    const avgPrice = active.length
      ? active.reduce((sum, s) => sum + Number(s.price), 0) / active.length
      : 0;
    const avgDuration = active.length
      ? active.reduce((sum, s) => sum + s.duration_minutes, 0) / active.length
      : 0;
    return {
      total: services.length,
      active: active.length,
      avgPrice: Number(avgPrice).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      avgDuration: Math.round(avgDuration),
    };
  }, [services]);

  /* ── Handlers ── */
  const openCreate = () => {
    setEditingService(null);
    reset({ name: '', description: '', price: 0, duration_minutes: 30, specialty_id: '' });
    setShowModal(true);
  };

  const openEdit = (svc: Service) => {
    setEditingService(svc);
    reset({
      name: svc.name,
      description: svc.description ?? '',
      price: svc.price,
      duration_minutes: svc.duration_minutes,
      specialty_id: svc.specialty_id ?? '',
    });
    setShowModal(true);
  };

  /* ── Loading ── */
  if (isLoading) return <CatalogSkeleton />;

  return (
    <div className="animate-fade-in space-y-8">

      {/* ─────────────── HEADER ─────────────── */}
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
              <Stethoscope className="h-3.5 w-3.5" />
              Catálogo asistencial
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                Servicios
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
                Configura los servicios, precios y duraciones que ofrece la clínica.
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="h-4 w-4" /> Nuevo servicio
          </Button>
        </div>

        {/* ── KPI metrics ── */}
        {metrics && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              { label: 'Total servicios', value: metrics.total, Icon: Layers,   accent: 'bg-primary-50 text-primary-500' },
              { label: 'Activos',          value: metrics.active, Icon: Activity, accent: 'bg-emerald-50 text-emerald-500' },
              { label: 'Precio medio',     value: `€${metrics.avgPrice}`, Icon: Euro, accent: 'bg-amber-50 text-amber-500' },
              { label: 'Duración media',   value: `${metrics.avgDuration} min`, Icon: Timer, accent: 'bg-blue-50 text-blue-500' },
            ] as const).map((m) => (
              <div
                key={m.label}
                className="group/metric relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover/metric:scale-110',
                      m.accent,
                    )}
                  >
                    <m.Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                      {m.label}
                    </p>
                    <p className="text-lg font-black tracking-tight text-gray-900">{m.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ─────────────── FILTER BAR ─────────────── */}
      {services && services.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Specialty filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            <button
              role="tab"
              aria-selected={activeSpecialty === null}
              onClick={() => setActiveSpecialty(null)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                activeSpecialty === null
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              )}
            >
              Todos
              <span className="ml-1.5 text-[10px] opacity-60">{services.length}</span>
            </button>
            {specialties?.map((sp) => {
              const count = services.filter((s) => s.specialty_id === sp.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={sp.id}
                  role="tab"
                  aria-selected={activeSpecialty === sp.id}
                  onClick={() => setActiveSpecialty(activeSpecialty === sp.id ? null : sp.id)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                    activeSpecialty === sp.id
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                  )}
                >
                  {sp.name}
                  <span className="ml-1.5 text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicio…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 transition-all duration-200 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200/50 sm:w-64"
            />
          </div>
        </div>
      )}

      {/* ─────────────── SERVICE GRID ─────────────── */}
      {!services?.length ? (
        <EmptyState
          icon={<Stethoscope className="h-12 w-12" />}
          title="No hay servicios"
          description="Configura los servicios que ofrece la clínica."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Crear primer servicio
            </Button>
          }
        />
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center animate-fade-in">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-300">
            <Search className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Sin resultados</p>
          <p className="mt-1 text-xs text-gray-400">
            Prueba con otro término o categoría
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((svc, i) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              accent={accentMap.get(svc.specialty_id) ?? FALLBACK_ACCENT}
              onEdit={() => openEdit(svc)}
              onDeactivate={() => setDeactivateTarget(svc)}
              index={i}
            />
          ))}
        </div>
      )}

      {/* ─────────────── MODAL CREATE / EDIT ─────────────── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingService ? 'Editar servicio' : 'Nuevo servicio'}
      >
        <form
          onSubmit={handleSubmit((v: ServiceFormValues) => saveMutation.mutate(v))}
          className="space-y-4"
        >
          <Input
            id="name"
            label="Nombre"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="description"
            label="Descripción (opcional)"
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price"
              label="Precio (€)"
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              id="duration_minutes"
              label="Duración (min)"
              type="number"
              step="5"
              error={errors.duration_minutes?.message}
              {...register('duration_minutes')}
            />
          </div>
          <Select
            id="specialty_id"
            label="Especialidad"
            placeholder="Seleccionar especialidad"
            options={specialties?.map((sp) => ({ value: sp.id, label: sp.name })) ?? []}
            error={errors.specialty_id?.message}
            {...register('specialty_id')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm deactivate ── */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
        title="Desactivar servicio"
        message={`¿Estás seguro de desactivar "${deactivateTarget?.name}"? No aparecerá como opción al crear citas ni facturas.`}
        confirmLabel="Desactivar"
        destructive
        loading={deactivateMutation.isPending}
      />
    </div>
  );
}
