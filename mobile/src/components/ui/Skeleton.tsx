import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius, colors } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadiusValue?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadiusValue = borderRadius.sm,
  style,
}) => {
  const { isDark } = useThemeStore();

  const bg = isDark ? colors.neutral[800] : colors.neutral[200];

  return (
    <View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: borderRadiusValue,
          backgroundColor: bg,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
