// ────────────────────────────────────────────────────────────
// API Client — menghubungkan frontend ke backend Bestari
// Base URL: http://localhost:8000/api
// ────────────────────────────────────────────────────────────

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const SERVER_BASE = BASE_URL.replace(/\/api$/, '');

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

/**
 * Mengubah path avatar menjadi URL valid:
 * - Menambahkan SERVER_BASE jika berupa relative path (/uploads/...)
 * - Mengembalikan URL utuh jika http / https / data: / blob:
 * - Mengembalikan default UI-avatars jika null/kosong
 */
export function getAvatarUrl(avatar?: string | null, name?: string): string {
  if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=A8B774&color=2C4219`;
  }
  const trimmed = avatar.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${SERVER_BASE}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${SERVER_BASE}/${trimmed}`;
  }
  return `${SERVER_BASE}/${trimmed.replace(/^\//, '')}`;
}

/**
 * Fallback saat gambar profil gagal dimuat (404/network error)
 */
export function handleAvatarError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  name?: string
) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=A8B774&color=2C4219`;
}
