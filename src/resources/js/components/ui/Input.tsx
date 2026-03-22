import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FormField, type FormFieldProps } from './FormField';

const inputBase =
  'flex w-full rounded-xl border bg-white text-sm text-gray-900 ' +
  'placeholder:text-gray-400/60 transition-all duration-200 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-gray-400 ' +
  'read-only:bg-surface-raised read-only:text-gray-600';

const inputStates = {
  default:
    'border-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ' +
    'hover:border-gray-300 ' +
    'focus:border-primary-400 focus:ring-2 focus:ring-primary-300/25',
  error:
    'border-red-300 bg-red-50/20 ' +
    'focus:border-red-400 focus:ring-2 focus:ring-red-300/25',
  success:
    'border-emerald-300 ' +
    'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/25',
};

const inputSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3.5',
  lg: 'h-11 px-4 text-[15px]',
};

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<FormFieldProps, 'children' | 'htmlFor'> {
  size?: 'sm' | 'md' | 'lg';
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      success,
      required,
      optional,
      id,
      size = 'md',
      prefixIcon,
      suffixIcon,
      ...props
    },
    ref,
  ) => {
    const state = error ? 'error' : success ? 'success' : 'default';
    const iconOffset = size === 'sm' ? 'left-2.5' : 'left-3';
    const iconOffsetRight = size === 'sm' ? 'right-2.5' : 'right-3';
    const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    return (
      <FormField
        label={label}
        hint={hint}
        error={error}
        success={success}
        required={required}
        optional={optional}
        htmlFor={id}
        className={className}
      >
        <div className="relative">
          {prefixIcon && (
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400',
                iconOffset,
              )}
            >
              <span className={iconClass}>{prefixIcon}</span>
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              inputBase,
              inputStates[state],
              inputSizes[size],
              prefixIcon && (size === 'sm' ? 'pl-8' : 'pl-9'),
              suffixIcon && (size === 'sm' ? 'pr-8' : 'pr-9'),
            )}
            {...props}
          />
          {suffixIcon && (
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400',
                iconOffsetRight,
              )}
            >
              <span className={iconClass}>{suffixIcon}</span>
            </span>
          )}
        </div>
      </FormField>
    );
  },
);
Input.displayName = 'Input';

export { Input };
