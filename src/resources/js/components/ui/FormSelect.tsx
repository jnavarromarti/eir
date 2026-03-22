import { type ReactNode } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, type FormFieldProps } from './FormField';

// ─── Option types ────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

// ─── Trigger size variants ────────────────────────────────────────────────────

const triggerSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3.5 text-sm',
  lg: 'h-11 px-4 text-[15px]',
};

const triggerStates = {
  default:
    'border-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ' +
    'hover:border-gray-300 ' +
    'focus:border-primary-400 focus:ring-2 focus:ring-primary-300/25',
  error:
    'border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-2 focus:ring-red-300/25',
  success:
    'border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/25',
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FormSelectProps extends Omit<FormFieldProps, 'children' | 'htmlFor'> {
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionItem({ opt }: { opt: SelectOption }) {
  return (
    <RadixSelect.Item
      value={opt.value}
      disabled={opt.disabled}
      className={cn(
        'group relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none transition-colors',
        'data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-900',
        'data-[state=checked]:font-medium data-[state=checked]:text-primary-700',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
      )}
    >
      {opt.icon && (
        <span className="text-gray-400 group-data-[highlighted]:text-primary-500 shrink-0">
          {opt.icon}
        </span>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
        {opt.description && (
          <span className="text-[11px] text-gray-400 truncate">{opt.description}</span>
        )}
      </div>
      <RadixSelect.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-primary-500 shrink-0" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormSelect({
  label,
  hint,
  error,
  success,
  required,
  optional,
  id,
  value,
  onValueChange,
  options = [],
  groups = [],
  placeholder = 'Seleccionar…',
  disabled,
  clearable,
  size = 'md',
  name,
  className,
}: FormSelectProps) {
  const fieldState = error ? 'error' : success ? 'success' : 'default';
  const hasValue = value !== undefined && value !== '';

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
      <RadixSelect.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <div className="relative">
          <RadixSelect.Trigger
            id={id}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-xl border bg-white transition-all duration-200',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-gray-400',
              'data-[placeholder]:text-gray-400/70',
              triggerStates[fieldState],
              triggerSizes[size],
              clearable && hasValue ? 'pr-16' : 'pr-9',
            )}
          >
            <RadixSelect.Value placeholder={placeholder} />
            {/* Chevron – always visible */}
            <RadixSelect.Icon asChild>
              <ChevronDown
                className={cn(
                  'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform duration-200 shrink-0',
                  'group-data-[state=open]:rotate-180',
                  fieldState === 'error' ? 'text-red-400' : 'text-gray-400',
                )}
              />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>

          {/* Clear button – outside trigger so it doesn't open dropdown */}
          {clearable && hasValue && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onValueChange?.('');
              }}
              className="absolute right-8 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Limpiar selección"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
              'rounded-xl border border-border bg-white shadow-lg shadow-gray-200/60',
              'animate-scale-in',
            )}
          >
            <RadixSelect.ScrollUpButton className="flex h-7 items-center justify-center bg-white text-gray-400">
              <ChevronUp className="h-3.5 w-3.5" />
            </RadixSelect.ScrollUpButton>

            <RadixSelect.Viewport className="p-1.5 max-h-64">
              {/* Flat options */}
              {options.map((opt) => (
                <OptionItem key={opt.value} opt={opt} />
              ))}

              {/* Grouped options */}
              {groups.map((group) => (
                <RadixSelect.Group key={group.label}>
                  <RadixSelect.Label className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    {group.label}
                  </RadixSelect.Label>
                  {group.options.map((opt) => (
                    <OptionItem key={opt.value} opt={opt} />
                  ))}
                </RadixSelect.Group>
              ))}
            </RadixSelect.Viewport>

            <RadixSelect.ScrollDownButton className="flex h-7 items-center justify-center bg-white text-gray-400">
              <ChevronDown className="h-3.5 w-3.5" />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </FormField>
  );
}
