import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCard {
  label: string;
  value: string | number;
}

interface PageShellProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description?: string;
  metrics?: MetricCard[];
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ icon: Icon, eyebrow, title, description, metrics, actions, children }: PageShellProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">{title}</h1>
            {description && <p className="max-w-2xl text-sm leading-relaxed text-gray-500">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {metrics && metrics.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{m.label}</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
