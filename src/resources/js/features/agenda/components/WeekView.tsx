import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
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

  // Build overlap groups using a sweep-line approach
  const groups: typeof items[] = [];
  let currentGroup = [items[0]];
  let groupEnd = items[0].end;

  for (let i = 1; i < items.length; i++) {
    if (items[i].start < groupEnd) {
      // Overlaps with current group
      currentGroup.push(items[i]);
      groupEnd = Math.max(groupEnd, items[i].end);
    } else {
      groups.push(currentGroup);
      currentGroup = [items[i]];
      groupEnd = items[i].end;
    }
  }
  groups.push(currentGroup);

  // Assign columns within each group using greedy column packing
  const result: LayoutSlot[] = [];

  for (const group of groups) {
    const columns: number[][] = []; // columns[col] = list of end-times

    for (const item of group) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        // Check if this column is free (last appointment in column ended)
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

    // Set totalColumns for all items in this group
    const totalCols = columns.length;
    for (const slot of result) {
      if (group.some((g) => g.appointment.id === slot.appointment.id) && slot.totalColumns === 0) {
        slot.totalColumns = totalCols;
      }
    }
  }

  return result;
}

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSlotClick: (date: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  isLoading: boolean;
}

const SLOT_HEIGHT = 48;
const TOTAL_SLOTS = (AGENDA_END_HOUR - AGENDA_START_HOUR) * 2;

/* ─── Droppable half-hour cell ─── */

function DroppableSlot({
  id,
  blocked,
  past,
  isHourMark,
  onClick,
}: {
  id: string;
  blocked: boolean;
  past?: boolean;
  isHourMark: boolean;
  onClick?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: blocked });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-12 transition-colors duration-100',
        /* Grid rhythm: strong border at full hours, subtle at half-hours */
        isHourMark
          ? 'border-b border-gray-200/80'
          : 'border-b border-gray-100/50',
        /* Background states */
        blocked
          ? past
            ? 'bg-gray-100/40 cursor-not-allowed'
            : 'bg-red-50/20 cursor-not-allowed'
          : 'cursor-pointer hover:bg-primary-50/25',
        /* Drop target highlight */
        isOver && !blocked && 'bg-primary-100/50 ring-1 ring-inset ring-primary-300/40',
      )}
      onClick={() => !blocked && onClick?.()}
    />
  );
}

/* ─── Current-time indicator line ─── */

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

export default function WeekView({ currentDate, appointments, onSlotClick, onAppointmentClick, isLoading }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const practitionerIndex = useMemo(() => {
    const ids = [...new Set(appointments.map((a) => a.practitioner_id))];
    const map: Record<string, number> = {};
    ids.forEach((id, i) => (map[id] = i));
    return map;
  }, [appointments]);

  const today = new Date();

  /* ─── Skeleton ─── */
  if (isLoading) {
    return (
      <div className="flex animate-pulse-soft">
        <div className="w-14 shrink-0 border-r border-gray-100 pt-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex h-24 items-start justify-end pr-2">
              <div className="skeleton h-3 w-8 rounded" />
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-5 gap-px bg-gray-100/60">
          {Array.from({ length: 5 }).map((_, d) => (
            <div key={d} className="bg-white">
              <div className="flex h-16 flex-col items-center justify-center gap-1 border-b border-gray-100">
                <div className="skeleton h-3 w-8 rounded" />
                <div className="skeleton h-6 w-6 rounded-full" />
              </div>
              <div className="space-y-px p-1">
                {Array.from({ length: 4 }).map((_, s) => (
                  <div key={s} className="skeleton h-12 rounded-lg" style={{ marginTop: `${s * 56 + Math.random() * 40}px` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* ─── Time gutter ─── */}
      <div className="w-14 shrink-0 border-r border-gray-200/60">
        {/* Header spacer */}
        <div className="h-16" />
        {TIME_SLOTS.map((time) => (
          <div
            key={time}
            className={cn(
              'flex h-12 items-start justify-end pr-2 pt-0.5',
              time.endsWith(':00') ? 'text-[11px] font-medium text-gray-400' : 'text-[10px] text-transparent',
            )}
          >
            {time.endsWith(':00') ? time : ''}
          </div>
        ))}
      </div>

      {/* ─── Day columns ─── */}
      <div className="grid flex-1 grid-cols-5">
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, today);
          const past = isPastDay(day);
          const blocked = isBlockedDay(day);
          const holidayName = getHolidayName(dateStr);
          const isHolidayOrWeekend = blocked && !past;
          const dayAppointments = appointments.filter((a) => isSameDay(new Date(a.starts_at), day));

          return (
            <div
              key={dateStr}
              className={cn(
                'border-r border-gray-100/70 last:border-r-0',
                isToday && 'bg-primary-50/10',
              )}
            >
              {/* ─── Day header ─── */}
              <div
                className={cn(
                  'sticky top-0 z-20 flex h-16 flex-col items-center justify-center gap-0.5 border-b bg-white/95 backdrop-blur-sm',
                  isToday && !blocked && 'border-primary-200/60 bg-primary-50/60',
                  past && 'bg-gray-50/90',
                  isHolidayOrWeekend && 'bg-red-50/40',
                )}
              >
                <span
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-wider',
                    isToday ? 'text-primary-500' : past ? 'text-gray-400' : isHolidayOrWeekend ? 'text-red-400' : 'text-gray-400',
                  )}
                >
                  {format(day, 'EEE', { locale: es })}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-colors',
                      isToday
                        ? 'bg-primary-400 text-white shadow-sm shadow-primary-400/30'
                        : past
                          ? 'text-gray-400'
                          : isHolidayOrWeekend
                            ? 'text-red-400'
                            : 'text-gray-900',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayAppointments.length > 0 && !blocked && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-100 px-1 text-[9px] font-semibold text-gray-500">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                {holidayName && (
                  <span className="max-w-full truncate px-1 text-[9px] font-medium text-red-400" title={holidayName}>
                    {holidayName}
                  </span>
                )}
              </div>

              {/* ─── Time slots + cards ─── */}
              <div className="relative">
                {TIME_SLOTS.map((time) => (
                  <DroppableSlot
                    key={time}
                    id={`${dateStr}|${time}`}
                    blocked={blocked}
                    past={past}
                    isHourMark={time.endsWith(':30')}
                    onClick={() => onSlotClick(dateStr, time)}
                  />
                ))}

                {/* Appointment cards with overlap columns */}
                {(() => {
                  const layoutSlots = computeOverlapColumns(dayAppointments);
                  const totalHeight = SLOT_HEIGHT * TOTAL_SLOTS;
                  const PAD = 1; // px padding between columns

                  return layoutSlots.map(({ appointment: apt, column, totalColumns }) => {
                    const { topPercent, heightPercent } = getAppointmentPosition(apt.starts_at, apt.ends_at);
                    const top = (topPercent / 100) * totalHeight;
                    const height = Math.max((heightPercent / 100) * totalHeight, 22);
                    const colorIdx = practitionerIndex[apt.practitioner_id] ?? 0;

                    // Column-based horizontal positioning
                    const colWidthPercent = 100 / totalColumns;
                    const leftPercent = column * colWidthPercent;

                    return (
                      <div
                        key={apt.id}
                        className="absolute z-10"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(${leftPercent}% + ${PAD}px)`,
                          width: `calc(${colWidthPercent}% - ${PAD * 2}px)`,
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
                  });
                })()}

                {/* Now-line */}
                {isToday && !blocked && <NowIndicator />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
