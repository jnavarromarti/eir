import { InvoiceStatus } from './enums';

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  service_id: string | null;
  appointment_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  service?: { id: string; name: string };
}

export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  issued_by: string;
  status: InvoiceStatus;
  subtotal: number;
  total: number;
  notes: string | null;
  reference_clinic: string | null;
  issued_at: string | null;
  paid_at: string | null;
  created_at: string;
  patient?: { id: string; first_name: string; last_name: string };
  issuer?: { id: string; name: string };
  lines?: InvoiceLine[];
}

export interface CreateInvoiceLinePayload {
  service_id?: string;
  appointment_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface CreateInvoicePayload {
  patient_id: string;
  notes?: string;
  reference_clinic?: string;
  lines: CreateInvoiceLinePayload[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
