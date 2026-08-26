/**
 * Color system for the Teal+Amber e-commerce brand
 */

/**
 * Primary emerald teal colors
 */
export const primary = {
  50: '#F0FDFA',
  100: '#CCFBF1',
  200: '#99F6E4',
  300: '#5EEAD4',
  400: '#2DD4BF',
  500: '#0D9488', // Main
  600: '#0F766E',
  700: '#0F5F5C',
  800: '#114B4A',
  900: '#13393E',
} as const;

/**
 * Accent amber/orange colors
 */
export const accent = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B', // Main
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

/**
 * Slate neutrals
 */
export const neutral = {
  0: '#FFFFFF',
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
} as const;

/**
 * Semantic colors
 */
export const semantic = {
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    700: '#15803D',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    700: '#B45309',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    700: '#B91C1C',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    700: '#1D4ED8',
  },
} as const;

/**
 * User role colors
 */
export const role = {
  buyer: '#0D9488',
  seller: '#2563EB',
  transporter: '#F59E0B',
  staff: '#6366F1',
} as const;

/**
 * Glassmorphism surface tokens
 */
export const glass = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 255, 255, 0.2)',
    blur: 10,
    shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    blur: 10,
    shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
} as const;

/**
 * Composite colors object export
 */
export const colors = {
  primary,
  accent,
  neutral,
  semantic,
  role,
  glass,
} as const;
