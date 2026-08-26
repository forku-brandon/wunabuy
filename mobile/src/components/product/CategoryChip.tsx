import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { ProductCategory } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface CategoryChipProps {
  category: ProductCategory | 'All';
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const CATEGORY_ICONS: Record<string, string> = {
  All: '✨',
  [ProductCategory.ELECTRONICS]: '📱',
  [ProductCategory.FASHION]: '👕',
  [ProductCategory.FOOD_GROCERIES]: '🍎',
  [ProductCategory.HOME_GARDEN]: '🏡',
  [ProductCategory.HEALTH_BEAUTY]: '💄',
  [ProductCategory.AUTOMOTIVE]: '🚗',
  [ProductCategory.SERVICES]: '🛠️',
  [ProductCategory.OTHER]: '📦',
};

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected = false,
  onPress,
  style,
}) => {
  const { theme } = useThemeStore();
  const icon = CATEGORY_ICONS[category] || '📦';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary[500] : theme.card,
          borderColor: selected ? colors.primary[500] : theme.border,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text
        variant="bodyMedium"
        bold={selected}
        color={selected ? colors.neutral[0] : theme.text}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.xs + 2,
  },
  icon: {
    marginRight: spacing.xs,
    fontSize: 14,
  },
});

