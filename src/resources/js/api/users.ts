import client from './client';
import type { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';

export const usersApi = {
  list() {
    return client.get<User[]>('/users');
  },

  get(id: string) {
    return client.get<User>(`/users/${id}`);
  },

  create(payload: CreateUserPayload) {
    return client.post<User>('/users', payload);
  },

  update(id: string, payload: UpdateUserPayload) {
    return client.put<User>(`/users/${id}`, payload);
  },

  deactivate(id: string) {
    return client.delete(`/users/${id}`);
  },
};
