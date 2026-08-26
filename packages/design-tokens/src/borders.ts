/**
 * Border and radius tokens
 */

/**
 * Border radii
 */
export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const borderRadius = radii;

/**
 * Border widths
 */
export const borderWidths = {
  none: 0,
  thin: 0.5,
  base: 1,
  thick: 2,
} as const;
