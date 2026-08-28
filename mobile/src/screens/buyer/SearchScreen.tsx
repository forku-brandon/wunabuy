import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Input, Badge } from '../../components/ui';
import { CategoryChip } from '../../components/product/CategoryChip';
import { ProductGrid } from '../../components/product/ProductGrid';
import { FilterBottomSheet } from '../../components/product/FilterBottomSheet';
import { Product, ProductCategory } from '@wunabuy/types';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { ProductFilters } from '@wunabuy/api-client';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const SearchScreen = ({ navigation, route }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(route.params?.query ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string>(route.params?.category ?? 'All');
  const [filters, setFilters] = useState<ProductFilters>({
    radius_km: 25,
    sort_by: 'relevance',
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const displayCategories = [
    'All',
    'Skincare',
    'Makeup',
    'Fragrance',
    'Haircare',
    'Tools',
    'Offers',
    ProductCategory.ELECTRONICS,
    ProductCategory.FASHION,
    ProductCategory.FOOD_GROCERIES,
    ProductCategory.HOME_GARDEN,
    ProductCategory.HEALTH_BEAUTY,
    ProductCategory.AUTOMOTIVE,
  ];

  // Filter products based on selected category, search query & bottom sheet filters
  const searchResults = MOCK_PRODUCTS.filter((p) => {
    // Category Manual Scroll Bar Filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Skincare' || selectedCategory === 'Makeup' || selectedCategory === 'Fragrance') {
        if (p.category !== ProductCategory.HEALTH_BEAUTY) return false;
      } else if (p.category !== selectedCategory) {
        return false;
      }
    }

    // Text Query Filter
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

  const [refreshing, setRefreshing] = useState(false);

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const hasActiveFilters =
    filters.quality_tier !== undefined ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    (filters.radius_km !== undefined && filters.radius_km !== 25);

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Search Header Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top + spacing.xs, spacing.md),
          },
        ]}
      >
        <View style={styles.searchRow}>
          <Input
            placeholder="Search categories, items or stores..."
            value={query}
            onChangeText={setQuery}
            containerStyle={styles.searchInput}
            leftIcon={<Ionicons name="search-outline" size={20} color={theme.placeholder} />}
            rightIcon={
              query ? (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.placeholder} />
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
                backgroundColor: hasActiveFilters ? colors.primary[500] : theme.card,
                borderColor: hasActiveFilters ? colors.primary[500] : theme.border,
              },
              !isDark && shadows.sm,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={hasActiveFilters ? colors.neutral[0] : theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Active Filter Badges */}
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

      {/* Manual Category Avatar Scroll Bar Section (Placed Directly Below Search Section) */}
      <View style={styles.categoryScrollSection}>
        <FlatList
          horizontal
          data={displayCategories}
          keyExtractor={(cat) => cat}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item: cat }) => (
            <CategoryChip
              category={cat as any}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          )}
        />
      </View>

      {/* Results Count Header */}
      <View style={styles.resultsHeader}>
        <Text variant="bodyMedium" bold style={styles.resultsTitle}>
          {selectedCategory === 'All' ? 'All Verified Categories' : selectedCategory}
        </Text>
        <Text variant="caption" secondary>
          {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'} available
        </Text>
      </View>

      {/* Product Results Grid */}
      <ProductGrid
        products={searchResults}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onSelectProduct={handleSelectProduct}
        emptyTitle="No Category Items Found"
        emptyDescription="Try selecting another category chip or clear your search filters."
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
    paddingBottom: spacing.xs + 2,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  categoryScrollSection: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  categoryScroll: {
    paddingHorizontal: spacing.base,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.xs,
  },
  resultsTitle: {
    fontSize: 16,
  },
});
