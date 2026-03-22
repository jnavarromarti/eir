import client from './client';
import type { LoginCredentials, TwoFactorPayload, AuthResponse, TwoFactorRequiredResponse, Enable2FAResponse } from '@/types/auth';
import type { User } from '@/types/user';

export const authApi = {
  login(credentials: LoginCredentials) {
    return client.post<AuthResponse | TwoFactorRequiredResponse>('/auth/login', credentials);
  },

  verify2FA(payload: TwoFactorPayload) {
    return client.post<AuthResponse>('/auth/2fa/verify', payload);
  },

  enable2FA() {
    return client.post<Enable2FAResponse>('/auth/2fa/enable');
  },

  me() {
    return client.get<User>('/auth/me');
  },

  logout() {
    return client.post('/auth/logout');
  },
};
