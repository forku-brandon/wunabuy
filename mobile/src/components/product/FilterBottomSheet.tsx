import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheet, Text, Button, Input } from '../ui';
import { ProductCategory, QualityTier } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { ProductFilters } from '@wunabuy/api-client';

export interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onApplyFilters: (filters: ProductFilters) => void;
  onResetFilters: () => void;
}

const RADII = [5, 10, 25, 50];
const SORT_OPTIONS: { label: string; value: ProductFilters['sort_by'] }[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Nearest First', value: 'distance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest Arrivals', value: 'newest' },
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const { theme } = useThemeStore();

  const [radius, setRadius] = useState<number>(filters.radius_km ?? 25);
  const [minPrice, setMinPrice] = useState<string>(filters.min_price?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState<string>(filters.max_price?.toString() ?? '');
  const [qualityTier, setQualityTier] = useState<QualityTier | undefined>(filters.quality_tier);
  const [sortBy, setSortBy] = useState<ProductFilters['sort_by']>(filters.sort_by ?? 'relevance');

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      radius_km: radius,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      quality_tier: qualityTier,
      sort_by: sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setRadius(25);
    setMinPrice('');
    setMaxPrice('');
    setQualityTier(undefined);
    setSortBy('relevance');
    onResetFilters();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter & Sort Products">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Proximity Radius */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
          PROXIMITY RADIUS ({radius} KM)
        </Text>
        <View style={styles.chipRow}>
          {RADII.map((r) => {
            const isSelected = radius === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRadius(r)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? colors.primary[500] : theme.card,
                    borderColor: isSelected ? colors.primary[500] : theme.border,
                  },
                ]}
              >
                <Text variant="bodyMedium" bold={isSelected} color={isSelected ? colors.neutral[0] : theme.text}>
                  {r} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Range */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
          PRICE RANGE (XAF)
        </Text>
        <View style={styles.priceRow}>
          <Input
            placeholder="Min Price"
            keyboardType="number-pad"
            value={minPrice}
            onChangeText={setMinPrice}
            containerStyle={styles.priceInput}
          />
          <Text variant="bodyMedium" secondary style={styles.dash}>
            —
          </Text>
          <Input
            placeholder="Max Price"
            keyboardType="number-pad"
            value={maxPrice}
            onChangeText={setMaxPrice}
            containerStyle={styles.priceInput}
          />
        </View>

        {/* Quality Tier */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
          QUALITY CONDITION
        </Text>
        <View style={styles.chipRow}>
          {Object.values(QualityTier).map((tier) => {
            const isSelected = qualityTier === tier;
            return (
              <TouchableOpacity
                key={tier}
                onPress={() => setQualityTier(isSelected ? undefined : tier)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? colors.primary[500] : theme.card,
                    borderColor: isSelected ? colors.primary[500] : theme.border,
                  },
                ]}
              >
                <Text variant="bodyMedium" bold={isSelected} color={isSelected ? colors.neutral[0] : theme.text}>
                  {tier.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sort By */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
          SORT RESULTS BY
        </Text>
        <View style={styles.sortList}>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSortBy(opt.value)}
                style={[
                  styles.sortItem,
                  { borderColor: isSelected ? colors.primary[500] : theme.border },
                  isSelected && { backgroundColor: colors.primary[50] },
                ]}
              >
                <Text variant="bodyMedium" bold={isSelected} color={isSelected ? colors.primary[700] : theme.text}>
                  {opt.label}
                </Text>
                {isSelected && <Text variant="bodyMedium" color={colors.primary[500]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Reset All"
            variant="ghost"
            fullWidth={false}
            onPress={handleReset}
            style={styles.actionBtn}
          />
          <Button
            title="Apply Filters"
            variant="primary"
            fullWidth={false}
            onPress={handleApply}
            style={[styles.actionBtn, { flex: 1 }]}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
  dash: {
    marginHorizontal: spacing.xs,
  },
  sortList: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    minWidth: 100,
  },
});
