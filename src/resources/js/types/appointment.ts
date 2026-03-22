import { AppointmentStatus } from './enums';

export interface Appointment {
  id: string;
  patient_id: string;
  practitioner_id: string;
  service_id: string | null;
  specialty_id: string;
  status: AppointmentStatus;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient?: { id: string; first_name: string; last_name: string; phone?: string | null };
  practitioner?: { id: string; name: string };
  service?: { id: string; name: string };
  specialty?: { id: string; name: string };
}

export interface CreateAppointmentPayload {
  patient_id: string;
  practitioner_id: string;
  service_id?: string;
  specialty_id: string;
  starts_at: string;
  ends_at: string;
  notes?: string;
}

export interface UpdateAppointmentPayload extends Partial<CreateAppointmentPayload> {
  status?: AppointmentStatus;
}
