import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { shadows, borderRadius, spacing } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  elevated = true,
  padded = true,
  style,
  children,
  ...rest
}) => {
  const { theme, isDark } = useThemeStore();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        elevated && !isDark && shadows.sm,
        padded && styles.padded,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  padded: {
    padding: spacing.base,
  },
});

