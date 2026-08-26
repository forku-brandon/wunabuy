import { primary, accent, neutral, semantic, glass } from './colors';

/**
 * Theme definition type
 */
export type Theme = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderFocused: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentText: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  card: string;
  input: string;
  inputBorder: string;
  placeholder: string;
  overlay: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  statusBar: 'light-content' | 'dark-content';
};

/**
 * Light theme semantic tokens
 */
export const lightTheme: Theme = {
  background: neutral[50],
  surface: neutral[0],
  surfaceElevated: neutral[0],
  text: neutral[900],
  textSecondary: neutral[600],
  textTertiary: neutral[400],
  border: neutral[200],
  borderFocused: primary[500],
  primary: primary[500],
  primaryText: neutral[0],
  accent: accent[500],
  accentText: neutral[0],
  error: semantic.error[500],
  success: semantic.success[500],
  warning: semantic.warning[500],
  info: semantic.info[500],
  card: neutral[0],
  input: neutral[0],
  inputBorder: neutral[300],
  placeholder: neutral[400],
  overlay: 'rgba(15, 23, 42, 0.5)',
  tabBar: neutral[0],
  tabBarActive: primary[500],
  tabBarInactive: neutral[400],
  statusBar: 'dark-content',
};

/**
 * Dark theme semantic tokens
 */
export const darkTheme: Theme = {
  background: neutral[900],
  surface: neutral[800],
  surfaceElevated: neutral[700],
  text: neutral[50],
  textSecondary: neutral[300],
  textTertiary: neutral[400],
  border: neutral[700],
  borderFocused: primary[400],
  primary: primary[500],
  primaryText: neutral[0],
  accent: accent[500],
  accentText: neutral[0],
  error: semantic.error[500],
  success: semantic.success[500],
  warning: semantic.warning[500],
  info: semantic.info[500],
  card: neutral[800],
  input: neutral[800],
  inputBorder: neutral[600],
  placeholder: neutral[500],
  overlay: 'rgba(0, 0, 0, 0.7)',
  tabBar: neutral[900],
  tabBarActive: primary[400],
  tabBarInactive: neutral[500],
  statusBar: 'light-content',
};

/**
 * Available themes
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
