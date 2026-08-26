/**
 * Truncate text to a maximum length with ellipsis.
 * @example
 * truncateText('This is a long product description', 20) // 'This is a long pr...'
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') return '';
  if (typeof maxLength !== 'number' || isNaN(maxLength) || maxLength <= 0) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

/**
 * Generate initials from a full name (for avatar fallbacks).
 * @example
 * getInitials('Jean Dupont') // 'JD'
 * getInitials('Mama Chantal Ngo') // 'MC'
 */
export function getInitials(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Capitalize the first letter of each word.
 * @example
 * titleCase('douala tech hub') // 'Douala Tech Hub'
 */
export function titleCase(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

/**
 * Generate a unique idempotency key (UUID v4 format).
 * Used for mutation requests (orders, payments, payouts).
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
