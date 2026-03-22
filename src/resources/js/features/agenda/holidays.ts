/**
 * Festivos de la Comunidad Valenciana.
 * Incluye nacionales + autonómicos + locales de Valencia capital.
 * Se actualiza por año.
 */

interface HolidayEntry {
  date: string; // MM-DD
  name: string;
}

/** Festivos fijos (mismo día cada año) */
const FIXED_HOLIDAYS: HolidayEntry[] = [
  { date: '01-01', name: 'Año Nuevo' },
  { date: '01-06', name: 'Reyes Magos' },
  { date: '03-19', name: 'San José / Fallas' },
  { date: '05-01', name: 'Día del Trabajo' },
  { date: '08-15', name: 'Asunción de la Virgen' },
  { date: '10-09', name: '9 d\'Octubre — Día de la Comunitat Valenciana' },
  { date: '10-12', name: 'Fiesta Nacional de España' },
  { date: '11-01', name: 'Todos los Santos' },
  { date: '12-06', name: 'Día de la Constitución' },
  { date: '12-08', name: 'Inmaculada Concepción' },
  { date: '12-25', name: 'Navidad' },
];

/**
 * Calcula la fecha de Pascua (Domingo de Resurrección)
 * usando el algoritmo de Meeus/Jones/Butcher.
 */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Festivos móviles que dependen de Pascua */
function getMovableHolidays(year: number): { date: Date; name: string }[] {
  const easter = getEasterSunday(year);
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  return [
    { date: addDays(easter, -2), name: 'Viernes Santo' },
    { date: addDays(easter, 1), name: 'Lunes de Pascua' },
  ];
}

/** Genera el Set de fechas festivas para un año en formato YYYY-MM-DD */
function buildHolidaySet(year: number): Map<string, string> {
  const map = new Map<string, string>();

  for (const h of FIXED_HOLIDAYS) {
    map.set(`${year}-${h.date}`, h.name);
  }

  for (const h of getMovableHolidays(year)) {
    const key = `${h.date.getFullYear()}-${String(h.date.getMonth() + 1).padStart(2, '0')}-${String(h.date.getDate()).padStart(2, '0')}`;
    map.set(key, h.name);
  }

  return map;
}

// Cache por año
const cache = new Map<number, Map<string, string>>();

function getHolidaysForYear(year: number): Map<string, string> {
  if (!cache.has(year)) {
    cache.set(year, buildHolidaySet(year));
  }
  return cache.get(year)!;
}

/** Comprueba si una fecha (YYYY-MM-DD) es festivo */
export function isHoliday(dateStr: string): boolean {
  const year = parseInt(dateStr.slice(0, 4), 10);
  return getHolidaysForYear(year).has(dateStr);
}

/** Devuelve el nombre del festivo o undefined */
export function getHolidayName(dateStr: string): string | undefined {
  const year = parseInt(dateStr.slice(0, 4), 10);
  return getHolidaysForYear(year).get(dateStr);
}

/** Comprueba si es sábado (6) o domingo (0) */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Comprueba si la fecha es anterior al día de hoy (sin tener en cuenta la hora) */
export function isPastDay(date: Date): boolean {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return target < todayStart;
}

/** Comprueba si un día está bloqueado (fin de semana, festivo o pasado) */
export function isBlockedDay(date: Date): boolean {
  if (isPastDay(date)) return true;
  if (isWeekend(date)) return true;
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return isHoliday(dateStr);
}
