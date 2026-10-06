/**
 * api.ts
 *
 * Centralized fetch wrapper for the frontend.
 * Automatically attaches the JWT (if it exists) to every outgoing request.
 * Normalizes error responses so components can consistently catch and display them.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('jwt_token');
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure path starts with /api/v1 if not already prefixed
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullPath = cleanPath.startsWith('/api/v1') ? cleanPath : `/api/v1${cleanPath}`;

  const response = await fetch(`${API_BASE_URL}${fullPath}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      // Auto-clear invalid/expired token
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
    }
    if (data && data.error) {
      throw data.error as ApiError;
    }
    throw { 
      code: `HTTP_${response.status}`, 
      message: data?.message || 'An unexpected error occurred' 
    } as ApiError;
  }

  return data as T;
}
