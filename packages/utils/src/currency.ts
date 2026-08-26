/**
 * Format a numeric amount as XAF (FCFA) currency.
 * Uses French locale formatting (space thousand separator, no decimals for XAF).
 * 
 * @example
 * formatXAF(185000) // '185 000 FCFA'
 * formatXAF(0) // '0 FCFA'
 * formatXAF(1500.5) // '1 501 FCFA' (rounded)
 */
export function formatXAF(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 FCFA';
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(rounded);
  // French locale uses narrow no-break space (U+202F) or regular non-breaking space (U+00A0)
  // Let's replace any spaces with regular space just in case, or leave as is.
  return `${formatted.replace(/\s+/g, ' ')} FCFA`;
}

/**
 * Format a compact short form for large amounts.
 * @example
 * formatXAFCompact(1500000) // '1.5M FCFA'
 * formatXAFCompact(25000) // '25K FCFA'
 */
export function formatXAFCompact(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 FCFA';
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return `${formatter.format(amount)} FCFA`;
}

/**
 * Parse a formatted XAF string back to a number.
 * @example
 * parseXAF('185 000 FCFA') // 185000
 */
export function parseXAF(formatted: string): number {
  if (!formatted || typeof formatted !== 'string') return 0;
  const numStr = formatted.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(numStr);
  return isNaN(parsed) ? 0 : parsed;
}
