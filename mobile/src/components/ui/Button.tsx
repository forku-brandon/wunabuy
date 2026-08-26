import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  onPress,
  ...rest
}) => {
  const { theme } = useThemeStore();

  const getContainerStyle = (): ViewStyle => {
    let bg = theme.primary;
    let border = 'transparent';

    switch (variant) {
      case 'primary':
        bg = colors.primary[500];
        break;
      case 'secondary':
        bg = colors.accent[500];
        break;
      case 'outline':
        bg = 'transparent';
        border = theme.border;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
      case 'danger':
        bg = colors.semantic.error[500];
        break;
    }

    if (disabled) {
      bg = theme.border;
      border = 'transparent';
    }

    const sizePadding =
      size === 'small'
        ? { height: 36, paddingHorizontal: spacing.md }
        : size === 'large'
        ? { height: 56, paddingHorizontal: spacing.xl }
        : { height: 48, paddingHorizontal: spacing.base };

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderRadius: borderRadius.md,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      ...sizePadding,
    };
  };

  const getTextColor = (): string => {
    if (disabled) return theme.textTertiary;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return colors.neutral[0];
      case 'outline':
      case 'ghost':
        return theme.text;
      default:
        return colors.neutral[0];
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[styles.base, getContainerStyle(), style]}
      onPress={onPress}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <Text
            variant={size === 'small' ? 'caption' : 'bodyMedium'}
            bold
            color={getTextColor()}
            style={leftIcon ? styles.textWithLeftIcon : rightIcon ? styles.textWithRightIcon : undefined}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Minimum touch target 48dp
  },
  textWithLeftIcon: {
    marginLeft: spacing.xs,
  },
  textWithRightIcon: {
    marginRight: spacing.xs,
  },
});

