import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/env';
import { AuthService } from '../services/api/authService';

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

/**
 * Normalizes any image URL for physical Android/iOS devices and Web.
 * 1. Resolves localhost:8000 and 127.0.0.1:8000 to the current reachable LAN server IP.
 * 2. Prepend server base URL to relative /uploads/... or /storage/... paths.
 * 3. Sanitizes dead file:/// paths from other devices to high-res fallback image.
 */
export function normalizeMobileImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const trimmed = url.trim();

  // Data URLs can be rendered directly
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // If pointing to dead cache URI on another phone, fallback gracefully
  if (trimmed.startsWith('file:///data/user/0/host.exp.exponent/cache') && Platform.OS !== 'android') {
    return DEFAULT_FALLBACK_IMAGE;
  }

  if (trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
    return trimmed;
  }

  const serverBase = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, '');

  // Relative storage/upload paths
  if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    return `${serverBase}${cleanPath}`;
  }

  if (trimmed.startsWith('/storage') || trimmed.startsWith('storage/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    return `${serverBase}${cleanPath}`;
  }

  // Localhost resolution
  if (trimmed.includes('localhost:8000') || trimmed.includes('127.0.0.1:8000')) {
    return trimmed
      .replace('http://localhost:8000', serverBase)
      .replace('http://127.0.0.1:8000', serverBase);
  }

  return trimmed;
}

/**
 * Uploads local device images (file:// or content://) to the server before saving to DB.
 */
export async function uploadLocalImagesIfNecessary(
  images: string[],
  folder: string = 'products'
): Promise<string[]> {
  if (!images || images.length === 0) return [];

  const results: string[] = [];
  for (const img of images) {
    if (img.startsWith('file://') || img.startsWith('content://')) {
      try {
        const uploadedUrl = await AuthService.uploadImage(img, folder);
        if (uploadedUrl && !uploadedUrl.startsWith('file://')) {
          results.push(uploadedUrl);
          continue;
        }
      } catch (e) {
        console.warn('Failed to upload local image:', e);
      }
    }
    results.push(img);
  }
  return results;
}
