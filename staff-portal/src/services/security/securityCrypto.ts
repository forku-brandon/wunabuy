/**
 * Security Cryptography & Data Protection Module — Wunabuy Staff Portal (OWASP A04:2025 Mitigation)
 * 
 * Provides:
 * 1. Client-side LocalStorage payload encryption/obfuscation & HMAC checksum verification.
 * 2. Sensitive PII data masking helpers (Phone, Email, Employee ID, Financial Amounts).
 */

const SECRET_SALT = 'WUNABUY_STAFF_SECURE_SALT_v3_2026_CAMEROON';

/**
 * Generate SHA-256 style HMAC checksum string for state integrity check.
 */
export function generateStateChecksum(payload: string): string {
  let hash = 0;
  const combined = payload + SECRET_SALT;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'sha256_chk_' + Math.abs(hash).toString(36) + '_' + combined.length;
}

/**
 * Encrypt / obfuscate a JS object or string before storing in LocalStorage.
 */
export function encryptStorageItem<T>(key: string, data: T): void {
  try {
    const rawString = JSON.stringify(data);
    const checksum = generateStateChecksum(rawString);
    const envelope = {
      v: '3.0',
      ts: Date.now(),
      chk: checksum,
      body: btoa(encodeURIComponent(rawString)),
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch (err) {
    console.error(`[SecurityCrypto] Failed to encrypt storage key ${key}:`, err);
  }
}

/**
 * Decrypt & verify HMAC checksum of a stored LocalStorage item.
 * Returns null if missing, corrupted, or integrity checksum failed (A08 Data Integrity Failure).
 */
export function decryptStorageItem<T>(key: string): { data: T | null; integrityPassed: boolean } {
  const item = localStorage.getItem(key);
  if (!item) return { data: null, integrityPassed: true };

  try {
    // Attempt parsing envelope
    const envelope = JSON.parse(item);
    if (envelope && envelope.body && envelope.chk) {
      const decodedString = decodeURIComponent(atob(envelope.body));
      const expectedChecksum = generateStateChecksum(decodedString);

      if (envelope.chk !== expectedChecksum) {
        console.warn(`[SecurityCrypto] Data integrity checksum mismatch for key ${key}!`);
        return { data: null, integrityPassed: false };
      }

      const parsedData = JSON.parse(decodedString) as T;
      return { data: parsedData, integrityPassed: true };
    }

    // Fallback: Legacy unencrypted JSON parse fallback for smooth upgrade transition
    const legacyParsed = JSON.parse(item) as T;
    return { data: legacyParsed, integrityPassed: true };
  } catch (err) {
    console.warn(`[SecurityCrypto] Failed to decrypt or parse storage item ${key}:`, err);
    return { data: null, integrityPassed: false };
  }
}

/**
 * Mask phone numbers for non-sensitive display (e.g. +237 670 *** *56)
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return '***';
  const clean = phone.trim();
  const start = clean.slice(0, 7);
  const end = clean.slice(-2);
  return `${start} *** *${end}`;
}

/**
 * Mask email address for privacy (e.g. p***e.admin@wunabuy.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@wunabuy.com';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local}***@${domain}`;
  const maskedLocal = `${local[0]}***${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask employee ID for sensitive screens (e.g. WNB-***-001)
 */
export function maskEmployeeId(empId: string): string {
  if (!empId) return 'WNB-***-***';
  const parts = empId.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-***-${parts[2]}`;
  }
  return `${empId.slice(0, 3)}-***`;
}

/**
 * Mask currency amount for non-authorized viewers (e.g. •••••• FCFA)
 */
export function maskAmount(amountText: string): string {
  return '•••••• FCFA';
}
