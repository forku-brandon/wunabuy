/**
 * Format an ISO date string to a human-readable format.
 * @example
 * formatDate('2026-08-26T12:30:00Z') // 'Aug 26, 2026'
 * formatDate('2026-08-26T12:30:00Z', 'full') // 'August 26, 2026 at 12:30 PM'
 * formatDate('2026-08-26T12:30:00Z', 'time') // '12:30 PM'
 */
export function formatDate(isoDate: string, format: 'short' | 'full' | 'time' | 'date' = 'short'): string {
  if (!isoDate || typeof isoDate !== 'string') return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  
  if (format === 'full') {
    const datePart = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    const timePart = new Intl.DateTimeFormat('en-US', timeOpts).format(date);
    return `${datePart} at ${timePart}`;
  }
  if (format === 'time') {
    return new Intl.DateTimeFormat('en-US', timeOpts).format(date);
  }
  if (format === 'date') {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  }
  
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

/**
 * Format a date as relative time (e.g., '2 hours ago', 'just now').
 * @example
 * formatRelativeTime('2026-08-26T12:00:00Z') // '30 minutes ago'
 */
export function formatRelativeTime(isoDate: string): string {
  if (!isoDate || typeof isoDate !== 'string') return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return rtf.format(-diffInDays, 'day');
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return rtf.format(-diffInMonths, 'month');
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}

/**
 * Check if an ISO date has expired (is in the past).
 */
export function isExpired(isoDate: string): boolean {
  if (!isoDate || typeof isoDate !== 'string') return true;
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return true;
  return date.getTime() < Date.now();
}

/**
 * Get remaining time until expiry as a human-readable string.
 * @example
 * getTimeRemaining('2026-08-26T14:30:00Z') // '1h 45m'
 */
export function getTimeRemaining(isoDate: string): string {
  if (!isoDate || typeof isoDate !== 'string') return '0h 0m';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '0h 0m';
  
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return '0h 0m';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
}
