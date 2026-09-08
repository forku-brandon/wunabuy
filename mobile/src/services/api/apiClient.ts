import { createWunabuyApiSDK } from '@wunabuy/api-client';
import { SecureTokenService } from '../SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';

import { API_BASE_URL } from '../../config/env';
export { API_BASE_URL };

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

