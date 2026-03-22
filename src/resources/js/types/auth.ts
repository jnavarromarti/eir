import { UserRole } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty_id: string | null;
  is_active: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TwoFactorPayload {
  code: string;
  temp_token: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TwoFactorRequiredResponse {
  two_factor_required: true;
  temp_token: string;
}

export interface Enable2FAResponse {
  secret: string;
  qr_url: string;
}
