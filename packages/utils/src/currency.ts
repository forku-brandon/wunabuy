/**
 * Format a numeric amount as XAF (FCFA) currency without Intl dependency.
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
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Format a compact short form for large amounts without Intl dependency.
 * @example
 * formatXAFCompact(1500000) // '1.5M FCFA'
 * formatXAFCompact(25000) // '25K FCFA'
 */
export function formatXAFCompact(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 FCFA';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const formatted = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}M FCFA`;
  }
  if (abs >= 1_000) {
    const formatted = (amount / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}K FCFA`;
  }
  return `${Math.round(amount)} FCFA`;
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

