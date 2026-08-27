/**
 * Typography tokens for cross-platform React Native & Web
 */

export const fontFamilies = {
  heading: 'System',
  headingSemiBold: 'System',
  body: 'System',
  bodyMedium: 'System',
  headingWeb: "'Plus Jakarta Sans', sans-serif",
  bodyWeb: "'Inter', sans-serif",
} as const;

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

export const fontWeights = {
  bold: '700' as const,
  semiBold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

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
