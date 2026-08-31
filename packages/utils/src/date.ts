const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Format an ISO date string to a human-readable format without Intl dependencies.
 * @example
 * formatDate('2026-08-26T12:30:00Z') // 'Aug 26, 2026'
 * formatDate('2026-08-26T12:30:00Z', 'full') // 'August 26, 2026 at 12:30 PM'
 * formatDate('2026-08-26T12:30:00Z', 'time') // '12:30 PM'
 */
export function formatDate(isoDate: string, format: 'short' | 'full' | 'time' | 'date' = 'short'): string {
  if (!isoDate || typeof isoDate !== 'string') return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const monthShort = SHORT_MONTHS[date.getMonth()];
  const monthFull = FULL_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12

  const timeStr = `${hours}:${minutes} ${ampm}`;

  if (format === 'time') {
    return timeStr;
  }
  if (format === 'full') {
    return `${monthFull} ${day}, ${year} at ${timeStr}`;
  }
  if (format === 'date') {
    return `${monthFull} ${day}, ${year}`;
  }

  return `${monthShort} ${day}, ${year}`;
}

/**
 * Format a date as relative time (e.g., '2 hours ago', 'just now') without Intl dependencies.
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

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
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

