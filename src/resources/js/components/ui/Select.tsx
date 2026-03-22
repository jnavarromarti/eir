import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, type FormFieldProps } from './FormField';

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    Omit<FormFieldProps, 'children' | 'htmlFor'> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
      options,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const state = error ? 'error' : success ? 'success' : 'default';

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
          <select
            ref={ref}
            id={id}
            className={cn(
              // base
              'flex h-10 w-full appearance-none rounded-xl border bg-white pr-9 pl-3.5',
              'text-sm text-gray-900 transition-all duration-200 focus:outline-none',
              'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-gray-400',
              // states
              state === 'default' &&
                'border-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] hover:border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-300/25',
              state === 'error' &&
                'border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-2 focus:ring-red-300/25',
              state === 'success' &&
                'border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/25',
              // empty/placeholder value text color
              !props.value && !props.defaultValue && 'text-gray-400/80',
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-gray-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn(
              'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
              state === 'error' ? 'text-red-400' : 'text-gray-400',
            )}
          />
        </div>
      </FormField>
    );
  },
);
Select.displayName = 'Select';

export { Select };
