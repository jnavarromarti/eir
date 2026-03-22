import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  variant?: 'default' | 'card';
  required?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  label,
  hint,
  error,
  options,
  value,
  onChange,
  orientation = 'vertical',
  variant = 'default',
  required,
  className,
}: RadioGroupProps) {
  return (
    <fieldset className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <legend className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-500 leading-none mb-0.5">
          {label}
          {required && (
            <span className="ml-0.5 text-primary-400" aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}

      <div
        className={cn(
          variant === 'default' && orientation === 'horizontal'
            ? 'flex flex-wrap gap-x-5 gap-y-2'
            : variant === 'default'
              ? 'flex flex-col gap-2'
              : orientation === 'horizontal'
                ? 'flex flex-wrap gap-3'
                : 'flex flex-col gap-2',
        )}
        role="radiogroup"
      >
        {options.map((opt) => {
          const optId = `${name}-${opt.value}`;
          const isChecked = value === opt.value;

          if (variant === 'card') {
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={cn(
                  'relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150',
                  isChecked
                    ? 'border-primary-300 bg-primary-50/60 shadow-sm shadow-primary-100/80'
                    : 'border-border bg-white hover:border-gray-300 hover:bg-surface-raised',
                  opt.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <input
                  type="radio"
                  id={optId}
                  name={name}
                  value={opt.value}
                  checked={isChecked}
                  disabled={opt.disabled}
                  onChange={() => onChange?.(opt.value)}
                  className="sr-only peer"
                />
                {/* Radio ring visual */}
                <div
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150',
                    isChecked ? 'border-primary-400' : 'border-gray-300',
                  )}
                >
                  {isChecked && (
                    <div className="h-2 w-2 animate-check-in rounded-full bg-primary-400" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {opt.icon && (
                      <span
                        className={cn(
                          'shrink-0 transition-colors',
                          isChecked ? 'text-primary-500' : 'text-gray-400',
                        )}
                      >
                        {opt.icon}
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isChecked ? 'text-primary-900' : 'text-gray-900',
                      )}
                    >
                      {opt.label}
                    </span>
                  </div>
                  {opt.description && (
                    <span className="text-xs leading-snug text-gray-500">
                      {opt.description}
                    </span>
                  )}
                </div>
              </label>
            );
          }

          // ── default variant ──────────────────────────────────────────────
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={cn(
                'flex cursor-pointer items-start gap-2.5',
                opt.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="radio"
                id={optId}
                name={name}
                value={opt.value}
                checked={isChecked}
                disabled={opt.disabled}
                onChange={() => onChange?.(opt.value)}
                className="sr-only peer"
              />
              {/* Custom radio circle — sibling (peer) so peer-* works */}
              <div
                className={cn(
                  'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150',
                  isChecked
                    ? 'border-primary-400'
                    : 'border-gray-300 hover:border-primary-300',
                )}
              >
                {isChecked && (
                  <div className="h-2 w-2 animate-check-in rounded-full bg-primary-400" />
                )}
              </div>
              {/* Text */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-xs leading-snug text-gray-500">
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {hint && !error && (
        <p className="mt-0.5 text-[11px] leading-snug text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="flex animate-slide-down items-center gap-1 text-[11px] font-medium text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </fieldset>
  );
}
