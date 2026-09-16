// ─── HTTP Client ──────────────────────────────────────────────────────────────

import type { ApiError } from '@/types/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(url: string, params?: RequestOptions['params']): string {
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options;

  const response = await fetch(buildUrl(url, params), {
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let errorBody: Partial<ApiError> = { status: response.status };
    try {
      errorBody = await response.json();
    } catch {
      errorBody.message = response.statusText;
    }
    const error: ApiError = {
      message: errorBody.message ?? 'Error desconocido',
      status: response.status,
      code: errorBody.code,
      details: errorBody.details,
    };
    throw error;
  }

  return response.json() as Promise<T>;
}

export const http = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: 'GET', ...options }),

  post: <T>(url: string, body: unknown, options?: RequestOptions) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(url: string, body: unknown, options?: RequestOptions) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body), ...options }),

  patch: <T>(url: string, body: unknown, options?: RequestOptions) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: 'DELETE', ...options }),
};
