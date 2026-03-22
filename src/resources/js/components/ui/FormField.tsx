import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  hint,
  error,
  success,
  required,
  optional,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor={htmlFor}
            className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-500 leading-none"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-primary-400" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optional && (
            <span className="rounded-full bg-gray-100 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-gray-400 leading-tight shrink-0">
              Opcional
            </span>
          )}
        </div>
      )}

      {children}

      {hint && !error && !success && (
        <p className="flex items-start gap-1 text-[11px] leading-snug text-gray-400">
          <Info className="mt-px h-3 w-3 shrink-0" />
          {hint}
        </p>
      )}

      {error && (
        <p className="flex animate-slide-down items-start gap-1 text-[11px] font-medium leading-snug text-red-500">
          <AlertCircle className="mt-px h-3 w-3 shrink-0" />
          {error}
        </p>
      )}

      {success && !error && (
        <p className="flex animate-slide-down items-start gap-1 text-[11px] font-medium leading-snug text-emerald-600">
          <CheckCircle2 className="mt-px h-3 w-3 shrink-0" />
          {success}
        </p>
      )}
    </div>
  );
}
