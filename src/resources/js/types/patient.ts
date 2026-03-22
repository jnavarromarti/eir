export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  birth_date: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  medical_notes: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  next_appointment?: { id: string; starts_at: string } | null;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreatePatientPayload {
  first_name: string;
  last_name: string;
  dni: string;
  birth_date: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  medical_notes?: string;
}

export interface UpdatePatientPayload extends Partial<CreatePatientPayload> {
  is_active?: boolean;
}

export interface ClinicalRecord {
  id: string;
  patient_id: string;
  specialty_id: string;
  practitioner_id: string;
  reason: string | null;
  diagnosis: string | null;
  treatment: string | null;
  observations: string | null;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  specialty?: { id: string; name: string };
  practitioner?: { id: string; name: string };
}
