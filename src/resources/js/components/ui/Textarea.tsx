import {
  forwardRef,
  useState,
  useEffect,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';
import { FormField, type FormFieldProps } from './FormField';

const textareaBase =
  'flex w-full rounded-xl border bg-white text-sm text-gray-900 ' +
  'placeholder:text-gray-400/60 transition-all duration-200 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-gray-400';

const textareaStates = {
  default:
    'border-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ' +
    'hover:border-gray-300 ' +
    'focus:border-primary-400 focus:ring-2 focus:ring-primary-300/25',
  error:
    'border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-2 focus:ring-red-300/25',
  success:
    'border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/25',
};

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<FormFieldProps, 'children' | 'htmlFor'> {
  resize?: 'none' | 'vertical' | 'both';
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      resize = 'vertical',
      showCount,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const state = error ? 'error' : success ? 'success' : 'default';

    const [charCount, setCharCount] = useState(
      typeof value === 'string'
        ? value.length
        : typeof defaultValue === 'string'
          ? defaultValue.length
          : 0,
    );

    useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (typeof value === 'undefined') {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    const resizeClass =
      resize === 'none'
        ? 'resize-none'
        : resize === 'both'
          ? 'resize'
          : 'resize-y';

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
          <textarea
            ref={ref}
            id={id}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={cn(
              textareaBase,
              textareaStates[state],
              resizeClass,
              'px-3.5 py-3 leading-relaxed',
              showCount && maxLength && 'pb-7',
            )}
            {...props}
          />
          {showCount && maxLength && (
            <span className="pointer-events-none absolute bottom-2.5 right-3 text-[10px] tabular-nums text-gray-400">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </FormField>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
