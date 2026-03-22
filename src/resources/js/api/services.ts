import client from './client';
import type { Service, CreateServicePayload } from '@/types/service';

export const servicesApi = {
  list(params?: { specialty_id?: string }) {
    return client.get<Service[]>('/services', { params });
  },

  get(id: string) {
    return client.get<Service>(`/services/${id}`);
  },

  create(payload: CreateServicePayload) {
    return client.post<Service>('/services', payload);
  },

  update(id: string, payload: CreateServicePayload) {
    return client.put<Service>(`/services/${id}`, payload);
  },

  deactivate(id: string) {
    return client.delete(`/services/${id}`);
  },
};
