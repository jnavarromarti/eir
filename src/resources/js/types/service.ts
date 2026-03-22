export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  specialty_id: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  specialty?: { id: string; name: string };
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  specialty_id: string;
  price: number;
  duration_minutes: number;
}
