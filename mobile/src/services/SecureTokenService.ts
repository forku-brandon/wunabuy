import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@wunabuy_access_token';
const REFRESH_TOKEN_KEY = '@wunabuy_refresh_token';

/**
 * Enterprise Secure Token Service
 * Manages access and refresh tokens for Sanctum authentication.
 */
export const SecureTokenService = {
  /**
   * Save access and refresh tokens securely.
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('[SecureTokenService] Failed to set tokens', error);
      throw error;
    }
  },

  /**
   * Retrieve the current access token.
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('[SecureTokenService] Failed to get access token', error);
      return null;
    }
  },

  /**
   * Retrieve the current refresh token.
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('[SecureTokenService] Failed to get refresh token', error);
      return null;
    }
  },

  /**
   * Clear all stored tokens (on logout or auth failure).
   */
  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('[SecureTokenService] Failed to clear tokens', error);
    }
  },
};
