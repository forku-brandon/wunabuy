import { Platform } from 'react-native';

/**
 * Resolve the dynamic API base URL for Wunabuy Mobile App.
 *
 * Priority:
 * 1. Explicit EXPO_PUBLIC_API_URL environment variable.
 * 2. Development mode platform defaults:
 *    - Android Emulator -> http://10.0.2.2:8000/api/v1
 *    - iOS Simulator / Web / Dev Server -> http://localhost:8000/api/v1
 * 3. Production build default -> https://api.wunabuy.com/api/v1
 */
function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (__DEV__) {
    // Android emulator loops back to host machine at 10.0.2.2
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api/v1';
    }
    return 'http://localhost:8000/api/v1';
  }

  return 'https://api.wunabuy.com/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const REVERB_CONFIG = {
  appKey: process.env.EXPO_PUBLIC_REVERB_APP_KEY || 'wunabuy_reverb_key',
  host: process.env.EXPO_PUBLIC_REVERB_HOST || (__DEV__ ? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost') : 'api.wunabuy.com'),
  port: parseInt(process.env.EXPO_PUBLIC_REVERB_PORT || (__DEV__ ? '8080' : '443'), 10),
  scheme: process.env.EXPO_PUBLIC_REVERB_SCHEME || (__DEV__ ? 'http' : 'https'),
};

if (__DEV__) {
  console.log([Wunabuy Config] API Base URL: \);
  console.log([Wunabuy Config] Platform: \);
}