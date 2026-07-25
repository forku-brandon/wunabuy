/** Format amount with currency */
export function formatMoney(amount: number, currency: string = 'XAF'): string {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Round to 2 decimal places, avoiding float issues */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Calculate commission */
export function calculateCommission(subtotal: number, commissionRate: number): number {
  return roundMoney(subtotal * (commissionRate / 100));
}

/** Calculate store payout (subtotal minus commission) */
export function calculateStorePayout(subtotal: number, commission: number): number {
  return roundMoney(subtotal - commission);
}
