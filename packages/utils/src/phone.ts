/**
 * Normalize any phone input to E.164 format.
 * @example
 * normalizePhone('670123456') // '+237670123456'
 * normalizePhone('+237 670 123 456') // '+237670123456'
 */
export function normalizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  // Split multi-number fallbacks (e.g. "+237 670 123 456 / +237 699 876 543")
  const primaryNumber = phone.split('/')[0].split(',')[0].trim();
  const rawDigits = primaryNumber.replace(/[^+\d]/g, '');
  if (!rawDigits.startsWith('+') && rawDigits.length === 9) {
    return '+237' + rawDigits;
  }
  return rawDigits;
}

/**
 * Format a phone number for display.
 * Handles Cameroon (+237) numbers: +237 6XX XXX XXX
 * 
 * @example
 * formatPhone('+237670123456') // '+237 670 123 456'
 * formatPhone('670123456') // '+237 670 123 456' (auto-prepends country code)
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return '';
  if (normalized.startsWith('+237') && normalized.length === 13) {
    const p = normalized;
    return `${p.substring(0, 4)} ${p.substring(4, 7)} ${p.substring(7, 10)} ${p.substring(10, 13)}`;
  }
  return normalized;
}

/**
 * Validate E.164 phone number format.
 * Supports Cameroon (+237) with 9-digit local numbers starting with 6, 2, or 3.
 * 
 * @returns true if valid E.164 format
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const normalized = normalizePhone(phone);
  const regex = /^\+237[236]\d{8}$/;
  return regex.test(normalized);
}
