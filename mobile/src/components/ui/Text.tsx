import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, textStyles } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'bodyLarge' | 'bodyMedium' | 'caption';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  secondary?: boolean;
  bold?: boolean;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<TextProps> = ({
  variant = 'bodyMedium',
  color,
  secondary = false,
  bold = false,
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { theme } = useThemeStore();

  const textColor = color ?? (secondary ? theme.textSecondary : theme.text);
  const styleVariant = textStyles[variant] || textStyles.bodyMedium;

  return (
    <RNText
      style={[
        styleVariant,
        { color: textColor, textAlign: align },
        bold && styles.bold,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
  },
});

