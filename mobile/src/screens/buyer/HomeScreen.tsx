import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Input, Badge, Card } from '../../components/ui';
import { CategoryChip } from '../../components/product/CategoryChip';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductCategory, Product } from '@wunabuy/types';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { useCartStore } from '../../stores/cart.store';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const HomeScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);

  const categories: (ProductCategory | 'All')[] = ['All', ...Object.values(ProductCategory)];

  const filteredProducts =
    selectedCategory === 'All'
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSelectProduct = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation]
  );

  /**
   * ListHeaderComponent for the FlatList — contains the sticky header,
   * promo banner, and category chips. This avoids the forbidden pattern of
   * nesting a FlatList inside a ScrollView.
   */
  const ListHeader = (
    <>
      {/* Sticky App Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.locationRow}>
          <View>
            <Text variant="caption" secondary>
              DELIVERING TO
            </Text>
            <Text variant="bodyLarge" bold color={colors.primary[500]}>
              📍 Akwa, Douala ▾
            </Text>
          </View>

          {/* Cart Icon with Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerCart')}
            style={[styles.cartButton, { backgroundColor: theme.input }]}
          >
            <Ionicons name="cart-outline" size={22} color={theme.text} />
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
            leftIcon={<Ionicons name="search-outline" size={18} color={theme.placeholder} />}
          />
        </TouchableOpacity>
      </View>

      {/* Promo Banner */}
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
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(cat) => cat}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item: cat }) => (
            <CategoryChip
              category={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          )}
        />
      </View>

      {/* Feed Section Header */}
      <View style={styles.feedHeader}>
        <Text variant="h2" bold>
          Near You in Douala
        </Text>
        <Text variant="caption" secondary>
          Sorted by spatial PostGIS distance &amp; store rating
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Products Found"
            description="Try adjusting your category filter or check back later."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} onPress={handleSelectProduct} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  listContent: {
    paddingBottom: spacing['2xl'],
  },
  cardWrapper: {
    width: '48%',
  },
});
