import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { Text } from './Text';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'accent';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'medium',
  style,
}) => {
  const getColors = (): { bg: string; text: string } => {
    switch (variant) {
      case 'success':
        return { bg: colors.semantic.success[50], text: colors.semantic.success[700] };
      case 'warning':
        return { bg: colors.semantic.warning[50], text: colors.semantic.warning[700] };
      case 'error':
        return { bg: colors.semantic.error[50], text: colors.semantic.error[700] };
      case 'info':
        return { bg: colors.semantic.info[50], text: colors.semantic.info[700] };
      case 'primary':
        return { bg: colors.primary[50], text: colors.primary[700] };
      case 'accent':
        return { bg: colors.accent[50], text: colors.accent[700] };
      case 'neutral':
      default:
        return { bg: colors.neutral[100], text: colors.neutral[700] };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg },
        size === 'small' ? styles.small : styles.medium,
        style,
      ]}
    >
      <Text
        variant="caption"
        bold
        color={text}
        style={size === 'small' ? styles.smallText : undefined}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  smallText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
