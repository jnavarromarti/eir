import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointment';
import { getPractitionerColor } from '../config';
import { AppointmentStatusLabel } from '@/types/enums';
import { isBlockedDay, isPastDay, getHolidayName } from '../holidays';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function MonthView({ currentDate, appointments, onDayClick, onAppointmentClick }: MonthViewProps) {
  const today = new Date();

  const practitionerIndex = useMemo(() => {
    const ids = [...new Set(appointments.map((a) => a.practitioner_id))];
    const map: Record<string, number> = {};
    ids.forEach((id, i) => (map[id] = i));
    return map;
  }, [appointments]);

  // Generar la cuadrícula del mes
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const result: Date[][] = [];
    let day = start;
    while (day <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      result.push(week);
    }
    return result;
  }, [currentDate]);

  return (
    <div>
      {/* Header días */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* Semanas */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-b-0">
          {week.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);
            const blocked = isBlockedDay(day);
            const past = isPastDay(day);
            const holidayName = getHolidayName(dateStr);
            const isHolidayOrWeekend = blocked && !past;
            const dayAppts = appointments.filter((a) => isSameDay(new Date(a.starts_at), day));

            return (
              <div
                key={dateStr}
                className={cn(
                  'min-h-24 cursor-pointer border-r border-gray-50 p-1 last:border-r-0 hover:bg-gray-50',
                  !isCurrentMonth && 'bg-gray-50/50',
                  past && isCurrentMonth && 'bg-gray-100/40',
                  isHolidayOrWeekend && isCurrentMonth && 'bg-red-50/40',
                )}
                onClick={() => onDayClick(day)}
              >
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    isToday
                      ? 'bg-primary-400 font-semibold text-white'
                      : isCurrentMonth
                        ? past ? 'text-gray-400' : isHolidayOrWeekend ? 'font-medium text-red-400' : 'text-gray-900'
                        : 'text-gray-400',
                  )}
                >
                  {format(day, 'd')}
                </span>
                {holidayName && isCurrentMonth && (
                  <div className="truncate text-[9px] text-red-400" title={holidayName}>{holidayName}</div>
                )}

                <div className="mt-0.5 space-y-0.5">
                  {dayAppts.slice(0, 3).map((apt) => {
                    const colorIdx = practitionerIndex[apt.practitioner_id] ?? 0;
                    const color = getPractitionerColor(colorIdx);
                    const patientName = apt.patient
                      ? `${apt.patient.first_name} ${apt.patient.last_name}`
                      : 'Paciente';

                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                        className={cn(
                          'truncate rounded px-1 py-0.5 text-[10px] font-medium',
                          color.bg,
                          color.text,
                        )}
                        title={`${format(new Date(apt.starts_at), 'HH:mm')} ${patientName} — ${AppointmentStatusLabel[apt.status]}`}
                      >
                        {format(new Date(apt.starts_at), 'HH:mm')} {patientName.split(' ')[0]}
                      </div>
                    );
                  })}
                  {dayAppts.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{dayAppts.length - 3} más</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
