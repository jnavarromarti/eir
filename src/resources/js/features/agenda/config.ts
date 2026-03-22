/** Configuración de la agenda */

export const AGENDA_START_HOUR = 8;
export const AGENDA_END_HOUR = 21;
export const SLOT_DURATION_MINUTES = 30;

/** Horas completas que muestra la agenda: 8, 9, 10, ..., 20 */
export const HOURS = Array.from(
  { length: AGENDA_END_HOUR - AGENDA_START_HOUR },
  (_, i) => AGENDA_START_HOUR + i,
);

/** Todos los slots de 30 min en formato "HH:mm" */
export const TIME_SLOTS: string[] = [];
for (let h = AGENDA_START_HOUR; h < AGENDA_END_HOUR; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

/** Colores asignados a los profesionales (se ciclan si hay más de 7) */
export const PRACTITIONER_COLORS = [
  { bg: 'bg-practitioner-1/15', border: 'border-practitioner-1', text: 'text-practitioner-1', solid: '#D451B1' },
  { bg: 'bg-practitioner-2/15', border: 'border-practitioner-2', text: 'text-practitioner-2', solid: '#3B82F6' },
  { bg: 'bg-practitioner-3/15', border: 'border-practitioner-3', text: 'text-practitioner-3', solid: '#10B981' },
  { bg: 'bg-practitioner-4/15', border: 'border-practitioner-4', text: 'text-practitioner-4', solid: '#F59E0B' },
  { bg: 'bg-practitioner-5/15', border: 'border-practitioner-5', text: 'text-practitioner-5', solid: '#8B5CF6' },
  { bg: 'bg-practitioner-6/15', border: 'border-practitioner-6', text: 'text-practitioner-6', solid: '#EF4444' },
  { bg: 'bg-practitioner-7/15', border: 'border-practitioner-7', text: 'text-practitioner-7', solid: '#06B6D4' },
];

export function getPractitionerColor(index: number) {
  return PRACTITIONER_COLORS[index % PRACTITIONER_COLORS.length];
}

/** Calcula la posición top y height de una cita en la cuadrícula */
export function getAppointmentPosition(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const agendaStartMinutes = AGENDA_START_HOUR * 60;
  const totalMinutes = (AGENDA_END_HOUR - AGENDA_START_HOUR) * 60;

  const topPercent = ((startMinutes - agendaStartMinutes) / totalMinutes) * 100;
  const heightPercent = ((endMinutes - startMinutes) / totalMinutes) * 100;

  return { topPercent, heightPercent };
}
