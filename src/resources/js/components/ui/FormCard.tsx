import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Accent colour presets ────────────────────────────────────────────────────

const accentBar: Record<string, string> = {
  primary: 'bg-gradient-to-b from-primary-400 to-primary-600',
  secondary: 'bg-gradient-to-b from-secondary-400 to-secondary-600',
  success: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
  warning: 'bg-gradient-to-b from-amber-400 to-amber-600',
  info: 'bg-gradient-to-b from-blue-400 to-blue-600',
};

const iconBg: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-500',
  secondary: 'bg-secondary-50 text-secondary-500',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-blue-50 text-blue-600',
  none: 'bg-gray-50 text-gray-500',
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FormCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  /**
   * Left accent bar colour.
   * Pass `true` for default primary gradient, or a named preset string.
   */
  accent?: boolean | 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  /** Badge/chip slot shown at the end of the header row */
  badge?: ReactNode;
  /** Action button/link slot shown at the end of the header row */
  action?: ReactNode;
  /** Extra class on the outer wrapper */
  className?: string;
  /** Pass to CardContent area */
  contentClassName?: string;
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormCard({
  title,
  description,
  icon,
  accent,
  badge,
  action,
  className,
  contentClassName,
  children,
}: FormCardProps) {
  const accentKey =
    accent === true || accent === undefined
      ? 'primary'
      : accent === false
        ? null
        : accent;

  const hasHeader = Boolean(title || icon || badge || action);
  const paddingLeft = accentKey ? 'pl-7' : 'px-6';

  return (
    <div
      className={cn(
        'animate-fade-in relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm',
        className,
      )}
    >
      {/* ── Left accent bar ── */}
      {accentKey && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-[3px]',
            accentBar[accentKey],
          )}
        />
      )}

      {/* ── Header ── */}
      {hasHeader && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 border-b border-border-subtle py-4 pr-5',
            paddingLeft,
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  accentKey ? iconBg[accentKey] : iconBg.none,
                )}
              >
                {icon}
              </div>
            )}
            {(title || description) && (
              <div className="min-w-0">
                {title && (
                  <h3 className="text-sm font-semibold text-gray-900 leading-5">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-px text-xs text-gray-500 leading-snug">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>

          {(badge || action) && (
            <div className="flex shrink-0 items-center gap-2">
              {badge}
              {action}
            </div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      <div className={cn('py-5 pr-6', paddingLeft, contentClassName)}>
        {children}
      </div>
    </div>
  );
}
