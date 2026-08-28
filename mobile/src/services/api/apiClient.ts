import { createWunabuyApiSDK } from '@wunabuy/api-client';
import { SecureTokenService } from '../SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';

// Default API Base URL (configurable via EXPO_PUBLIC_API_URL or fallback to production backend)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.wunabuy.com/api/v1';

/**
 * Pre-configured Wunabuy API SDK Singleton for the Mobile Application.
 * Attaches Sanctum Bearer tokens from SecureTokenService automatically on all requests.
 */
export const api = createWunabuyApiSDK({
  baseURL: API_BASE_URL,
  getToken: async () => {
    return await SecureTokenService.getAccessToken();
  },
  getRefreshToken: async () => {
    return await SecureTokenService.getRefreshToken();
  },
  onTokenRefreshed: async (tokens) => {
    await SecureTokenService.setTokens(tokens.access_token, tokens.refresh_token);
  },
  onAuthError: () => {
    useAuthStore.getState().logout();
  },
  timeout: 15000,
});

export const apiClient = api.client;

