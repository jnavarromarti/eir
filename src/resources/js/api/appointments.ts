import client from './client';
import type { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from '@/types/appointment';

export const appointmentsApi = {
  list(params?: { practitioner_id?: string; from?: string; to?: string; status?: string }) {
    return client.get<Appointment[]>('/appointments', { params });
  },

  get(id: string) {
    return client.get<Appointment>(`/appointments/${id}`);
  },

  create(payload: CreateAppointmentPayload) {
    return client.post<Appointment>('/appointments', payload);
  },

  update(id: string, payload: UpdateAppointmentPayload) {
    return client.put<Appointment>(`/appointments/${id}`, payload);
  },
};
