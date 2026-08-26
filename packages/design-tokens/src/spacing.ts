/**
 * Spacing tokens based on a 4px grid
 */

/**
 * Generic spacing tokens
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
} as const;

/**
 * Specific layout spacing tokens
 */
export const layout = {
  screenPaddingHorizontal: spacing.base,
  screenPaddingVertical: spacing.base,
  cardPadding: spacing.base,
  sectionGap: spacing.xl,
  inputHeight: spacing['4xl'],
  buttonHeight: spacing['4xl'],
  tabBarHeight: spacing['5xl'],
  headerHeight: 56, // Fixed standard height
  bottomSheetHandleHeight: spacing.xl,
} as const;
