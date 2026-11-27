import { Platform } from 'react-native';

import { ApiError } from '@/features/auth/types';

/**
 * Local ChessVanguard V2 API.
 * Android emulator uses 10.0.2.2 (host loopback).
 * iOS simulator / web use localhost.
 * Physical device: set EXPO_PUBLIC_API_URL to your PC LAN IP in .env.
 */
const LOCAL_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';

// Keep a static process.env reference so Metro inlines EXPO_PUBLIC_* at bundle time.
const ENV_API_URL: string = process.env.EXPO_PUBLIC_API_URL ?? '';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: QueryParams;
  /**
   * Overrides the session token. Pass `null` to send the request anonymously
   * even when a user is signed in.
   */
  token?: string | null;
  signal?: AbortSignal;
};

type AsyncHeaderProvider = () => Promise<string | null | undefined>;

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
let appCheckTokenProvider: AsyncHeaderProvider | null = null;

/** Kept in sync by `AuthProvider` so every request carries the current session token. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Called when an authenticated request is rejected with 401 (expired/revoked token). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

/**
 * The backend enforces Firebase App Check (`X-Firebase-AppCheck`) outside development.
 * Register a provider once App Check is integrated in the app.
 */
export function setAppCheckTokenProvider(provider: AsyncHeaderProvider | null) {
  appCheckTokenProvider = provider;
}

function getBaseUrl() {
  const base = ENV_API_URL.trim() || LOCAL_API_URL;
  return base.replace(/\/$/, '');
}

export function getApiBaseUrl() {
  return getBaseUrl();
}

function buildQueryString(query?: QueryParams) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (value === undefined || value === null || value === '') continue;
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function extractErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message) return record.message;
    // Public demo-funnel routes respond with `{ error: { code, message } }`.
    const nested = record.error;
    if (nested && typeof nested === 'object' && typeof (nested as { message?: unknown }).message === 'string') {
      return (nested as { message: string }).message;
    }
  }
  return `Request failed (${status})`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options;
  const token = options.token === undefined ? authToken : options.token;
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}${buildQueryString(query)}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (appCheckTokenProvider) {
    const appCheckToken = await appCheckTokenProvider().catch(() => null);
    if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }
    throw new ApiError(extractErrorMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body: body ?? {} }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body: body ?? {} }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body: body ?? {} }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

/** Anonymous variant for public routes — never attaches the session token. */
export const publicHttp = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body' | 'token'>) =>
    http.get<T>(path, { ...options, token: null }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body' | 'token'>) =>
    http.post<T>(path, body, { ...options, token: null }),
};
