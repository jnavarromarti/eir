import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { ChartDataPoint, PractitionerStats } from '@/types/analytics';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Users,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

/* ─── Role labels ─── */
const ROLE_LABELS: Record<string, string> = {
  CHIROPODIST: 'Podólogo',
  RADIOLOGY_TECHNICIAN: 'Téc. Radiología',
  PHYSIOTHERAPIST: 'Fisioterapeuta',
  SPEECH_THERAPIST: 'Logopeda',
  DENTIST: 'Odontólogo',
};

/* ─── Currency formatter ─── */
function eur(value: number): string {
  return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/* ─── Mini bar chart (pure CSS) ─── */
function MiniBarChart({ data, dataKey, color }: { data: ChartDataPoint[]; dataKey: 'revenue' | 'appointments'; color: string }) {
  const max = Math.max(...data.map((d) => d[dataKey]), 1);

  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((point, i) => {
        const pct = (point[dataKey] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative flex items-end justify-center" style={{ height: '80px' }}>
              <div
                className={cn('w-full max-w-[32px] rounded-t-md transition-all duration-500', color)}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
            </div>
            <span className="text-[9px] font-medium text-gray-400 truncate w-full text-center">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subvalue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && trend !== 'neutral' && (
          <div className={cn('flex items-center gap-0.5 text-xs font-semibold', trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
            {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-gray-950">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      {subvalue && <p className="mt-1 text-xs text-gray-500">{subvalue}</p>}
    </div>
  );
}

/* ─── Practitioner row ─── */
function PractitionerRow({ p, isFirst }: { p: PractitionerStats; isFirst: boolean }) {
  const completionRate = p.appointments.month > 0
    ? Math.round((p.appointments.completed_month / p.appointments.month) * 100)
    : 0;

  return (
    <div className={cn('grid grid-cols-12 gap-4 items-center px-5 py-4', !isFirst && 'border-t border-border')}>
      {/* Name + Role */}
      <div className="col-span-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 text-xs font-bold text-white">
          {p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
          <p className="text-[11px] text-gray-400">{ROLE_LABELS[p.role] ?? p.role}</p>
        </div>
      </div>

      {/* Appointments Week / Month / Year */}
      <div className="col-span-1 text-center">
        <p className="text-sm font-bold text-gray-900 tabular-nums">{p.appointments.week}</p>
        <p className="text-[10px] text-gray-400">Sem</p>
      </div>
      <div className="col-span-1 text-center">
        <p className="text-sm font-bold text-gray-900 tabular-nums">{p.appointments.month}</p>
        <p className="text-[10px] text-gray-400">Mes</p>
      </div>
      <div className="col-span-1 text-center">
        <p className="text-sm font-bold text-gray-900 tabular-nums">{p.appointments.year}</p>
        <p className="text-[10px] text-gray-400">Año</p>
      </div>

      {/* Completion rate */}
      <div className="col-span-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                completionRate >= 80 ? 'bg-emerald-500' : completionRate >= 50 ? 'bg-amber-400' : 'bg-red-400',
              )}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 tabular-nums w-8 text-right">{completionRate}%</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {p.appointments.completed_month} completadas · {p.appointments.cancelled_month} cancel.
        </p>
      </div>

      {/* Revenue */}
      <div className="col-span-2 text-right">
        <p className="text-sm font-bold text-gray-900 tabular-nums">{eur(p.revenue.month)}</p>
        <p className="text-[10px] text-gray-400">Mes</p>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-sm font-bold text-gray-900 tabular-nums">{eur(p.revenue.year)}</p>
        <p className="text-[10px] text-gray-400">Año</p>
      </div>
    </div>
  );
}

/* ─── Period selector ─── */
type Period = 'week' | 'month' | 'year';
const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
];

/* ═══════════════════════════════════════════
   Main page component
   ═══════════════════════════════════════════ */
export default function AnalyticsDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<Period>('month');

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.overview().then((r) => r.data),
  });

  const { data: practitioners, isLoading: loadingPractitioners } = useQuery({
    queryKey: ['analytics', 'practitioners'],
    queryFn: () => analyticsApi.practitioners().then((r) => r.data),
  });

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ['analytics', 'revenue-chart', chartPeriod],
    queryFn: () => analyticsApi.revenueChart(chartPeriod).then((r) => r.data),
  });

  const invoiceBreakdown = useMemo(() => {
    if (!overview?.invoices_by_status) return [];
    const STATUS_META: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info' }> = {
      PAID: { label: 'Pagadas', variant: 'success' },
      ISSUED: { label: 'Emitidas', variant: 'warning' },
      DRAFT: { label: 'Borrador', variant: 'default' },
      CANCELLED: { label: 'Anuladas', variant: 'danger' },
    };
    return Object.entries(overview.invoices_by_status).map(([status, data]) => ({
      ...data,
      status,
      ...(STATUS_META[status] ?? { label: status, variant: 'default' as const }),
    }));
  }, [overview]);

  const isLoading = loadingOverview || loadingPractitioners;

  /* ─── Skeleton ─── */
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse-soft">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded-full skeleton" />
            <div className="h-6 w-48 rounded skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="h-64 rounded-2xl skeleton" />
        <div className="h-80 rounded-2xl skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 text-white shadow-md">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
            <Activity className="h-3.5 w-3.5" />
            Panel de Supervisión
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-950">Analytics & Rendimiento</h1>
        </div>
      </div>

      {/* ── Revenue KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={DollarSign}
          label="Recaudación semanal"
          value={eur(overview?.revenue.week ?? 0)}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Recaudación mensual"
          value={eur(overview?.revenue.month ?? 0)}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Recaudación anual"
          value={eur(overview?.revenue.year ?? 0)}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total recaudado"
          value={eur(overview?.revenue.total ?? 0)}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={Clock}
          label="Pendiente de cobro"
          value={eur(overview?.revenue.pending ?? 0)}
          color="bg-amber-50 text-amber-600"
          trend={overview?.revenue.pending ? 'down' : 'neutral'}
        />
      </div>

      {/* ── Appointment KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Citas esta semana"
          value={String(overview?.appointments.week ?? 0)}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CalendarCheck}
          label="Citas este mes"
          value={String(overview?.appointments.month ?? 0)}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={CalendarCheck}
          label="Completadas (mes)"
          value={String(overview?.appointments.completed_month ?? 0)}
          color="bg-emerald-50 text-emerald-600"
          trend="up"
        />
        <StatCard
          icon={AlertTriangle}
          label="Canceladas / No-show"
          value={String(overview?.appointments.cancelled_month ?? 0)}
          color="bg-red-50 text-red-600"
          trend={overview?.appointments.cancelled_month ? 'down' : 'neutral'}
        />
      </div>

      {/* ── Revenue chart + Invoice breakdown ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-gray-900">Evolución de ingresos</h3>
              </div>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setChartPeriod(opt.value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold transition-colors',
                      chartPeriod === opt.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface text-gray-500 hover:bg-gray-50',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingChart ? (
              <div className="h-28 skeleton rounded-lg" />
            ) : chartData && chartData.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Ingresos</p>
                  <MiniBarChart data={chartData} dataKey="revenue" color="bg-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Citas</p>
                  <MiniBarChart data={chartData} dataKey="appointments" color="bg-blue-400" />
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">Sin datos para este período</p>
            )}
          </CardContent>
        </Card>

        {/* Invoice breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-50 text-secondary-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-gray-900">Facturas por estado</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoiceBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.variant}>{item.label}</Badge>
                    <span className="text-xs text-gray-400">{item.count} facturas</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-gray-900">{eur(item.total)}</span>
                </div>
              ))}
              {invoiceBreakdown.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-400">Sin facturas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Practitioner performance table ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900">Rendimiento por profesional</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 items-center px-5 py-3 border-b border-border bg-gray-50/60 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            <div className="col-span-3">Profesional</div>
            <div className="col-span-1 text-center">Sem</div>
            <div className="col-span-1 text-center">Mes</div>
            <div className="col-span-1 text-center">Año</div>
            <div className="col-span-2">Tasa completadas</div>
            <div className="col-span-2 text-right">Ingreso mes</div>
            <div className="col-span-2 text-right">Ingreso año</div>
          </div>

          {practitioners && practitioners.length > 0 ? (
            practitioners.map((p, i) => (
              <PractitionerRow key={p.id} p={p} isFirst={i === 0} />
            ))
          ) : (
            <p className="px-6 py-8 text-center text-sm text-gray-400">No hay profesionales activos</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
