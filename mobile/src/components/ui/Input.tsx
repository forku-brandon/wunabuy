import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from './Text';

export interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  style,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...rest
}) => {
  const { theme } = useThemeStore();
  const [isFocused, setIsFocused] = useState(false);
  const isMultiline = Boolean(rest.multiline);

  const getBorderColor = (): string => {
    if (error) return colors.semantic.error[500];
    if (isFocused) return colors.primary[500];
    return theme.inputBorder;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.input,
            borderColor: getBorderColor(),
          },
          isMultiline ? styles.multilineInputContainer : styles.singlelineInputContainer,
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={[styles.leftIcon, isMultiline && { marginTop: spacing.xs }]}>{leftIcon}</View>}

        <RNTextInput
          style={[
            styles.input,
            isMultiline ? styles.multilineInput : styles.singlelineInput,
            {
              color: theme.text,
            },
            style,
          ]}
          placeholderTextColor={placeholderTextColor ?? theme.placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {rightIcon && <View style={[styles.rightIcon, isMultiline && { marginTop: spacing.xs }]}>{rightIcon}</View>}
      </View>

      {error ? (
        <Text variant="caption" color={colors.semantic.error[500]} style={styles.hint}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color={theme.textSecondary} style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  singlelineInputContainer: {
    height: 48,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  multilineInputContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  singlelineInput: {
    height: '100%',
  },
  multilineInput: {
    width: '100%',
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  hint: {
    marginTop: spacing.xs,
  },
});
