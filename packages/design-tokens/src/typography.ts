/**
 * Typography tokens
 */

/**
 * Font families
 */
export const fontFamilies = {
  heading: 'PlusJakartaSans-Bold',
  headingSemiBold: 'PlusJakartaSans-SemiBold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  headingWeb: "'Plus Jakarta Sans', sans-serif",
  bodyWeb: "'Inter', sans-serif",
} as const;

/**
 * Font size scale
 */
export const fontSizes = {
  display: 32,
  h1: 24,
  h2: 20,
  h3: 18,
  bodyLarge: 16,
  bodyMedium: 14,
  caption: 12,
  overline: 10,
} as const;

/**
 * Line height scale
 */
export const lineHeights = {
  display: 40,
  h1: 32,
  h2: 28,
  h3: 26,
  bodyLarge: 24,
  bodyMedium: 20,
  caption: 16,
  overline: 14,
} as const;

/**
 * Font weight scale
 */
export const fontWeights = {
  bold: '700',
  semiBold: '600',
  medium: '500',
  regular: '400',
} as const;

/**
 * Pre-configured text styles
 */
export const textStyles = {
  display: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.display,
  },
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.h1,
  },
  h2: {
    fontFamily: fontFamilies.headingSemiBold,
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.h2,
  },
  h3: {
    fontFamily: fontFamilies.headingSemiBold,
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.h3,
  },
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.bodyLarge,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.bodyLarge,
  },
  bodyMedium: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.bodyMedium,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.bodyMedium,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.caption,
  },
} as const;
