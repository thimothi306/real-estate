'use client';

import type { Role, User } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.errors = errors;
  }
}

async function authFetch<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message ?? 'Something went wrong. Please try again.', payload?.errors);
  }

  return payload.data;
}

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

export function register(payload: RegisterPayload) {
  return authFetch<User>('/auth/register', { method: 'POST', body: payload });
}

export function verifyRegistrationOtp(phone: string, code: string) {
  return authFetch<{ user: User; token: string }>('/auth/otp/verify-registration', {
    method: 'POST',
    body: { phone, code, purpose: 'registration' },
  });
}

export function sendOtp(phone: string, purpose: 'registration' | 'login' | 'password_reset') {
  return authFetch<null>('/auth/otp/send', { method: 'POST', body: { phone, purpose } });
}

export function login(identifier: string, password: string) {
  return authFetch<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: { identifier, password, device_name: 'Kavuri Web' },
  });
}

export function me(token: string) {
  return authFetch<User>('/auth/me', { token });
}

export function logout(token: string) {
  return authFetch<null>('/auth/logout', { method: 'POST', token });
}

export function forgotPassword(phone: string) {
  return authFetch<null>('/auth/password/forgot', { method: 'POST', body: { phone, purpose: 'password_reset' } });
}

export function resetPassword(phone: string, otpCode: string, password: string) {
  return authFetch<null>('/auth/password/reset', {
    method: 'POST',
    body: { phone, otp_code: otpCode, password, password_confirmation: password },
  });
}

/** Generic authenticated GET for the dashboard's client-rendered sub-pages. */
export function authGet<T>(path: string, token: string) {
  return authFetch<T>(path, { token });
}

/** Generic authenticated POST for actions (send message, cancel visit, subscribe, etc). */
export function authPost<T>(path: string, token: string, body?: unknown) {
  return authFetch<T>(path, { method: 'POST', token, body });
}

export function authPut<T>(path: string, token: string, body?: unknown) {
  return authFetch<T>(path, { method: 'PUT', token, body });
}

export function authPatch<T>(path: string, token: string, body?: unknown) {
  return authFetch<T>(path, { method: 'PATCH', token, body });
}

export function authDelete<T>(path: string, token: string) {
  return authFetch<T>(path, { method: 'DELETE', token });
}

/**
 * Multipart upload (document/file) — deliberately doesn't reuse authFetch,
 * since that always sets Content-Type: application/json. Letting fetch set
 * its own multipart boundary header is required for FormData bodies.
 */
export async function authPostForm<T>(path: string, token: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message ?? 'Upload failed. Please try again.', payload?.errors);
  }

  return payload.data;
}
