import { request } from './client';
import type { Role, User } from './types';

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: Role;
  city?: string;
  state?: string;
};

export async function register(payload: RegisterPayload) {
  return request<User>('/auth/register', { method: 'POST', body: payload });
}

export async function verifyRegistrationOtp(phone: string, code: string) {
  return request<{ user: User; token: string }>('/auth/otp/verify-registration', {
    method: 'POST',
    body: { phone, code, purpose: 'registration' },
    allowUnauthorized: true,
  });
}

export async function sendOtp(phone: string, purpose: 'registration' | 'login' | 'password_reset') {
  return request<null>('/auth/otp/send', { method: 'POST', body: { phone, purpose } });
}

export async function login(identifier: string, password: string, deviceName?: string) {
  return request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: { identifier, password, device_name: deviceName },
    allowUnauthorized: true,
  });
}

export async function me() {
  return request<User>('/auth/me');
}

export async function logout() {
  return request<null>('/auth/logout', { method: 'POST' });
}

export async function forgotPassword(phone: string) {
  return request<null>('/auth/password/forgot', {
    method: 'POST',
    body: { phone, purpose: 'password_reset' },
  });
}

export async function resetPassword(phone: string, otpCode: string, password: string) {
  return request<null>('/auth/password/reset', {
    method: 'POST',
    body: {
      phone,
      otp_code: otpCode,
      password,
      password_confirmation: password,
    },
  });
}

export async function updateProfile(payload: { name?: string; city?: string; state?: string }) {
  return request<User>('/profile', { method: 'PUT', body: payload });
}

export async function changePassword(currentPassword: string, password: string) {
  return request<null>('/profile/change-password', {
    method: 'POST',
    body: {
      current_password: currentPassword,
      password,
      password_confirmation: password,
    },
  });
}
