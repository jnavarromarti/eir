import type { ViewMode } from '@/features/agenda/pages/AgendaPage';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PractitionerOption {
  id: string;
  name: string;
  colorSolid: string;
}

interface CalendarToolbarProps {
  title: string;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  selectedPractitioner: string | null;
  onPractitionerChange: (id: string | null) => void;
  practitioners?: PractitionerOption[];
}

const VIEW_LABELS: { value: ViewMode; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

export default function CalendarToolbar({
  title,
  viewMode,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  selectedPractitioner,
  onPractitionerChange,
  practitioners = [],
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onToday}>
          Hoy
        </Button>
        <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext} aria-label="Siguiente">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="ml-2 text-lg font-bold capitalize text-gray-900">{title}</h2>
      </div>

      {/* Center: practitioner filter */}
      {practitioners.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onPractitionerChange(null)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-150',
              !selectedPractitioner
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            )}
          >
            Todos
          </button>
          {practitioners.map((p) => (
            <button
              key={p.id}
              onClick={() => onPractitionerChange(selectedPractitioner === p.id ? null : p.id)}
              className={cn(
                'group flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-150',
                selectedPractitioner === p.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              )}
            >
              <span
                className="inline-block h-2 w-2 rounded-full ring-1 ring-white/50"
                style={{ backgroundColor: p.colorSolid }}
              />
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Right: view switcher */}
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-xl border border-border bg-surface-sunken p-1">
          {VIEW_LABELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                viewMode === value
                  ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
