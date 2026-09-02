import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { Text } from './Text';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  visible?: boolean;
  duration?: number; // Auto-dismiss duration in ms (default: 3000ms = 3 seconds)
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible = true,
  duration = 3000,
  onDismiss,
  style,
}) => {
  const [internalVisible, setInternalVisible] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message || !visible) {
      setInternalVisible(false);
      return;
    }

    setInternalVisible(true);

    // Fade In
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss & Fade Out after `duration` (3 seconds)
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setInternalVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [message, visible, duration, fadeAnim, onDismiss]);

  if (!internalVisible || !message) return null;

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
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bg, opacity: fadeAnim },
        shadows.md,
        style,
      ]}
    >
      <Text variant="bodyMedium" bold color={text} align="center">
        {message}
      </Text>
    </Animated.View>
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
