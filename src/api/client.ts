import { API_BASE_URL } from './config';

/** Matches the { success, message, data, meta } envelope from App\Traits\ApiResponse. */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, any>;
  errors?: Record<string, string[]>;
};

export type ApiResult<T> = {
  data: T;
  meta?: Record<string, any>;
  message: string;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** First validation message for a field, if the server returned one. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Lets the auth layer force a sign-out when the server rejects our token. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Skip the automatic sign-out on 401 (used by login itself). */
  allowUnauthorized?: boolean;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;

  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return params.length ? `${url}?${params.join('&')}` : url;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = 'GET', body, query, allowUnauthorized } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch only rejects on network-level failure, which on a phone almost
    // always means the API host is wrong or unreachable — say so plainly
    // rather than surfacing "Network request failed".
    throw new ApiError(
      `Cannot reach the server at ${API_BASE_URL}. Check that the API is running with --host=0.0.0.0 and that this device is on the same network.`,
      0
    );
  }

  if (response.status === 401 && !allowUnauthorized) {
    onUnauthorized?.();
  }

  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.errors
    );
  }

  return { data: payload.data, meta: payload.meta, message: payload.message };
}

/** Multipart upload (photos, avatars) — cannot use the JSON path above. */
export async function upload<T>(
  path: string,
  parts: { name: string; value: string | { uri: string; name: string; type: string } }[]
): Promise<ApiResult<T>> {
  const form = new FormData();

  for (const part of parts) {
    if (typeof part.value === 'string') {
      form.append(part.name, part.value);
    } else {
      // React Native's FormData accepts this shape for files.
      form.append(part.name, part.value as unknown as Blob);
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: form });
  } catch {
    throw new ApiError(`Cannot reach the server at ${API_BASE_URL}.`, 0);
  }

  if (response.status === 401) onUnauthorized?.();

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message ?? `Upload failed (${response.status})`, response.status, payload?.errors);
  }

  return { data: payload.data, meta: payload.meta, message: payload.message };
}
