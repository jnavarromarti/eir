import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
        primary: 'bg-primary-50 text-primary-600 ring-1 ring-primary-200',
        success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
