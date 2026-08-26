import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { ApiError } from '@wunabuy/types';

/**
 * Configuration options for creating the Wunabuy API Client.
 */
export interface ApiClientConfig {
  /**
   * Base API endpoint URL (e.g., 'https://api.wunabuy.com/api/v1').
   */
  baseURL: string;

  /**
   * Async callback to retrieve the stored Sanctum access token.
   */
  getToken: () => Promise<string | null>;

  /**
   * Async callback to retrieve the stored refresh token.
   */
  getRefreshToken: () => Promise<string | null>;

  /**
   * Async callback triggered when tokens are refreshed successfully.
   */
  onTokenRefreshed: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;

  /**
   * Callback triggered when authentication fails completely (401 on refresh).
   */
  onAuthError: () => void;

  /**
   * Optional custom request timeout in milliseconds (default: 15000ms).
   */
  timeout?: number;
}

/**
 * Create a strongly typed, pre-configured Axios instance with Sanctum authentication,
 * automatic token refresh interceptor, and request retries.
 * 
 * @param config ApiClientConfig
 * @returns AxiosInstance
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: config.timeout ?? 15000,
  });

  // Request Interceptor: Attach Sanctum Bearer Token
  client.interceptors.request.use(
    async (reqConfig: InternalAxiosRequestConfig) => {
      const token = await config.getToken();
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Handle 401 Token Refresh & Error Formatting
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized with token refresh mechanism
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await config.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call backend token refresh endpoint
          const refreshResponse = await axios.post(`${config.baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newTokens = refreshResponse.data.data;
          await config.onTokenRefreshed(newTokens);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          }

          return client(originalRequest);
        } catch (refreshError) {
          config.onAuthError();
          return Promise.reject(normalizeApiError(refreshError as AxiosError));
        }
      }

      return Promise.reject(normalizeApiError(error));
    }
  );

  return client;
}

/**
 * Normalize Axios errors into a consistent Wunabuy ApiError shape.
 */
export function normalizeApiError(error: AxiosError): ApiError {
  if (error.response && error.response.data) {
    const data = error.response.data as Partial<ApiError>;
    if (data.error && typeof data.error === 'object') {
      return {
        success: false,
        error: {
          code: data.error.code || 'UNKNOWN_ERROR',
          message: data.error.message || error.message,
          details: data.error.details,
          request_id: data.error.request_id || 'unknown_req_id',
        },
      };
    }
  }

  return {
    success: false,
    error: {
      code: error.code || 'NETWORK_ERROR',
      message: error.message || 'An unexpected network error occurred.',
      details: undefined,
      request_id: 'local_error',
    },
  };
}

