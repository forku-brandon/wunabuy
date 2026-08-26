import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { Text } from './Text';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  visible?: boolean;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible = true,
  style,
}) => {
  if (!visible) return null;

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { bg: colors.semantic.success[500], text: colors.neutral[0] };
      case 'error':
        return { bg: colors.semantic.error[500], text: colors.neutral[0] };
      case 'warning':
        return { bg: colors.semantic.warning[500], text: colors.neutral[900] };
      case 'info':
      default:
        return { bg: colors.neutral[900], text: colors.neutral[0] };
    }
  };

  const { bg, text } = getTypeStyle();

  return (
    <View style={[styles.container, { backgroundColor: bg }, shadows.md, style]}>
      <Text variant="bodyMedium" bold color={text} align="center">
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    zIndex: 999,
  },
});

