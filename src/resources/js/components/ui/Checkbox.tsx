import { forwardRef, useId } from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check, Minus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends RadixCheckbox.CheckboxProps {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

const Checkbox = forwardRef<
  React.ElementRef<typeof RadixCheckbox.Root>,
  CheckboxProps
>(({ label, description, error, className, id: idProp, checked, ...props }, ref) => {
  const uid = useId();
  const id = idProp ?? uid;

  return (
    <div className={cn('flex gap-2.5', className)}>
      <RadixCheckbox.Root
        ref={ref}
        id={id}
        checked={checked}
        className={cn(
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all duration-150',
          'hover:border-gray-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/50 focus-visible:ring-offset-1',
          'data-[state=checked]:border-primary-400 data-[state=checked]:bg-primary-400',
          'data-[state=indeterminate]:border-gray-400 data-[state=indeterminate]:bg-gray-400',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-400',
        )}
        {...props}
      >
        <RadixCheckbox.Indicator className="flex animate-check-in items-center justify-center text-white">
          {checked === 'indeterminate' ? (
            <Minus className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          )}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      {(label || description || error) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={id}
              className="cursor-pointer text-sm font-medium leading-5 text-gray-900"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs leading-snug text-gray-500">{description}</p>
          )}
          {error && (
            <p className="flex animate-slide-down items-center gap-1 text-[11px] font-medium text-red-500">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
