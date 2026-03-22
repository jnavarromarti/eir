/* ─── Enums (mirror de los PHP) ─── */

export enum UserRole {
  ADMIN = 'ADMIN',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  CHIROPODIST = 'CHIROPODIST',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  SPEECH_THERAPIST = 'SPEECH_THERAPIST',
  DENTIST = 'DENTIST',
  RADIOLOGY_TECHNICIAN = 'RADIOLOGY_TECHNICIAN',
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.ADMINISTRATIVE]: 'Administrativo/a',
  [UserRole.CHIROPODIST]: 'Podólogo/a',
  [UserRole.PHYSIOTHERAPIST]: 'Fisioterapeuta',
  [UserRole.SPEECH_THERAPIST]: 'Logopeda',
  [UserRole.DENTIST]: 'Dentista',
  [UserRole.RADIOLOGY_TECHNICIAN]: 'Técnico de radiología',
};

export const USER_ROLE_LABELS = UserRoleLabel;

export const ACTIVE_PHASE_ONE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.ADMINISTRATIVE,
  UserRole.CHIROPODIST,
  UserRole.RADIOLOGY_TECHNICIAN,
];

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export const AppointmentStatusLabel: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Programada',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.IN_PROGRESS]: 'En curso',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
  [AppointmentStatus.NO_SHOW]: 'No presentado',
};

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export const InvoiceStatusLabel: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Borrador',
  [InvoiceStatus.ISSUED]: 'Emitida',
  [InvoiceStatus.PAID]: 'Pagada',
  [InvoiceStatus.CANCELLED]: 'Anulada',
};
