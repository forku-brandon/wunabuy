/**
 * Supply Chain & Asset Origin Integrity Module — Wunabuy Staff Portal (OWASP A03:2025 Mitigation)
 * 
 * Verifies asset origins, blocks dynamic unsafe scripts, and asserts environment safety.
 */

import { securityLogger } from './securityLogger';

export interface AssetOriginCheck {
  url: string;
  isTrusted: boolean;
  reason?: string;
}

const TRUSTED_DOMAINS = [
  'api.wunabuy.com',
  'wunabuy.com',
  'images.unsplash.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/**
 * Validate asset or API origin URL against authorized enterprise whitelist.
 */
export function validateAssetOrigin(url: string): AssetOriginCheck {
  if (!url) return { url: '', isTrusted: false, reason: 'Empty URL' };

  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
    return { url, isTrusted: true };
  }

  try {
    const parsed = new URL(url);
    const domainMatch = TRUSTED_DOMAINS.some(
      (trusted) => parsed.hostname === trusted || parsed.hostname.endsWith('.' + trusted)
    );

    if (!domainMatch) {
      securityLogger.logEvent({
        action_code: 'DATA_INTEGRITY_FAILURE',
        action_description: `Untrusted asset origin blocked: ${parsed.hostname}`,
        security_level: 'WARNING',
        meta: { url, hostname: parsed.hostname },
      });

      return {
        url,
        isTrusted: false,
        reason: `Origin '${parsed.hostname}' is not in corporate asset whitelist.`,
      };
    }

    return { url, isTrusted: true };
  } catch (err) {
    return { url, isTrusted: false, reason: 'Invalid URL format' };
  }
}

/**
 * Assert build environment integrity.
 */
export function assertSupplyChainIntegrity(): boolean {
  // Prevent execution if unsafe window globals are present
  if (typeof window !== 'undefined' && (window as unknown as { __UNTRUSTED_INJECTED__?: boolean }).__UNTRUSTED_INJECTED__) {
    console.error('[SecuritySupplyChain] Untrusted script injection detected!');
    return false;
  }
  return true;
}
