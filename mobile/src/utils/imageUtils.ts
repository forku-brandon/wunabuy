import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/env';
import { AuthService } from '../services/api/authService';

const serverBaseUrl = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, '');

// Local localized fallback image served from local backend server
export const DEFAULT_FALLBACK_IMAGE = `${serverBaseUrl}/uploads/products/prod_99887766_0.webp`;

/**
 * Normalizes any image URL for physical Android/iOS devices and Web.
 * 1. Resolves localhost:8000 and 127.0.0.1:8000 to the current reachable LAN server IP.
 * 2. Prepends server base URL to relative /uploads/... or /storage/... paths.
 * 3. Sanitizes dead file:/// paths from other devices to high-res local asset.
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
 * Safely resolves the primary display image for a product.
 * Checks product.image_url first, then product.images[0], normalized.
 */
export function resolveProductImage(product?: { image_url?: string | null; images?: string[] | null } | null): string {
  if (!product) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  if (product.image_url && typeof product.image_url === 'string' && product.image_url.trim().length > 0) {
    return normalizeMobileImageUrl(product.image_url);
  }

  if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
    return normalizeMobileImageUrl(product.images[0]);
  }

  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Resolves all product images normalized.
 */
export function resolveProductImages(product?: { image_url?: string | null; images?: string[] | null } | null): string[] {
  if (!product) {
    return [DEFAULT_FALLBACK_IMAGE];
  }

  const list: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    for (const img of product.images) {
      if (img && typeof img === 'string' && img.trim().length > 0) {
        list.push(normalizeMobileImageUrl(img));
      }
    }
  }

  if (list.length === 0 && product.image_url) {
    list.push(normalizeMobileImageUrl(product.image_url));
  }

  return list.length > 0 ? list : [DEFAULT_FALLBACK_IMAGE];
}

/**
 * Safely resolves store logo with fallback.
 */
export function resolveStoreLogo(store?: { logo_url?: string | null; store_name?: string } | null): string {
  if (store?.logo_url && typeof store.logo_url === 'string' && store.logo_url.trim().length > 0) {
    return normalizeMobileImageUrl(store.logo_url);
  }
  const serverBase = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, '');
  return `${serverBase}/uploads/stores/store_01a0872b_logo.webp`;
}

/**
 * Safely resolves store banner with fallback.
 */
export function resolveStoreBanner(store?: { banner_url?: string | null; store_name?: string } | null): string {
  if (store?.banner_url && typeof store.banner_url === 'string' && store.banner_url.trim().length > 0) {
    return normalizeMobileImageUrl(store.banner_url);
  }
  const serverBase = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, '');
  return `${serverBase}/uploads/stores/store_01a0872b_banner.webp`;
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
