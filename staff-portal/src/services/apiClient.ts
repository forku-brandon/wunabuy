import { ApiResponse, ApiError } from '@wunabuy/types';

// Dynamically resolve API Base URL. In the browser, /api/v1 proxies seamlessly via Vite or reverse proxy.
export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string);
  if (envUrl && envUrl.startsWith('https://')) {
    return envUrl;
  }
  if (typeof window !== 'undefined') {
    return envUrl || '/api/v1';
  }
  return envUrl || 'http://127.0.0.1:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

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
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const apiErr = data as ApiError;
      let errMsg = apiErr.error?.message || (data as any)?.message;
      if (!errMsg && (data as any)?.errors) {
        const errorValues = Object.values((data as any).errors);
        errMsg = errorValues.flat().join('; ');
      }
      if (!errMsg) {
        errMsg = 'API request failed with status ' + response.status;
      }
      throw new ApiClientError(
        errMsg,
        apiErr.error?.code || `HTTP_${response.status}`,
        apiErr.error?.details || (data as any)?.errors
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

