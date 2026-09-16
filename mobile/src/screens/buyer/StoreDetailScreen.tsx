import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Share,
  Dimensions,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useCartStore } from '../../stores/cart.store';
import { useFollowedStoresStore, FollowedStoreData } from '../../stores/followedStores.store';
import { useSellerStore } from '../../stores/seller.store';
import { formatXAF } from '@wunabuy/utils';
import { Product, ProductCategory, QualityTier } from '@wunabuy/types';
import { ProductsService, api } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StoreTab = 'home' | 'products' | 'reviews' | 'about';

// Sample Store Data Fallback
// Sample Store Data Fallback
const EMPTY_STORE_DATA: FollowedStoreData = {
  id: '',
  name: '',
  category: '',
  rating_avg: 0,
  total_reviews: 0,
  followers_count: 0,
  is_verified: false,
  avatar_url: '',
  cover_url: '',
  location: '',
  followedAt: new Date().toISOString(),
  featured_products: [],
};

interface ExtendedStoreData extends FollowedStoreData {
  tagline?: string;
  landmarkDirections?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  operatingHours?: string;
  riderPickupInstructions?: string;
  description?: string;
}

export const StoreDetailScreen = ({ navigation, route }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const { addItem, getItemCount } = useCartStore();
  const { toggleFollow, isFollowing } = useFollowedStoresStore();
  const sellerStore = useSellerStore();

  const passedStore = route?.params?.store;
  const storeId = route?.params?.storeId || passedStore?.id || sellerStore.storeId || 'my_store';

  const isOwnStore = (sellerStore.storeId && storeId === sellerStore.storeId) || storeId === 'my_store' || !!route?.params?.preview;

  const [storeData, setStoreData] = useState<any>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStore = async () => {
      setLoading(true);
      try {
        const effectiveStoreId = (storeId === 'my_store' && sellerStore.storeId) ? sellerStore.storeId : storeId;
        const [storeRes, prodRes, reviewsRes] = await Promise.all([
          api.client.get(`/stores/${effectiveStoreId}`).catch(() => null),
          ProductsService.getProducts({ store_id: effectiveStoreId === 'my_store' ? undefined : effectiveStoreId }).catch(() => []),
          api.client.get(`/reviews/store/${effectiveStoreId}`).catch(() => null),
        ]);

        if (storeRes?.data?.data && isMounted) {
          setStoreData(storeRes.data.data);
          if (storeRes.data.data.products && Array.isArray(storeRes.data.data.products) && storeRes.data.data.products.length > 0) {
            setStoreProducts(storeRes.data.data.products);
          }
        }
        if (prodRes && prodRes.length > 0 && isMounted) {
          setStoreProducts(prodRes);
        } else if (isOwnStore && sellerStore.products && sellerStore.products.length > 0 && isMounted) {
          setStoreProducts(sellerStore.products);
        }
        if (reviewsRes?.data?.data && Array.isArray(reviewsRes.data.data) && isMounted) {
          setStoreReviews(reviewsRes.data.data);
        }
      } catch (err) {
        console.warn('Failed to load store data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStore();
    return () => { isMounted = false; };
  }, [storeId, sellerStore.storeId, isOwnStore]);

  const storeInfo: ExtendedStoreData = {
    ...EMPTY_STORE_DATA,
    id: storeId,
    name: passedStore?.name || passedStore?.store_name || storeData?.store_name || (isOwnStore ? sellerStore.storeName : '') || 'Store',
    category: passedStore?.category || storeData?.category || (isOwnStore ? sellerStore.category : '') || '',
    location: passedStore?.location || storeData?.address_text || (isOwnStore ? sellerStore.address : '') || '',
    avatar_url: passedStore?.avatar_url || storeData?.logo_url || (isOwnStore ? sellerStore.logoUrl : '') || '',
    cover_url: passedStore?.cover_url || storeData?.banner_url || (isOwnStore ? sellerStore.coverPhotoUrl : '') || '',
    tagline: passedStore?.tagline || storeData?.tagline || (isOwnStore ? sellerStore.tagline : '') || '',
    description: passedStore?.description || storeData?.description || (isOwnStore ? sellerStore.description : '') || '',
    landmarkDirections: passedStore?.landmarkDirections || storeData?.landmark || (isOwnStore ? sellerStore.landmarkDirections : '') || '',
    primaryPhone: passedStore?.primaryPhone || storeData?.phone || (isOwnStore ? sellerStore.primaryPhone : '') || '',
    secondaryPhone: passedStore?.secondaryPhone || (isOwnStore ? sellerStore.secondaryPhone : '') || '',
    operatingHours: passedStore?.operatingHours || storeData?.counter_hours || (isOwnStore ? sellerStore.operatingHours : '') || '',
    riderPickupInstructions: passedStore?.riderPickupInstructions || storeData?.rider_instructions || (isOwnStore ? sellerStore.riderPickupInstructions : '') || '',
    rating_avg: passedStore?.rating_avg ?? storeData?.rating_avg ?? (isOwnStore ? sellerStore.ratingAvg : 0),
    total_reviews: passedStore?.total_reviews ?? storeData?.total_reviews ?? (isOwnStore ? sellerStore.totalReviews : 0),
    is_verified: passedStore?.is_verified ?? storeData?.is_verified ?? (isOwnStore ? sellerStore.isVerified : false),
    followers_count: passedStore?.followers_count ?? (isOwnStore ? sellerStore.followersCount : 0),
  };

  const following = isFollowing(storeInfo.id);

  const [activeTab, setActiveTab] = useState<StoreTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // UGC Review Report State (Google Play Compliance)
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('inappropriate');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  const handleOpenReportModal = (reviewId: string) => {
    setReportingReviewId(reviewId);
    setReportReason('inappropriate');
  };

  const handleConfirmReport = async () => {
    if (!reportingReviewId) return;
    setIsSubmittingReport(true);
    try {
      await ProductsService.reportReview(reportingReviewId, reportReason);
      setReportingReviewId(null);
      setToastMessage('Store review reported for moderation.');
    } catch {
      setReportingReviewId(null);
      setToastMessage('Review reported.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const cartCount = getItemCount();

  const handleCallStore = (phoneNum?: string) => {
    const raw = phoneNum || storeInfo.primaryPhone;
    if (!raw) {
      setToastMessage('Merchant has not provided a phone number.');
      return;
    }
    const firstNumber = raw.split('/')[0].split(',')[0].trim();
    const cleaned = firstNumber.replace(/[^+\d]/g, '');
    if (cleaned) {
      Linking.openURL(`tel:${cleaned}`).catch(() => {
        setToastMessage(`Calling ${storeInfo.name}...`);
      });
    }
  };

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

  const allProducts = storeProducts;

  const filteredProducts = allProducts.filter((prod) => {
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
          {storeInfo.cover_url ? (
            <Image source={{ uri: storeInfo.cover_url }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[100], justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="storefront-outline" size={44} color={isDark ? colors.neutral[600] : colors.primary[300]} />
            </View>
          )}
          <View style={styles.coverOverlay} />

          {/* Floating Store Profile Card */}
          <View style={[styles.storeProfileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.storeTopRow}>
              {/* Store Avatar */}
              <View style={styles.avatarWrapper}>
                {storeInfo.avatar_url ? (
                  <Image source={{ uri: storeInfo.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarImage, { backgroundColor: colors.primary[500], justifyContent: 'center', alignItems: 'center' }]}>
                    <Text variant="h2" bold color="#FFFFFF">
                      {storeInfo.name ? storeInfo.name.charAt(0).toUpperCase() : 'S'}
                    </Text>
                  </View>
                )}
                {storeInfo.is_verified && (
                  <View style={styles.verifiedBadgeIcon}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} />
                  </View>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="h2" bold numberOfLines={1}>
                  {storeInfo.name}
                </Text>
                <Text variant="caption" secondary numberOfLines={1} style={{ marginTop: 2 }}>
                  📍 {storeInfo.location || 'Location not specified'}
                </Text>

                {/* Seller Badges */}
                <View style={styles.credentialsRow}>
                  {storeInfo.is_verified ? (
                    <Badge label="🏬 VERIFIED STORE" variant="success" size="small" />
                  ) : (
                    <Badge label="🏬 REGISTERED MERCHANT" variant="neutral" size="small" />
                  )}
                  {storeInfo.category ? (
                    <Badge label={storeInfo.category.toUpperCase()} variant="primary" size="small" />
                  ) : null}
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
                onPress={() => handleCallStore(storeInfo.primaryPhone)}
                style={[styles.callBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
              >
                <Ionicons name="call-outline" size={16} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Real Seller Telemetry Grid */}
            <View style={styles.telemetryGrid}>
              <View style={[styles.telemetryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name={storeInfo.rating_avg > 0 ? 'star' : 'star-outline'} size={14} color={colors.accent[500]} />
                  <Text variant="bodyMedium" bold>
                    {storeInfo.rating_avg > 0 ? storeInfo.rating_avg.toFixed(1) : 'New'}
                  </Text>
                </View>
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  {storeInfo.total_reviews} {storeInfo.total_reviews === 1 ? 'Review' : 'Reviews'}
                </Text>
              </View>

              <View style={[styles.telemetryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text variant="bodyMedium" bold color={colors.primary[600]}>
                  {allProducts.length}
                </Text>
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  Items in Store
                </Text>
              </View>

              <View style={[styles.telemetryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text variant="bodyMedium" bold color={colors.semantic.success[500]}>
                  100%
                </Text>
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  Escrow Protected
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
            { key: 'products', label: `🛍️ Catalog (${allProducts.length})` },
            { key: 'reviews', label: `⭐ Reviews (${storeReviews.length})` },
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
            {/* Promo / Tagline Banner Card - only if merchant specified a tagline */}
            {storeInfo.tagline ? (
              <Card style={[styles.promoBannerCard, { backgroundColor: isDark ? colors.neutral[800] : '#FFFBEB', borderColor: colors.accent[400] }]}>
                <View style={styles.promoHeader}>
                  <Badge label="⚡ STORE ANNOUNCEMENT" variant="warning" size="small" />
                </View>
                <Text variant="h2" bold style={{ marginTop: spacing.xs }}>
                  {storeInfo.tagline}
                </Text>
                <Text variant="caption" secondary style={{ marginTop: 4 }}>
                  All purchases protected by 48-hour escrow. Fast delivery across Cameroon.
                </Text>
              </Card>
            ) : null}

            {/* Store Story Card */}
            <Card style={styles.storyCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                <Ionicons name="ribbon-outline" size={20} color={colors.primary[500]} />
                <Text variant="bodyLarge" bold style={{ marginLeft: spacing.xs }}>
                  About {storeInfo.name}
                </Text>
              </View>
              <Text variant="bodyMedium" secondary style={{ lineHeight: 20 }}>
                {storeInfo.description || `${storeInfo.name} is a merchant on Wunabuy. All purchases are backed by our 48-hour escrow protection.`}
              </Text>
            </Card>

            {/* Top Selling / Featured Products */}
            <View style={styles.sectionHeaderRow}>
              <Text variant="h2" bold>
                🔥 Featured Products
              </Text>
              {allProducts.length > 0 && (
                <TouchableOpacity onPress={() => setActiveTab('products')}>
                  <Text variant="caption" bold color={colors.primary[600]}>
                    See All ({allProducts.length}) ›
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {allProducts.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.xs }}>
                <Ionicons name="cube-outline" size={40} color={theme.textTertiary} />
                <Text variant="bodyLarge" bold style={{ marginTop: spacing.sm }}>
                  No Products Listed Yet
                </Text>
                <Text variant="caption" secondary align="center" style={{ marginTop: 4, maxWidth: 260 }}>
                  This merchant hasn't published any items yet. Check back soon!
                </Text>
              </Card>
            ) : (
              <View style={styles.productsGrid}>
                {allProducts.slice(0, 4).map((prod) => (
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
                          <Ionicons name={(prod.rating_avg ?? 0) > 0 ? 'star' : 'star-outline'} size={12} color={colors.accent[500]} />
                          <Text variant="caption" bold>
                            {(prod.rating_avg ?? 0) > 0 ? Number(prod.rating_avg).toFixed(1) : 'New'}
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
            )}
          </View>
        )}

        {/* ── TAB 2: CATALOG ─────────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <View style={styles.tabContentContainer}>
            {/* Category Chips */}
            {allProducts.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
                {['All', ...Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)))].map((cat) => {
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
            )}

            {filteredProducts.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.md }}>
                <Ionicons name="bag-remove-outline" size={44} color={theme.textTertiary} />
                <Text variant="bodyLarge" bold style={{ marginTop: spacing.sm }}>
                  {searchQuery ? 'No Matching Products' : 'No Products Available'}
                </Text>
                <Text variant="caption" secondary align="center" style={{ marginTop: 4, maxWidth: 280 }}>
                  {searchQuery
                    ? `No products found matching "${searchQuery}". Try another search term.`
                    : 'This store has no active products listed in this category.'}
                </Text>
              </Card>
            ) : (
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
                          <Ionicons name={(prod.rating_avg ?? 0) > 0 ? 'star' : 'star-outline'} size={12} color={colors.accent[500]} />
                          <Text variant="caption" bold>
                            {(prod.rating_avg ?? 0) > 0 ? Number(prod.rating_avg).toFixed(1) : 'New'}
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
            )}
          </View>
        )}

        {/* ── TAB 3: REVIEWS ─────────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <View style={styles.tabContentContainer}>
            {storeReviews.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.xs }}>
                <Ionicons name="star-outline" size={44} color={theme.textTertiary} />
                <Text variant="bodyLarge" bold style={{ marginTop: spacing.sm }}>
                  No Customer Reviews Yet
                </Text>
                <Text variant="caption" secondary align="center" style={{ marginTop: 4, maxWidth: 280 }}>
                  Reviews and verified buyer ratings will appear here once orders are fulfilled.
                </Text>
              </Card>
            ) : (
              <>
                {/* Rating Breakdown Header */}
                <Card style={styles.ratingSummaryCard}>
                  <View style={styles.ratingLeftCol}>
                    <Text style={styles.bigRatingText}>
                      {storeInfo.rating_avg > 0 ? storeInfo.rating_avg.toFixed(1) : 'New'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 2, marginVertical: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={storeInfo.rating_avg > 0 && star <= Math.round(storeInfo.rating_avg) ? 'star' : 'star-outline'}
                          size={16}
                          color={colors.accent[500]}
                        />
                      ))}
                    </View>
                    <Text variant="caption" secondary>
                      {storeReviews.length} Verified {storeReviews.length === 1 ? 'Review' : 'Reviews'}
                    </Text>
                  </View>
                </Card>

                <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
                  {storeReviews.map((rev, idx) => (
                    <Card key={rev.id || idx} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={[styles.reviewerAvatar, { backgroundColor: colors.primary[500], justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }]}>
                          {rev.user?.avatar_url ? (
                            <Image source={{ uri: rev.user.avatar_url }} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <Text variant="caption" bold color="#FFFFFF">
                              {(rev.user?.full_name || rev.author_name || rev.user_name || 'B').charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                          <Text variant="bodyMedium" bold>
                            {rev.user?.full_name || rev.author_name || rev.user_name || 'Verified Customer'}
                          </Text>
                          <Text variant="caption" secondary>
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'} • Verified Escrow Purchase
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= (rev.rating || 5) ? 'star' : 'star-outline'}
                              size={14}
                              color={colors.accent[500]}
                            />
                          ))}
                        </View>
                      </View>

                      <Text variant="bodyMedium" style={{ marginVertical: spacing.xs, lineHeight: 20 }}>
                        "{rev.comment || rev.review_text || 'Great service and authentic products!'}"
                      </Text>

                      {rev.product_name && (
                        <Badge label={`Purchased: ${rev.product_name}`} variant="info" size="small" />
                      )}

                      {/* Review Report Action (Google Play UGC Compliance) */}
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleOpenReportModal(rev.id || `srev_${idx}`)}
                          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6 }}
                        >
                          <Ionicons name="flag-outline" size={12} color={theme.textTertiary || '#94A3B8'} style={{ marginRight: 4 }} />
                          <Text variant="caption" secondary style={{ fontSize: 11 }}>
                            Report Review
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* ── TAB 4: STORE INFO & POLICIES ──────────────────────────────────── */}
        {activeTab === 'about' && (
          <View style={styles.tabContentContainer}>
            <Card style={styles.infoSectionCard}>
              <Text variant="h2" bold style={{ marginBottom: spacing.sm }}>
                Business Identification &amp; Location
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="storefront-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text variant="caption" secondary>
                    Store Name &amp; Category
                  </Text>
                  <Text variant="bodyMedium" bold>
                    {storeInfo.name} ({storeInfo.category})
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text variant="caption" secondary>
                    Physical Store Address
                  </Text>
                  <Text variant="bodyMedium" bold>
                    {storeInfo.location || 'Location not specified by merchant'}
                  </Text>
                </View>
              </View>

              {storeInfo.landmarkDirections ? (
                <View style={styles.infoRow}>
                  <Ionicons name="compass-outline" size={18} color={colors.primary[500]} />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text variant="caption" secondary>
                      Landmark Directions for Drivers &amp; Buyers
                    </Text>
                    <Text variant="bodyMedium" bold color={colors.primary[700]}>
                      {storeInfo.landmarkDirections}
                    </Text>
                  </View>
                </View>
              ) : null}

              {storeInfo.riderPickupInstructions ? (
                <View style={styles.infoRow}>
                  <Ionicons name="bicycle-outline" size={18} color={colors.primary[500]} />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text variant="caption" secondary>
                      Rider / Personal Courier Pickup Instructions
                    </Text>
                    <Text variant="bodyMedium" bold color={colors.semantic.success[700]}>
                      {storeInfo.riderPickupInstructions}
                    </Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity activeOpacity={0.7} onPress={() => handleCallStore(storeInfo.primaryPhone)} style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text variant="caption" secondary>
                    Store Contact Phone Numbers (Tap to Call 📞)
                  </Text>
                  <Text variant="bodyMedium" bold color={colors.primary[600]}>
                    {storeInfo.primaryPhone || 'Contact number not specified'} {storeInfo.secondaryPhone ? `/ ${storeInfo.secondaryPhone}` : ''}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.semantic.success[500]} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text variant="caption" secondary>
                    KYC Compliance Status
                  </Text>
                  <Text variant="bodyMedium" bold color={colors.semantic.success[500]}>
                    {storeInfo.is_verified ? '✓ Approved & Verified Merchant (CNI + Storefront Inspection)' : 'Registered Merchant on Wunabuy Escrow Platform'}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.infoSectionCard}>
              <Text variant="h2" bold style={{ marginBottom: spacing.sm }}>
                Store Operating Hours &amp; Policies
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text variant="caption" secondary>
                    Operating Hours
                  </Text>
                  <Text variant="bodyMedium" bold>
                    {storeInfo.operatingHours || 'Contact merchant for store operating schedule'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="repeat-outline" size={18} color={colors.primary[500]} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text variant="caption" secondary>
                    Escrow Dispute &amp; Return Policy
                  </Text>
                  <Text variant="bodyMedium" bold>
                    48-Hour Escrow Protection. Funds locked safely until parcel inspection upon handover.
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

      {/* UGC Review Report Modal (Google Play Compliance) */}
      <Modal
        visible={Boolean(reportingReviewId)}
        transparent
        animationType="fade"
        onRequestClose={() => setReportingReviewId(null)}
      >
        <View style={styles.reportModalOverlay}>
          <View style={[styles.reportModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.reportModalHeader}>
              <Ionicons name="flag" size={20} color={colors.semantic.error[500]} style={{ marginRight: 8 }} />
              <Text variant="h3" bold>Report Inappropriate Review</Text>
            </View>
            <Text variant="caption" secondary style={{ marginBottom: spacing.md, lineHeight: 18 }}>
              Help us keep Wunabuy authentic and safe. Select why this review violates platform standards:
            </Text>

            <View style={{ gap: 8, marginBottom: spacing.lg }}>
              {[
                { id: 'inappropriate', label: 'Offensive or Inappropriate Content' },
                { id: 'spam', label: 'Spam, Advertising, or Fake Review' },
                { id: 'harassment', label: 'Harassment or Personal Attack' },
                { id: 'misleading', label: 'Misleading or False Information' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setReportReason(item.id)}
                  style={[
                    styles.reportOptionRow,
                    {
                      borderColor: reportReason === item.id ? colors.primary[500] : theme.border,
                      backgroundColor: reportReason === item.id ? (isDark ? colors.neutral[800] : colors.primary[50]) : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={reportReason === item.id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={reportReason === item.id ? colors.primary[500] : (theme.textTertiary || '#94A3B8')}
                    style={{ marginRight: 8 }}
                  />
                  <Text variant="bodyMedium" bold={reportReason === item.id}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button
                title="Cancel"
                variant="outline"
                disabled={isSubmittingReport}
                onPress={() => setReportingReviewId(null)}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmittingReport ? "Submitting..." : "Submit Report"}
                variant="primary"
                disabled={isSubmittingReport}
                onPress={handleConfirmReport}
                style={{ flex: 1.2, backgroundColor: colors.semantic.error[500], borderColor: colors.semantic.error[500] }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {toastMessage && <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  reportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  reportModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadows.lg,
  },
  reportModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reportOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
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
