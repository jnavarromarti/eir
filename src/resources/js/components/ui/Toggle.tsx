import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = 'md', id, disabled, ...props }, ref) => {
    // Track dimensions — must be explicit strings for Tailwind to detect
    const trackClass = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
    // Knob — translate distance equals: track-width - knob-width - 2×offset
    // sm: 36 - 16 - 4 = 16px → translate-x-4
    // md: 44 - 20 - 4 = 20px → translate-x-5
    const knobClass =
      size === 'sm'
        ? 'h-4 w-4 peer-checked:translate-x-4'
        : 'h-5 w-5 peer-checked:translate-x-5';

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex cursor-pointer items-start gap-3',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        {/* Toggle track + knob */}
        <div className="relative mt-0.5 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div
            className={cn(
              'rounded-full bg-gray-200 transition-colors duration-200',
              'peer-checked:bg-primary-400',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-300/50 peer-focus-visible:ring-offset-1',
              trackClass,
            )}
          />
          {/* Knob */}
          <div
            className={cn(
              'pointer-events-none absolute left-0.5 top-0.5 rounded-full bg-white shadow-sm transition-transform duration-200',
              knobClass,
            )}
          />
        </div>

        {/* Label + description */}
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span className="text-sm font-medium leading-5 text-gray-900">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs leading-snug text-gray-500">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  },
);
Toggle.displayName = 'Toggle';

export { Toggle };
