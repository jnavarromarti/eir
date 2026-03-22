import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/api/patients';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Edit, UserCircle, Calendar, Phone, Mail, MapPin,
  FileText, Activity, Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = usePermissions();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: records } = useQuery({
    queryKey: ['patients', id, 'records'],
    queryFn: () => patientsApi.listRecords(id!).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-full skeleton" />
            <div className="h-7 w-56 rounded skeleton" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-14 w-44 rounded-xl skeleton" />
          <div className="h-14 w-36 rounded-xl skeleton" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="h-5 w-40 rounded skeleton" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2"><div className="h-3 w-20 rounded skeleton" /><div className="h-4 w-32 rounded skeleton" /></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link to="/patients" className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-gray-400 shadow-sm transition-colors hover:bg-primary-50 hover:text-primary-500">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
              <UserCircle className="h-3.5 w-3.5" />
              Ficha del paciente
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-gray-950">
                {patient.first_name} {patient.last_name}
              </h1>
              <Badge variant={patient.is_active ? 'success' : 'danger'}>
                {patient.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">DNI: {patient.dni}</p>
          </div>
        </div>
        {can('patients:write') && (
          <Link to={`/patients/${patient.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4" /> Editar
            </Button>
          </Link>
        )}
      </div>

      {/* ── Metrics strip ── */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Próxima cita</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            {patient.next_appointment
              ? format(new Date(patient.next_appointment.starts_at), "d MMM yyyy · HH:mm", { locale: es })
              : 'Sin cita programada'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Registros clínicos</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{records?.length ?? 0}</p>
        </div>
      </div>

      {/* ── Datos personales ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
              <UserCircle className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900">Información personal</h3>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field icon={Calendar} label="Fecha de nacimiento" value={patient.birth_date ? format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: es }) : '—'} />
            <Field icon={Phone} label="Teléfono" value={patient.phone || '—'} />
            <Field icon={Mail} label="Email" value={patient.email || '—'} />
            <Field icon={MapPin} label="Dirección" value={patient.address || '—'} />
            <Field icon={MapPin} label="Ciudad" value={patient.city || '—'} />
            <Field icon={MapPin} label="Código postal" value={patient.postal_code || '—'} />
          </dl>
        </CardContent>
      </Card>

      {/* ── Notas médicas (accent bar) ── */}
      {patient.medical_notes && (
        <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="flex">
            <div className="w-1 shrink-0 bg-gradient-to-b from-primary-400 to-secondary-400" />
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-gray-900">Notas médicas</h3>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{patient.medical_notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Historial clínico (timeline) ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-50 text-secondary-500">
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900">Historial clínico</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!records?.length ? (
            <p className="px-6 py-8 text-center text-sm text-gray-500">
              No hay registros clínicos todavía.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {records.map((rec) => (
                <div key={rec.id} className="group relative px-6 py-4 transition-colors hover:bg-primary-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-50 text-secondary-400">
                      <Stethoscope className="h-3 w-3" />
                    </div>
                    <Badge variant="primary">{rec.specialty?.name}</Badge>
                    <span className="text-xs text-gray-400">
                      {format(new Date(rec.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                    {rec.practitioner && (
                      <span className="ml-auto text-xs text-gray-400">Dr/a. {rec.practitioner.name}</span>
                    )}
                  </div>
                  <div className="space-y-1 pl-8">
                    {rec.reason && <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">Motivo:</span> {rec.reason}</p>}
                    {rec.diagnosis && <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">Diagnóstico:</span> {rec.diagnosis}</p>}
                    {rec.treatment && <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">Tratamiento:</span> {rec.treatment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</dt>
        <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
      </div>
    </div>
  );
}
