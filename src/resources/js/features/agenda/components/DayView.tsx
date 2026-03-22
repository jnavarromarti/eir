import { useMemo } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { format, isSameDay, addMinutes, differenceInMinutes } from 'date-fns';
import AppointmentCard from './AppointmentCard';
import { TIME_SLOTS, AGENDA_START_HOUR, AGENDA_END_HOUR, getAppointmentPosition, getPractitionerColor } from '../config';
import type { Appointment } from '@/types/appointment';
import { cn } from '@/lib/utils';
import { isBlockedDay, isPastDay, getHolidayName } from '../holidays';
import { useCurrentTime } from '../hooks/useCurrentTime';

/* ─── Overlap layout: compute horizontal columns for simultaneous appointments ─── */

interface LayoutSlot {
  appointment: Appointment;
  column: number;
  totalColumns: number;
}

function computeOverlapColumns(appointments: Appointment[]): LayoutSlot[] {
  if (appointments.length === 0) return [];

  const items = appointments
    .map((a) => ({
      appointment: a,
      start: new Date(a.starts_at).getTime(),
      end: new Date(a.ends_at).getTime(),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const groups: typeof items[] = [];
  let currentGroup = [items[0]];
  let groupEnd = items[0].end;

  for (let i = 1; i < items.length; i++) {
    if (items[i].start < groupEnd) {
      currentGroup.push(items[i]);
      groupEnd = Math.max(groupEnd, items[i].end);
    } else {
      groups.push(currentGroup);
      currentGroup = [items[i]];
      groupEnd = items[i].end;
    }
  }
  groups.push(currentGroup);

  const result: LayoutSlot[] = [];

  for (const group of groups) {
    const columns: number[][] = [];

    for (const item of group) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastEnd = columns[col][columns[col].length - 1];
        if (item.start >= lastEnd) {
          columns[col].push(item.end);
          result.push({ appointment: item.appointment, column: col, totalColumns: 0 });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([item.end]);
        result.push({ appointment: item.appointment, column: columns.length - 1, totalColumns: 0 });
      }
    }

    const totalCols = columns.length;
    for (const slot of result) {
      if (group.some((g) => g.appointment.id === slot.appointment.id) && slot.totalColumns === 0) {
        slot.totalColumns = totalCols;
      }
    }
  }

  return result;
}

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  onSlotClick: (date: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDrop: (appointmentId: string, newStartsAt: string, newEndsAt: string) => void;
  isLoading: boolean;
}

const SLOT_HEIGHT = 48;
const TOTAL_SLOTS = (AGENDA_END_HOUR - AGENDA_START_HOUR) * 2;

/* ─── Current-time indicator ─── */

function NowIndicator() {
  const now = useCurrentTime();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const agendaStart = AGENDA_START_HOUR * 60;
  const agendaEnd = AGENDA_END_HOUR * 60;

  if (minutes < agendaStart || minutes > agendaEnd) return null;

  const topPx = ((minutes - agendaStart) / 30) * SLOT_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{ top: `${topPx}px` }}
      aria-hidden
    >
      <div className="relative flex items-center">
        <div className="absolute -left-[5px] -top-[4px] h-[10px] w-[10px] rounded-full bg-red-500 shadow-sm shadow-red-500/30" />
        <div className="h-[2px] w-full bg-gradient-to-r from-red-500 to-red-400/40" />
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function DayView({ date, appointments, onSlotClick, onAppointmentClick, onDrop, isLoading }: DayViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const practitionerIndex = useMemo(() => {
    const ids = [...new Set(appointments.map((a) => a.practitioner_id))];
    const map: Record<string, number> = {};
    ids.forEach((id, i) => (map[id] = i));
    return map;
  }, [appointments]);

  const dayAppointments = appointments.filter((a) => isSameDay(new Date(a.starts_at), date));
  const layoutSlots = useMemo(() => computeOverlapColumns(dayAppointments), [dayAppointments]);
  const dateStr = format(date, 'yyyy-MM-dd');
  const blocked = isBlockedDay(date);
  const past = isPastDay(date);
  const holidayName = getHolidayName(dateStr);
  const isToday = isSameDay(date, new Date());

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!delta) return;

    const appointment = active.data.current?.appointment as Appointment | undefined;
    if (!appointment) return;

    const slotsOffset = Math.round(delta.y / SLOT_HEIGHT);
    if (slotsOffset === 0) return;

    const minutesOffset = slotsOffset * 30;
    const originalStart = new Date(appointment.starts_at);
    const originalEnd = new Date(appointment.ends_at);
    const duration = differenceInMinutes(originalEnd, originalStart);

    const newStart = addMinutes(originalStart, minutesOffset);
    const newEnd = addMinutes(newStart, duration);

    const startHour = newStart.getHours() + newStart.getMinutes() / 60;
    const endHour = newEnd.getHours() + newEnd.getMinutes() / 60;
    if (startHour < AGENDA_START_HOUR || endHour > AGENDA_END_HOUR) return;

    onDrop(appointment.id, newStart.toISOString(), newEnd.toISOString());
  };

  /* ─── Skeleton ─── */
  if (isLoading) {
    return (
      <div className="flex animate-pulse-soft">
        <div className="w-14 shrink-0 border-r border-gray-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex h-24 items-start justify-end pr-2 pt-1">
              <div className="skeleton h-3 w-8 rounded" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-2 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" style={{ marginTop: `${i * 20 + Math.random() * 30}px` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Blocked-day banner */}
      {blocked && (
        <div
          className={cn(
            'flex items-center justify-center gap-2 border-b px-4 py-2.5 text-sm font-medium',
            past
              ? 'border-gray-200 bg-gray-50 text-gray-500'
              : 'border-red-200/60 bg-red-50/60 text-red-600',
          )}
        >
          <span className={cn('inline-block h-1.5 w-1.5 rounded-full', past ? 'bg-gray-400' : 'bg-red-400')} />
          {past
            ? 'Día pasado — No se pueden programar citas'
            : `${holidayName ? `Festivo: ${holidayName}` : 'Fin de semana'} — No se pueden programar citas`}
        </div>
      )}

      <div className="flex">
        {/* ─── Time gutter ─── */}
        <div className="w-14 shrink-0 border-r border-gray-200/60">
          {TIME_SLOTS.map((time) => (
            <div
              key={time}
              className={cn(
                'flex h-12 items-start justify-end pr-2 pt-0.5',
                time.endsWith(':00') ? 'text-[11px] font-medium text-gray-400' : 'text-transparent',
              )}
            >
              {time.endsWith(':00') ? time : ''}
            </div>
          ))}
        </div>

        {/* ─── Slots grid ─── */}
        <div className="relative flex-1">
          {TIME_SLOTS.map((time) => {
            const isHourMark = time.endsWith(':30');
            return (
              <div
                key={time}
                className={cn(
                  'h-12 transition-colors duration-100',
                  isHourMark ? 'border-b border-gray-200/80' : 'border-b border-gray-100/50',
                  blocked
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer hover:bg-primary-50/25',
                )}
                onClick={() => !blocked && onSlotClick(dateStr, time)}
              />
            );
          })}

          {/* Appointment cards */}
          {layoutSlots.map(({ appointment: apt, column, totalColumns }) => {
            const { topPercent, heightPercent } = getAppointmentPosition(apt.starts_at, apt.ends_at);
            const totalHeight = SLOT_HEIGHT * TOTAL_SLOTS;
            const top = (topPercent / 100) * totalHeight;
            const height = Math.max((heightPercent / 100) * totalHeight, 24);
            const colorIdx = practitionerIndex[apt.practitioner_id] ?? 0;

            const PAD = 2;
            const widthPercent = 100 / totalColumns;
            const leftPercent = column * widthPercent;

            return (
              <div
                key={apt.id}
                className="absolute z-10"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `calc(${leftPercent}% + ${PAD}px)`,
                  width: `calc(${widthPercent}% - ${PAD * 2}px)`,
                }}
              >
                <AppointmentCard
                  appointment={apt}
                  colorClasses={getPractitionerColor(colorIdx)}
                  onClick={onAppointmentClick}
                  style={{ height: '100%' }}
                  heightPx={height}
                />
              </div>
            );
          })}

          {/* Now-line */}
          {isToday && !blocked && <NowIndicator />}
        </div>
      </div>
    </DndContext>
  );
}
