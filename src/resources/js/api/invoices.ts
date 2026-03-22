import client from './client';
import type { Invoice, CreateInvoicePayload, PaginatedResponse } from '@/types/invoice';

export const invoicesApi = {
  list(params?: { patient_id?: string; status?: string; page?: number; search?: string }) {
    return client.get<PaginatedResponse<Invoice>>('/invoices', { params });
  },

  get(id: string) {
    return client.get<Invoice>(`/invoices/${id}`);
  },

  create(payload: CreateInvoicePayload) {
    return client.post<Invoice>('/invoices', payload);
  },

  issue(id: string) {
    return client.patch<Invoice>(`/invoices/${id}/issue`);
  },

  markPaid(id: string) {
    return client.patch<Invoice>(`/invoices/${id}/pay`);
  },

  cancel(id: string) {
    return client.patch<Invoice>(`/invoices/${id}/cancel`);
  },

  downloadPdf(id: string) {
    return client.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  },
};
