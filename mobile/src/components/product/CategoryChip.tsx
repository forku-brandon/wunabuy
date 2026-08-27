import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { ProductCategory } from '@wunabuy/types';
import { colors, spacing, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface CategoryChipProps {
  category: ProductCategory | 'All' | 'Skincare' | 'Makeup' | 'Fragrance' | 'Haircare' | 'Tools' | 'Offers';
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const CATEGORY_ICONS: Record<string, string> = {
  All: '✨',
  Skincare: '🧴',
  Makeup: '💄',
  Fragrance: '🌸',
  Haircare: '🧼',
  Tools: '🖌️',
  Offers: '🏷️',
  [ProductCategory.ELECTRONICS]: '💻',
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
  const { theme, isDark } = useThemeStore();
  const icon = CATEGORY_ICONS[category] || '📦';
  const label = category === 'Food & Groceries' ? 'Food' : category;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.itemContainer, style]}
    >
      <View
        style={[
          styles.circle,
          {
            backgroundColor: selected
              ? colors.primary[500]
              : isDark
              ? colors.neutral[800]
              : colors.primary[50],
            borderColor: selected ? colors.primary[500] : 'transparent',
          },
          !selected && !isDark && shadows.sm,
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text
        variant="caption"
        bold={selected}
        color={selected ? colors.primary[500] : theme.text}
        align="center"
        numberOfLines={1}
        style={styles.label}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    marginRight: spacing.md + 2,
    width: 62,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
