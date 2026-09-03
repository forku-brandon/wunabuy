import { ApiResponse, ApiError } from '@wunabuy/types';

// API Base URL configured via environment variable, defaulting to Laravel API v1
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1';

export class ApiClientError extends Error {
  code: string;
  details?: Record<string, string[]>;

  constructor(message: string, code: string = 'API_ERROR', details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Base HTTP fetch wrapper for Wunabuy Staff Portal Backend API calls.
 * Automatically injects Sanctum Bearer tokens, JSON headers, and parses error payloads.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('wunabuy_staff_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const apiErr = data as ApiError;
      throw new ApiClientError(
        apiErr.error?.message || 'API request failed with status ' + response.status,
        apiErr.error?.code || `HTTP_${response.status}`,
        apiErr.error?.details
      );
    }

    return data as ApiResponse<T>;
  } catch (err: any) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    // Network failure or offline backend - throw ApiClientError for graceful caller fallback
    throw new ApiClientError(
      err.message || 'Unable to connect to Wunabuy API server',
      'NETWORK_OFFLINE'
    );
  }
}
