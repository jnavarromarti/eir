import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Show a numbered circle instead of an icon — useful for wizard-style forms */
  step?: number;
  /** Slot for secondary actions (e.g. an "Add row" button) */
  action?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon,
  step,
  action,
  required,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* ── Section header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Step indicator */}
          {step !== undefined && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 text-[10px] font-bold text-white shadow-sm shadow-primary-300/30">
              {step}
            </div>
          )}

          {/* Icon (shown only if no step number) */}
          {icon && step === undefined && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
              {icon}
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.10em] text-gray-700 leading-none">
              {title}
              {required && (
                <span className="ml-1 text-primary-400" aria-hidden="true">
                  *
                </span>
              )}
            </h3>
            {description && (
              <p className="text-xs text-gray-400 leading-snug mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-border-subtle" />

      {/* ── Content ── */}
      {children}
    </div>
  );
}
