import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Input, Badge, Avatar } from '../../components/ui';
import { CategoryChip } from '../../components/product/CategoryChip';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductCategory, Product } from '@wunabuy/types';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const HomeScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
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

  const firstName = user?.full_name?.split(' ')[0] || 'Jean';

  const ListHeader = (
    <>
      {/* Top Greeting & User Avatar Header (Matching Mockup Screen 1) */}
      <View style={[styles.header, { backgroundColor: theme.background, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.greetingRow}>
          <View>
            <Text variant="h1" bold style={styles.greetingTitle}>
              Hi, {firstName}!
            </Text>
            <Text variant="bodyMedium" secondary>
              Discover products you'll love in Douala
            </Text>
          </View>

          {/* Profile Avatar + Cart Shortcut */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BuyerCart')}
              style={[styles.cartButton, { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}
            >
              <Ionicons name="bag-handle-outline" size={20} color={theme.text} />
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text variant="caption" bold color={colors.neutral[0]} style={styles.cartBadgeText}>
                    {itemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('BuyerProfile')}>
              <Avatar url={user?.avatar_url} name={user?.full_name || 'User'} size={42} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Input with Filter Button (Matching Mockup Screen 1) */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.searchFlex}
            onPress={() => navigation.navigate('BuyerSearch')}
          >
            <Input
              placeholder="Search anything..."
              editable={false}
              pointerEvents="none"
              containerStyle={styles.searchShortcut}
              leftIcon={<Ionicons name="search-outline" size={20} color={theme.placeholder} />}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerSearch')}
            style={[styles.filterButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="options-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Collection Banner Card (Matching Mockup Screen 1) */}
      <View style={styles.bannerContainer}>
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
          <View style={styles.heroTextCol}>
            <Text variant="caption" bold color={colors.primary[600]} style={styles.eyebrow}>
              100% ESCROW GUARANTEE
            </Text>
            <Text variant="h1" bold style={styles.heroTitle}>
              New Arrivals Are Here
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.heroCtaBtn, { backgroundColor: theme.text }]}
              onPress={() => navigation.navigate('BuyerSearch')}
            >
              <Text variant="bodyMedium" bold color={theme.background}>
                Shop Now →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hero Feature Graphic */}
          <Image
            source={{ uri: MOCK_PRODUCTS[0]?.images[0] || 'https://via.placeholder.com/200' }}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Pagination Indicator Dots */}
          <View style={styles.bannerPagination}>
            <View style={[styles.bannerDot, styles.activeDot, { backgroundColor: colors.primary[500] }]} />
            <View style={[styles.bannerDot, { backgroundColor: theme.border }]} />
            <View style={[styles.bannerDot, { backgroundColor: theme.border }]} />
          </View>
        </View>
      </View>

      {/* Shop by Category Section (Matching Mockup Screen 1) */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="h2" bold>
            Shop by Category
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('BuyerSearch')}>
            <Text variant="bodyMedium" bold color={colors.primary[500]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

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

      {/* Deals of the Day Section (Matching Mockup Screen 1) */}
      <View style={styles.dealsSectionHeader}>
        <Text variant="h2" bold>
          Deals of the Day
        </Text>
        <View style={[styles.timerPill, { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
          <Ionicons name="time-outline" size={14} color={colors.semantic.error[500]} style={{ marginRight: 4 }} />
          <Text variant="caption" bold color={colors.semantic.error[500]}>
            08 : 45 : 32
          </Text>
        </View>
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
    paddingBottom: spacing.xs,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  greetingTitle: {
    fontSize: 24,
    lineHeight: 28,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.semantic.error[500],
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 9,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  searchFlex: {
    flex: 1,
  },
  searchShortcut: {
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContainer: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  heroCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTextCol: {
    flex: 1,
    paddingRight: spacing.sm,
    zIndex: 2,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  heroCtaBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  heroImage: {
    width: 110,
    height: 110,
    borderRadius: borderRadius.lg,
  },
  bannerPagination: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -20 }],
    flexDirection: 'row',
    gap: 4,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 16,
  },
  categorySection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  categoryScroll: {
    paddingHorizontal: spacing.base,
  },
  dealsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
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
