import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Input, Button, Badge } from '../../components/ui';
import { ProductGrid } from '../../components/product/ProductGrid';
import { FilterBottomSheet } from '../../components/product/FilterBottomSheet';
import { Product } from '@wunabuy/types';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { ProductFilters } from '@wunabuy/api-client';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const SearchScreen = ({ navigation, route }: any) => {
  const { theme } = useThemeStore();
  const [query, setQuery] = useState(route.params?.query ?? '');
  const [filters, setFilters] = useState<ProductFilters>({
    radius_km: 25,
    sort_by: 'relevance',
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter products based on search query & bottom sheet filters
  const searchResults = MOCK_PRODUCTS.filter((p) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      const categoryMatch = p.category.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !categoryMatch) return false;
    }

    if (filters.quality_tier && p.quality_tier !== filters.quality_tier) {
      return false;
    }

    if (filters.min_price && p.price < filters.min_price) {
      return false;
    }

    if (filters.max_price && p.price > filters.max_price) {
      return false;
    }

    if (filters.radius_km && p.distance_km && p.distance_km > filters.radius_km) {
      return false;
    }

    return true;
  });

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const hasActiveFilters =
    filters.quality_tier !== undefined ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    (filters.radius_km !== undefined && filters.radius_km !== 25);

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Search Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.searchRow}>
          <Input
            placeholder="Search items or stores..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            containerStyle={styles.searchInput}
            leftIcon={<Text>🔍</Text>}
            rightIcon={
              query ? (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Text variant="bodyLarge" secondary>✕</Text>
                </TouchableOpacity>
              ) : undefined
            }
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsFilterModalOpen(true)}
            style={[
              styles.filterButton,
              {
                backgroundColor: hasActiveFilters ? colors.primary[500] : theme.input,
                borderColor: hasActiveFilters ? colors.primary[500] : theme.border,
              },
            ]}
          >
            <Text variant="bodyLarge" color={hasActiveFilters ? colors.neutral[0] : theme.text}>
              ⚙️
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersRow}>
            <Text variant="caption" secondary style={{ marginRight: 4 }}>
              Active:
            </Text>
            {filters.radius_km !== 25 && (
              <Badge label={`< ${filters.radius_km}km`} variant="primary" size="small" />
            )}
            {filters.quality_tier && (
              <Badge label={filters.quality_tier} variant="info" size="small" />
            )}
            {(filters.min_price || filters.max_price) && (
              <Badge label="Price Filter" variant="warning" size="small" />
            )}
          </View>
        )}
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text variant="bodyMedium" bold secondary>
          {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
        </Text>
      </View>

      {/* Product Results Grid */}
      <ProductGrid
        products={searchResults}
        onSelectProduct={handleSelectProduct}
        emptyTitle="No Matching Products"
        emptyDescription="We couldn't find any items matching your search criteria in Douala."
      />

      <FilterBottomSheet
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onResetFilters={() => setFilters({ radius_km: 25, sort_by: 'relevance' })}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  resultsHeader: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
});
