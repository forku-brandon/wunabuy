import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useCartStore } from '../../stores/cart.store';
import { useFollowedStoresStore, FollowedStoreData } from '../../stores/followedStores.store';
import { formatXAF } from '@wunabuy/utils';
import { Product, ProductCategory, QualityTier } from '@wunabuy/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StoreTab = 'home' | 'products' | 'reviews' | 'about';

// Sample Store Data Fallback
const SAMPLE_STORE_DATA: FollowedStoreData = {
  id: 'store_101',
  name: 'Douala Tech Hub (Akwa)',
  category: 'Electronics & Smart Devices',
  rating_avg: 4.9,
  total_reviews: 1420,
  followers_count: 2840,
  is_verified: true,
  avatar_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
  cover_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
  location: 'Rue Joss, Akwa, Douala, Cameroon (1.2 km away)',
  followedAt: new Date().toISOString(),
  featured_products: [],
};

const SAMPLE_STORE_PRODUCTS: Product[] = [
  {
    id: 'sp_1',
    store_id: 'store_101',
    name: 'Samsung Galaxy A54 5G (128GB)',
    description: 'Crisp Super AMOLED 120Hz display, 50MP OIS camera, 5000mAh battery with fast charging.',
    category: ProductCategory.ELECTRONICS,
    price: 185000,
    currency: 'XAF',
    quantity: 14,
    quality_tier: QualityTier.NEW,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    ],
    is_active: true,
    rating_avg: 4.8,
    total_reviews: 32,
    distance_km: 1.2,
    store: { id: 'store_101', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
  {
    id: 'sp_2',
    store_id: 'store_101',
    name: 'Wireless Bluetooth Earbuds Pro ANC',
    description: 'Active noise cancellation, deep bass, 30h battery life with wireless charging case.',
    category: ProductCategory.ELECTRONICS,
    price: 25000,
    currency: 'XAF',
    quantity: 8,
    quality_tier: QualityTier.NEW,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    ],
    is_active: true,
    rating_avg: 4.6,
    total_reviews: 19,
    distance_km: 1.2,
    store: { id: 'store_101', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-21T11:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
  {
    id: 'sp_3',
    store_id: 'store_101',
    name: '4K Ultra HD Action Camera + Accessories',
    description: 'Waterproof up to 30m, dual screens, image stabilization, WiFi app control.',
    category: ProductCategory.ELECTRONICS,
    price: 45000,
    currency: 'XAF',
    quantity: 6,
    quality_tier: QualityTier.LIKE_NEW,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
    ],
    is_active: true,
    rating_avg: 4.7,
    total_reviews: 14,
    distance_km: 1.2,
    store: { id: 'store_101', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-22T09:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
  {
    id: 'sp_4',
    store_id: 'store_101',
    name: 'Fast Charging Power Bank 20000mAh',
    description: '22.5W Super Charge, dual USB + Type-C ports, LED digital display.',
    category: ProductCategory.ELECTRONICS,
    price: 18000,
    currency: 'XAF',
    quantity: 12,
    quality_tier: QualityTier.NEW,
    images: [
      'https://images.unsplash.com/photo-1609592424368-e4b2d18cbfe1?w=800',
    ],
    is_active: true,
    rating_avg: 4.9,
    total_reviews: 41,
    distance_km: 1.2,
    store: { id: 'store_101', store_name: 'Douala Tech Hub', rating_avg: 4.9, is_verified: true },
    created_at: '2026-08-23T14:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
  },
];

const SAMPLE_REVIEWS = [
  {
    id: 'rev_1',
    author: 'Jean-Paul K.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    rating: 5,
    date: 'Aug 28, 2026',
    comment: 'Extremely fast delivery in Akwa! The Samsung Galaxy A54 was 100% original factory sealed. Escrow protection gave me total peace of mind.',
    productName: 'Samsung Galaxy A54 5G',
  },
  {
    id: 'rev_2',
    author: 'Chantal Mballa',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    rating: 5,
    date: 'Aug 24, 2026',
    comment: 'Great store service! The seller answered all my questions within 5 minutes on chat. Will definitely buy again from Douala Tech Hub.',
    productName: 'Wireless Bluetooth Earbuds Pro ANC',
  },
  {
    id: 'rev_3',
    author: 'Samuel Ebode',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 4,
    date: 'Aug 18, 2026',
    comment: 'Action camera works perfectly. Package arrived well packed by the express rider.',
    productName: '4K Ultra HD Action Camera',
  },
];

export const StoreDetailScreen = ({ navigation, route }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const { addItem, getItemCount } = useCartStore();
  const { toggleFollow, isFollowing } = useFollowedStoresStore();

  const passedStore = route?.params?.store;
  const storeId = route?.params?.storeId || passedStore?.id || 'store_101';

  const storeInfo: FollowedStoreData = {
    ...SAMPLE_STORE_DATA,
    id: storeId,
    name: passedStore?.store_name || passedStore?.name || SAMPLE_STORE_DATA.name,
  };

  const following = isFollowing(storeInfo.id);

  const [activeTab, setActiveTab] = useState<StoreTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cartCount = getItemCount();

  const handleShareStore = async () => {
    try {
      await Share.share({
        message: `Check out ${storeInfo.name} on Wunabuy! Verified store with escrow protection: https://wunabuy.cm/store/${storeInfo.id}`,
      });
    } catch {
      setToastMessage('Store link copied to clipboard!');
    }
  };

  const handleToggleFollow = () => {
    toggleFollow(storeInfo);
    setToastMessage(following ? `Unfollowed ${storeInfo.name}` : `Following ${storeInfo.name}! 🌟`);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setToastMessage(`Added ${product.name} to cart! 🛒`);
  };

  const filteredProducts = SAMPLE_STORE_PRODUCTS.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' ||
      prod.category?.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* ── Top Clean Header Toolbar ─────────────────────────────────────────── */}
      <View style={[styles.headerBar, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.reset({ index: 0, routes: [{ name: 'BuyerApp' }] });
          }}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text variant="bodyLarge" bold numberOfLines={1}>
            {storeInfo.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary[500]} />
            <Text variant="caption" color={colors.primary[600]} bold style={{ fontSize: 11 }}>
              Official Verified Store
            </Text>
          </View>
        </View>

        <View style={styles.headerActionsRow}>
          <TouchableOpacity onPress={handleShareStore} style={styles.headerBtn}>
            <Ionicons name="share-social-outline" size={22} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('BuyerCart')} style={styles.headerBtn}>
            <Ionicons name="cart-outline" size={22} color={theme.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text variant="caption" bold color="#FFFFFF" style={{ fontSize: 9 }}>
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Scrollable Content ──────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* ── Store Cover Banner & Profile Card ────────────────────────────── */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: storeInfo.cover_url }} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.coverOverlay} />

          {/* Floating Store Profile Card */}
          <View style={[styles.storeProfileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.storeTopRow}>
              {/* Store Avatar */}
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: storeInfo.avatar_url }} style={styles.avatarImage} />
                <View style={styles.verifiedBadgeIcon}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="h2" bold numberOfLines={1}>
                  {storeInfo.name}
                </Text>
                <Text variant="caption" secondary numberOfLines={1} style={{ marginTop: 2 }}>
                  📍 {storeInfo.location}
                </Text>

                {/* Seller Badges */}
                <View style={styles.credentialsRow}>
                  <Badge label="🥇 GOLD SUPPLIER" variant="primary" size="small" />
                  <Badge label="🏬 VERIFIED STORE" variant="success" size="small" />
                </View>
              </View>
            </View>

            {/* Seller Action Buttons */}
            <View style={styles.storeActionsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleToggleFollow}
                style={[
                  styles.followBtn,
                  {
                    backgroundColor: following ? (isDark ? colors.neutral[800] : colors.neutral[200]) : colors.primary[500],
                    borderColor: following ? theme.border : colors.primary[500],
                  },
                ]}
              >
                <Ionicons
                  name={following ? 'checkmark' : 'add'}
                  size={16}
                  color={following ? theme.text : '#FFFFFF'}
                />
                <Text variant="caption" bold color={following ? theme.text : '#FFFFFF'} style={{ marginLeft: 4 }}>
                  {following ? 'Following' : '+ Follow Store'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ChatConversation', { conversationId: `conv_${storeInfo.id}` })}
                style={[styles.chatBtn, { borderColor: colors.primary[500], backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#ECFDF5' }]}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary[600]} />
                <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 4 }}>
                  Chat Seller
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setToastMessage(`Calling ${storeInfo.name}...`)}
                style={[styles.callBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
              >
                <Ionicons name="call-outline" size={16} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* De-cluttered 2x2 Seller Telemetry Grid */}
            <View style={styles.telemetryGrid}>
              <View style={[styles.telemetryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color={colors.accent[500]} />
                  <Text variant="bodyMedium" bold>
                    {storeInfo.rating_avg.toFixed(1)} / 5.0
                  </Text>
                </View>
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  {storeInfo.total_reviews} Reviews
                </Text>
              </View>

              <View style={[styles.telemetryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text variant="bodyMedium" bold color={colors.primary[600]}>
                  99.4%
                </Text>
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  On-Time Shipping Rate
                </Text>
              </View>

              <View style={[styles.telemetryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text variant="bodyMedium" bold color={colors.semantic.success[500]}>
                  &lt; 10 Mins
                </Text>
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  Seller Response Time
                </Text>
              </View>

              <View style={[styles.telemetryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text variant="bodyMedium" bold>
                  {(storeInfo.followers_count + (following ? 1 : 0)).toLocaleString()}
                </Text>
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  Store Followers
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Spacious Prominent Store Search Bar ──────────────────────────────── */}
        <View style={styles.searchSectionWrapper}>
          <View style={[styles.spaciousSearchBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }]}>
            <Ionicons name="search" size={18} color={colors.primary[500]} style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search products inside ${storeInfo.name}...`}
              placeholderTextColor={theme.textTertiary}
              style={[styles.spaciousSearchInput, { color: theme.text }]}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Escrow Guarantee Trust Banner ───────────────────────────────────── */}
        <View style={[styles.trustBanner, { backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#ECFDF5', borderColor: colors.primary[400] }]}>
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary[600]} />
            <Text variant="caption" bold color={colors.primary[700]} style={{ flex: 1, marginLeft: 6 }}>
              🔒 Wunabuy 48-Hour Escrow Protection Guaranteed
            </Text>
          </View>
          <Text variant="caption" secondary style={{ marginTop: 4, fontSize: 11, lineHeight: 16 }}>
            Funds are locked safely until you inspect and accept your parcel upon delivery in Douala &amp; Yaoundé.
          </Text>
        </View>

        {/* ── 4-Tab Navigation Bar ───────────────────────────────────────────── */}
        <View style={[styles.tabBarContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          {[
            { key: 'home', label: '🏠 Overview' },
            { key: 'products', label: `🛍️ Catalog (${SAMPLE_STORE_PRODUCTS.length})` },
            { key: 'reviews', label: `⭐ Reviews (${SAMPLE_REVIEWS.length})` },
            { key: 'about', label: 'ℹ️ Store Info' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.key as StoreTab)}
                style={[
                  styles.tabBarItem,
                  { borderBottomColor: isActive ? colors.primary[500] : 'transparent' },
                ]}
              >
                <Text
                  variant="caption"
                  bold={isActive}
                  color={isActive ? colors.primary[600] : theme.textSecondary}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────────── */}
        {activeTab === 'home' && (
          <View style={styles.tabContentContainer}>
            {/* Promo Banner Card */}
            <Card style={[styles.promoBannerCard, { backgroundColor: isDark ? colors.neutral[800] : '#FFFBEB', borderColor: colors.accent[400] }]}>
              <View style={styles.promoHeader}>
                <Badge label="⚡ SPECIAL STORE PROMO" variant="warning" size="small" />
                <Text variant="caption" bold color={colors.accent[600]}>
                  LIMITED TIME SALE
                </Text>
              </View>
              <Text variant="h2" bold style={{ marginTop: spacing.xs }}>
                Grand Electronics Clearance • Up to 25% OFF
              </Text>
              <Text variant="caption" secondary style={{ marginTop: 4 }}>
                All purchases protected by 48-hour escrow. Fast delivery across Douala &amp; Yaoundé.
              </Text>
            </Card>

            {/* Store Story Card */}
            <Card style={styles.storyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                <Ionicons name="ribbon-outline" size={20} color={colors.primary[500]} />
                <Text variant="bodyLarge" bold style={{ marginLeft: spacing.xs }}>
                  About {storeInfo.name}
                </Text>
              </View>
              <Text variant="bodyMedium" secondary style={{ lineHeight: 20 }}>
                Douala Tech Hub is a premier certified merchant specializing in authentic smartphones, wireless audio, laptops, and original consumer electronics in Akwa, Douala. Serving over 5,000+ satisfied buyers across Cameroon with official brand warranties and escrow guarantee.
              </Text>
            </Card>

            {/* Top Selling Products */}
            <View style={styles.sectionHeaderRow}>
              <Text variant="h2" bold>
                🔥 Top Selling Products
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('products')}>
                <Text variant="caption" bold color={colors.primary[600]}>
                  See All ({SAMPLE_STORE_PRODUCTS.length}) ›
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productsGrid}>
              {SAMPLE_STORE_PRODUCTS.slice(0, 4).map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('ProductDetail', { product: prod })}
                  style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <Image source={{ uri: prod.images[0] }} style={styles.productImage} />
                  <View style={styles.productCardBody}>
                    <Text variant="caption" secondary bold numberOfLines={1}>
                      {prod.category}
                    </Text>
                    <Text variant="bodyMedium" bold numberOfLines={2} style={{ marginTop: 2 }}>
                      {prod.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text variant="bodyLarge" bold color={colors.primary[600]}>
                        {formatXAF(prod.price)}
                      </Text>
                    </View>

                    <View style={styles.productFooterRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Ionicons name="star" size={12} color={colors.accent[500]} />
                        <Text variant="caption" bold>
                          {prod.rating_avg}
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleAddToCart(prod)}
                        style={styles.quickAddBtn}
                      >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── TAB 2: CATALOG ─────────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <View style={styles.tabContentContainer}>
            {/* Category Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
              {['All', 'Electronics', 'Phones', 'Audio', 'Accessories'].map((cat) => {
                const isSelected = selectedCategoryFilter === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategoryFilter(cat)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? colors.primary[500] : theme.card,
                        borderColor: isSelected ? colors.primary[500] : theme.border,
                      },
                    ]}
                  >
                    <Text variant="caption" bold color={isSelected ? '#FFFFFF' : theme.text}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.productsGrid}>
              {filteredProducts.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('ProductDetail', { product: prod })}
                  style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <Image source={{ uri: prod.images[0] }} style={styles.productImage} />
                  <View style={styles.productCardBody}>
                    <Text variant="caption" secondary bold numberOfLines={1}>
                      {prod.category}
                    </Text>
                    <Text variant="bodyMedium" bold numberOfLines={2} style={{ marginTop: 2 }}>
                      {prod.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text variant="bodyLarge" bold color={colors.primary[600]}>
                        {formatXAF(prod.price)}
                      </Text>
                    </View>

                    <View style={styles.productFooterRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Ionicons name="star" size={12} color={colors.accent[500]} />
                        <Text variant="caption" bold>
                          {prod.rating_avg}
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleAddToCart(prod)}
                        style={styles.quickAddBtn}
                      >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── TAB 3: REVIEWS ─────────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <View style={styles.tabContentContainer}>
            {/* Rating Breakdown Header */}
            <Card style={styles.ratingSummaryCard}>
              <View style={styles.ratingLeftCol}>
                <Text style={styles.bigRatingText}>4.9</Text>
                <View style={{ flexDirection: 'row', gap: 2, marginVertical: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={16} color={colors.accent[500]} />
                  ))}
                </View>
                <Text variant="caption" secondary>
                  Based on 1,420 Verified Buyer Reviews
                </Text>
              </View>

              <View style={styles.ratingRightCol}>
                {[
                  { star: '5★', pct: 88 },
                  { star: '4★', pct: 9 },
                  { star: '3★', pct: 2 },
                  { star: '2★', pct: 1 },
                  { star: '1★', pct: 0 },
                ].map((row, idx) => (
                  <View key={idx} style={styles.starBarRow}>
                    <Text variant="caption" secondary style={{ width: 22 }}>
                      {row.star}
                    </Text>
                    <View style={styles.starBarTrack}>
                      <View style={[styles.starBarFill, { width: `${row.pct}%` }]} />
                    </View>
                    <Text variant="caption" secondary style={{ width: 28, textAlign: 'right' }}>
                      {row.pct}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <View style={{ gap: spacing.md }}>
              {SAMPLE_REVIEWS.map((rev) => (
                <Card key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: rev.avatar }} style={styles.reviewerAvatar} />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text variant="bodyMedium" bold>
                        {rev.author}
                      </Text>
                      <Text variant="caption" secondary>
                        {rev.date} • Verified Escrow Purchase
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Ionicons key={i} name="star" size={14} color={colors.accent[500]} />
                      ))}
                    </View>
                  </View>

                  <Text variant="bodyMedium" style={{ marginVertical: spacing.xs, lineHeight: 20 }}>
                    "{rev.comment}"
                  </Text>

                  <Badge label={`Purchased: ${rev.productName}`} variant="info" size="small" />
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* ── TAB 4: STORE INFO & POLICIES ──────────────────────────────────── */}
        {activeTab === 'about' && (
          <View style={styles.tabContentContainer}>
            <Card style={styles.infoSectionCard}>
              <Text variant="h2" bold style={{ marginBottom: spacing.sm }}>
                Business Identification &amp; KYC
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="storefront-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text variant="caption" secondary>
                    Store Name
                  </Text>
                  <Text variant="bodyMedium" bold>
                    {storeInfo.name}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text variant="caption" secondary>
                    Physical Store Address
                  </Text>
                  <Text variant="bodyMedium" bold>
                    {storeInfo.location}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.semantic.success[500]} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text variant="caption" secondary>
                    KYC Compliance Status
                  </Text>
                  <Text variant="bodyMedium" bold color={colors.semantic.success[500]}>
                    ✓ Approved &amp; Verified Merchant (CNI + Storefront Inspection)
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.infoSectionCard}>
              <Text variant="h2" bold style={{ marginBottom: spacing.sm }}>
                Store Fulfillment &amp; Return Policies
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text variant="caption" secondary>
                    Operating Hours
                  </Text>
                  <Text variant="bodyMedium" bold>
                    Monday – Saturday: 08:00 AM – 07:00 PM (WAT)
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="repeat-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text variant="caption" secondary>
                    Escrow Dispute &amp; Return Policy
                  </Text>
                  <Text variant="bodyMedium" bold>
                    7-Day Return Guarantee for defective or wrong items. Funds locked in escrow until verified.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* ── Sticky Bottom Action Bar ────────────────────────────────────────── */}
      <View style={[styles.bottomActionBar, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ChatConversation', { conversationId: `conv_${storeInfo.id}` })}
          style={[styles.bottomChatBtn, { borderColor: theme.border }]}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.text} />
          <Text variant="bodyMedium" bold style={{ marginLeft: 6 }}>
            Chat
          </Text>
        </TouchableOpacity>

        <Button
          title="🛒 Explore Store Catalog"
          variant="primary"
          onPress={() => setActiveTab('products')}
          style={{ flex: 1, backgroundColor: colors.primary[500] }}
        />
      </View>

      {toastMessage && <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroWrapper: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 160,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  storeProfileCard: {
    marginHorizontal: spacing.base,
    marginTop: -36,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1,
    ...shadows.md,
  },
  storeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: colors.primary[500],
  },
  verifiedBadgeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  credentialsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  storeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  telemetryBox: {
    width: '48.5%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchSectionWrapper: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
  },
  spaciousSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
  },
  spaciousSearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  trustBanner: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tabBarItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 2.5,
    paddingHorizontal: spacing.xs,
  },
  tabContentContainer: {
    padding: spacing.base,
  },

  promoBannerCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  storyCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  filterChipsRow: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  productCard: {
    width: (SCREEN_WIDTH - spacing.base * 2 - spacing.md) / 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  productCardBody: {
    padding: spacing.sm,
  },
  priceRow: {
    marginTop: 4,
  },
  productFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  quickAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  ratingSummaryCard: {
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  ratingLeftCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  bigRatingText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  ratingRightCol: {
    flex: 1,
    paddingLeft: spacing.md,
    justifyContent: 'center',
    gap: 4,
  },
  starBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  starBarFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
  },
  reviewCard: {
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  infoSectionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.xs,
  },

  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  bottomChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
});
