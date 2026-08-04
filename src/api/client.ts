// ────────────────────────────────────────────────────────────
// API Client — menghubungkan frontend ke backend Bestari
// Base URL: http://localhost:8000/api
// ────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const TOKEN_KEY = 'bestari_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

interface ApiOptions {
  method?: string;
  body?: any;
  isFormData?: boolean;
}

export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, isFormData = false } = options;

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: any = {};
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if (!res.ok || json.success === false) {
    const err: any = new Error(json.message || 'Terjadi kesalahan');
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json.data as T;
}

// Helper auth
export async function apiLogin(email: string, password: string) {
  return api<{ token: string; user: any }>('/auth/login', { method: 'POST', body: { email, password } });
}

export async function apiRegister(payload: { name: string; email: string; password: string; phone?: string }) {
  return api<{ token: string; user: any }>('/auth/register', { method: 'POST', body: payload });
}

export async function apiUpdateProfile(payload: any) {
  return api('/auth/profile', { method: 'PUT', body: payload });
}

export async function apiMe() {
  return api<any>('/auth/me');
}
