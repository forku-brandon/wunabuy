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
import { Text, Input } from '../../components/ui';
import { CategoryChip } from '../../components/product/CategoryChip';
import { ProductCard } from '../../components/product/ProductCard';
import { HeroCarousel } from '../../components/home/HeroCarousel';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const displayCategories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Tools', 'Offers'];

  const filteredProducts =
    selectedCategory === 'All'
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => {
          if (selectedCategory === 'Skincare' || selectedCategory === 'Makeup' || selectedCategory === 'Fragrance') {
            return p.category === ProductCategory.HEALTH_BEAUTY;
          }
          return p.category === selectedCategory;
        });

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
      {/* Top Header Row */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: theme.background,
            paddingTop: Math.max(insets.top + spacing.xs, spacing.md),
          },
        ]}
      >
        <View style={styles.headerLeftStack}>
          {/* Square Soft-Shadow Menu Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.squareMenuBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('BuyerProfile')}
          >
            <Ionicons name="menu-outline" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.greetingStack}>
            <Text variant="caption" color={colors.primary[500]} bold style={styles.greetingEyebrow}>
              Hello, {firstName}! ✨
            </Text>
            <Text variant="h1" bold style={styles.greetingTitle}>
              Discover Products
            </Text>
            <Text variant="caption" secondary style={styles.greetingSubtitle}>
              48-hour escrow protection on every purchase
            </Text>
          </View>
        </View>

        {/* Right Icon Buttons: Notification Bell with Badge + Shopping Bag */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.iconActionBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
            <View style={styles.notifBadge}>
              <Text variant="caption" bold color={colors.neutral[0]} style={styles.notifBadgeText}>
                3
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerCart')}
            style={[styles.iconActionBtn, { backgroundColor: theme.card }]}
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
        </View>
      </View>

      {/* Active Interactive Auto-Scrolling Hero Banner Carousel */}
      <View style={styles.carouselSection}>
        <HeroCarousel onPressBanner={() => navigation.navigate('BuyerSearch')} />
      </View>

      {/* Search Bar & Filter Button */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchFlex}
          onPress={() => navigation.navigate('BuyerSearch')}
        >
          <Input
            placeholder="Search for products..."
            editable={false}
            pointerEvents="none"
            containerStyle={styles.searchShortcut}
            leftIcon={<Ionicons name="search-outline" size={20} color={theme.placeholder} />}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BuyerSearch')}
          style={[styles.filterButton, { backgroundColor: theme.card }]}
        >
          <Ionicons name="options-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Shop by Category Circular Avatar Slider */}
      <View style={styles.categorySection}>
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

      {/* "Best Sellers" Horizontal Scroll Section */}
      <View style={styles.bestSellersHeader}>
        <Text variant="h2" bold style={styles.sectionTitleText}>
          Best Sellers
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('BuyerSearch')}>
          <View style={styles.viewAllRow}>
            <Text variant="bodyMedium" bold color={colors.primary[500]}>
              View All
            </Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary[500]} style={{ marginLeft: 3 }} />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            horizontal={true}
            onPress={handleSelectProduct}
          />
        )}
      />

      {/* "Special Offer" Promo Card */}
      <View style={styles.specialOfferSection}>
        <View style={[styles.offerCard, { backgroundColor: isDark ? '#1E293B' : colors.primary[50] }]}>
          <View style={styles.offerTextCol}>
            <Text variant="caption" bold color={colors.primary[500]} style={styles.offerEyebrow}>
              Special Offer
            </Text>
            <Text variant="h1" bold style={styles.offerTitle}>
              Up to 30% Off
            </Text>
            <Text variant="caption" secondary style={styles.offerSub}>
              On selected beauty &amp; verified essentials
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('BuyerSearch')}
              style={styles.grabNowBtn}
            >
              <Text variant="caption" bold color={colors.neutral[900]} style={styles.grabNowText}>
                Grab Now
              </Text>
              <View style={styles.grabArrowCircle}>
                <Ionicons name="arrow-forward" size={12} color={colors.neutral[0]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Right Product Graphic Composition with Circular 30% Off Badge */}
          <View style={styles.offerGraphicCol}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80' }}
              style={styles.offerImage}
              resizeMode="cover"
            />
            <View style={styles.discountBadgeCircle}>
              <Text variant="caption" bold color={colors.primary[500]} style={styles.discountPercentText}>
                30%
              </Text>
              <Text variant="caption" bold color={colors.primary[500]} style={styles.discountOffText}>
                OFF
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Explore All Products Catalog Grid Header (Below Special Offer Section) */}
      <View style={styles.gridSectionHeader}>
        <Text variant="h2" bold style={styles.sectionTitleText}>
          Explore Verified Items
        </Text>
        <Text variant="caption" secondary>
          Sorted by spatial distance &amp; store rating in Douala
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
  topHeader: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    flex: 1,
  },
  squareMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  greetingStack: {
    justifyContent: 'center',
  },
  greetingEyebrow: {
    fontSize: 11,
    marginBottom: 1,
  },
  greetingTitle: {
    fontSize: 22,
    lineHeight: 26,
  },
  greetingSubtitle: {
    fontSize: 10,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  iconActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.sm,
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifBadgeText: {
    fontSize: 9,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.semantic.error[500],
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cartBadgeText: {
    fontSize: 9,
  },
  carouselSection: {
    paddingHorizontal: spacing.base,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
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
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryScroll: {
    paddingHorizontal: spacing.base,
  },
  bestSellersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm + 2,
  },
  sectionTitleText: {
    fontSize: 20,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalScrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  specialOfferSection: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  offerCard: {
    borderRadius: 24,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  offerTextCol: {
    flex: 1.2,
    paddingRight: spacing.xs,
  },
  offerEyebrow: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 2,
  },
  offerSub: {
    fontSize: 10,
    marginBottom: spacing.md,
  },
  grabNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  grabNowText: {
    fontSize: 11,
    marginRight: spacing.xs,
  },
  grabArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerGraphicCol: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  discountBadgeCircle: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  discountPercentText: {
    fontSize: 11,
    lineHeight: 12,
  },
  discountOffText: {
    fontSize: 9,
    lineHeight: 10,
  },
  gridSectionHeader: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },
  cardWrapper: {
    width: '48%',
  },
});
