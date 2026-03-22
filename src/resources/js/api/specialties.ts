import client from './client';
import type { Specialty } from '@/types/service';

export const specialtiesApi = {
  list() {
    return client.get<Specialty[]>('/specialties');
  },
};
