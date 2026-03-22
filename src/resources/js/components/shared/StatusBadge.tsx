import { Badge } from '@/components/ui/Badge';
import { AppointmentStatus, AppointmentStatusLabel, InvoiceStatus, InvoiceStatusLabel } from '@/types/enums';

const APPOINTMENT_VARIANT: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'info',
  [AppointmentStatus.CONFIRMED]: 'violet',
  [AppointmentStatus.IN_PROGRESS]: 'warning',
  [AppointmentStatus.COMPLETED]: 'success',
  [AppointmentStatus.CANCELLED]: 'danger',
  [AppointmentStatus.NO_SHOW]: 'default',
};

const INVOICE_VARIANT: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'default',
  [InvoiceStatus.ISSUED]: 'info',
  [InvoiceStatus.PAID]: 'success',
  [InvoiceStatus.CANCELLED]: 'danger',
};

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet';

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={APPOINTMENT_VARIANT[status] as BadgeVariant}>
      {AppointmentStatusLabel[status]}
    </Badge>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={INVOICE_VARIANT[status] as BadgeVariant}>
      {InvoiceStatusLabel[status]}
    </Badge>
  );
}
