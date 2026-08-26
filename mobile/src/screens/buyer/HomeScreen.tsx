import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Input, Badge, ScreenContainer, Card } from '../../components/ui';
import { CategoryChip } from '../../components/product/CategoryChip';
import { ProductGrid } from '../../components/product/ProductGrid';
import { ProductCategory, Product } from '@wunabuy/types';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { useCartStore } from '../../stores/cart.store';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const HomeScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);

  const categories: (ProductCategory | 'All')[] = ['All', ...Object.values(ProductCategory)];

  const filteredProducts = selectedCategory === 'All'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.locationRow}>
          <View>
            <Text variant="caption" secondary>
              DELIVERING TO
            </Text>
            <Text variant="bodyLarge" bold color={colors.primary[500]}>
              📍 Akwa, Douala ▾
            </Text>
          </View>

          {/* Cart Icon Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerCart')}
            style={[styles.cartButton, { backgroundColor: theme.input }]}
          >
            <Text variant="h3">🛒</Text>
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.cartBadgeText}>
                  {itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar Shortcut */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('BuyerSearch')}
        >
          <Input
            placeholder="Search verified products or stores..."
            editable={false}
            pointerEvents="none"
            containerStyle={styles.searchShortcut}
            leftIcon={<Text>🔍</Text>}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promo Banner Carousel */}
        <View style={styles.bannerContainer}>
          <Card style={styles.promoCard}>
            <Badge label="100% ESCROW PROTECTED" variant="success" size="small" />
            <Text variant="h2" bold color={colors.neutral[0]} style={styles.promoTitle}>
              Buy Safely with 48h Escrow Guarantee
            </Text>
            <Text variant="bodyMedium" color="rgba(255,255,255,0.9)" style={styles.promoSubtitle}>
              Funds are held securely until you receive and sign your delivery.
            </Text>
          </Card>
        </View>

        {/* Category Horizontal Slider */}
        <View style={styles.categorySection}>
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            EXPLORE CATEGORIES
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                category={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Near You Section Header */}
        <View style={styles.feedHeader}>
          <Text variant="h2" bold>
            Near You in Douala
          </Text>
          <Text variant="caption" secondary>
            Sorted by spatial PostGIS distance & store rating
          </Text>
        </View>

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onSelectProduct={handleSelectProduct}
        />
      </ScrollView>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.semantic.error[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
  },
  searchShortcut: {
    marginBottom: spacing.xs,
  },
  bannerContainer: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
  },
  promoCard: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  promoTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  promoSubtitle: {
    lineHeight: 18,
  },
  categorySection: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  categoryScroll: {
    paddingHorizontal: spacing.base,
  },
  feedHeader: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});

