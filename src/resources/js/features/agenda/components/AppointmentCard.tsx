import { cn } from '@/lib/utils';
import { AppointmentStatus, AppointmentStatusLabel } from '@/types/enums';
import type { Appointment } from '@/types/appointment';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

/* ─── Types ─── */

interface AppointmentCardProps {
  appointment: Appointment;
  colorClasses: { bg: string; border: string; text: string; solid: string };
  onClick: (appointment: Appointment) => void;
  style?: React.CSSProperties;
  heightPx?: number;
}

/** Visual-only variant for DragOverlay (no dnd-kit hooks). */
export function AppointmentCardOverlay({
  appointment,
  colorClasses,
}: {
  appointment: Appointment;
  colorClasses: { bg: string; border: string; text: string; solid: string };
}) {
  const patientName = appointment.patient
    ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
    : 'Paciente';
  const timeStart = format(new Date(appointment.starts_at), 'HH:mm');
  const timeEnd = format(new Date(appointment.ends_at), 'HH:mm');

  return (
    <div
      className="w-44 rounded-lg border-l-[4px] bg-white/95 px-2.5 py-2 shadow-2xl ring-2 ring-primary-300/40 rotate-[1.5deg] scale-105 backdrop-blur-sm"
      style={{ borderLeftColor: colorClasses.solid }}
    >
      <p className="truncate text-[11px] font-semibold text-gray-900">{patientName}</p>
      <p className="mt-0.5 text-[10px] tabular-nums text-gray-500">
        {timeStart} – {timeEnd}
      </p>
      {appointment.service && (
        <p className="mt-0.5 truncate text-[10px] font-medium" style={{ color: colorClasses.solid }}>
          {appointment.service.name}
        </p>
      )}
    </div>
  );
}

/* ─── Status tokens ─── */

const STATUS_DOT: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'bg-status-scheduled',
  [AppointmentStatus.CONFIRMED]: 'bg-status-confirmed',
  [AppointmentStatus.IN_PROGRESS]: 'bg-status-in-progress',
  [AppointmentStatus.COMPLETED]: 'bg-status-completed',
  [AppointmentStatus.CANCELLED]: 'bg-status-cancelled',
  [AppointmentStatus.NO_SHOW]: 'bg-status-no-show',
};

/* ─── Main card (with drag) ─── */

export default function AppointmentCard({
  appointment,
  colorClasses,
  onClick,
  style,
  heightPx = 48,
}: AppointmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: { appointment },
  });

  const dragStyle = transform
    ? { ...style, transform: CSS.Translate.toString(transform), zIndex: 50 }
    : style;

  const patientName = appointment.patient
    ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
    : 'Paciente';

  const timeStart = format(new Date(appointment.starts_at), 'HH:mm');
  const timeEnd = format(new Date(appointment.ends_at), 'HH:mm');

  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;
  const isNoShow = appointment.status === AppointmentStatus.NO_SHOW;
  const isStrikethrough = isCancelled || isNoShow;

  /* Height-aware layout thresholds */
  const isCompact = heightPx < 56;
  const isMedium = heightPx >= 56 && heightPx < 80;
  const isFull = heightPx >= 80;

  /* ─── Ghost placeholder while dragging ─── */
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={dragStyle}
        className="h-full rounded-lg border-2 border-dashed border-primary-200/60 bg-primary-50/20"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick(appointment);
      }}
      style={{ ...dragStyle, borderLeftColor: colorClasses.solid }}
      className={cn(
        'group/card relative h-full cursor-grab select-none overflow-hidden rounded-lg border-l-[4px] bg-white transition-all duration-150',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]',
        'ring-1 ring-gray-950/[0.04]',
        'hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:ring-gray-950/[0.08]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        isStrikethrough && 'opacity-55',
      )}
      title={`${patientName} — ${timeStart}–${timeEnd} — ${AppointmentStatusLabel[appointment.status]}`}
      role="button"
      tabIndex={0}
      aria-label={`Cita: ${patientName}, ${timeStart} a ${timeEnd}`}
    >
      {/* Subtle practitioner tint */}
      <div className={cn('absolute inset-0 opacity-[0.05]', colorClasses.bg)} />

      <div className="relative flex h-full flex-col justify-center px-2 py-1">
        {/* ─── Compact (< 56 px) — single line ─── */}
        {isCompact && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full ring-[1.5px] ring-white', STATUS_DOT[appointment.status])} />
            <span className={cn('truncate text-[11px] font-semibold text-gray-900', isStrikethrough && 'line-through')}>
              {patientName}
            </span>
            <span className="ml-auto shrink-0 text-[10px] tabular-nums text-gray-400">{timeStart}</span>
          </div>
        )}

        {/* ─── Medium (56–79 px) — two lines ─── */}
        {isMedium && (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full ring-[1.5px] ring-white', STATUS_DOT[appointment.status])} />
              <span className={cn('truncate text-[11px] font-semibold text-gray-900', isStrikethrough && 'line-through')}>
                {patientName}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="tabular-nums">{timeStart} – {timeEnd}</span>
              {appointment.service && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="truncate">{appointment.service.name}</span>
                </>
              )}
            </div>
          </>
        )}

        {/* ─── Full (≥ 80 px) — multi-line detail ─── */}
        {isFull && (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn('h-2 w-2 shrink-0 rounded-full ring-[1.5px] ring-white', STATUS_DOT[appointment.status])} />
              <span className={cn('truncate text-xs font-semibold text-gray-900', isStrikethrough && 'line-through')}>
                {patientName}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] tabular-nums text-gray-500">{timeStart} – {timeEnd}</p>
            {appointment.practitioner && (
              <p className="mt-0.5 truncate text-[10px] text-gray-400">{appointment.practitioner.name}</p>
            )}
            {appointment.service && (
              <p className="mt-0.5 truncate text-[10px] font-medium" style={{ color: colorClasses.solid }}>
                {appointment.service.name}
              </p>
            )}
            {heightPx >= 110 && (
              <div className="mt-1 flex items-center gap-1">
                <span className={cn('inline-block h-1.5 w-1.5 rounded-full', STATUS_DOT[appointment.status])} />
                <span className="text-[9px] font-medium text-gray-400">{AppointmentStatusLabel[appointment.status]}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
