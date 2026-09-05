/**
 * ProductDetailScreen.tsx
 *
 * Wunabuy Product Detail Screen — High-conversion, enterprise-grade e-commerce screen.
 * Features an expansive hero gallery (covering full grid with 4% margins), verified store card,
 * 48h Escrow Guarantee badge, color/variant selector, dynamic recommendations section
 * (related products), and dual CTA bottom bar (Add to Cart + Buy Now with Escrow).
 *
 * @author   Wunabuy Engineering Team
 * @version  2.0.0
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Badge, Button, Card, Toast, QuantityInputModal } from '../../components/ui';
import { ProductCard } from '../../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { useCartStore } from '../../stores/cart.store';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Product } from '@wunabuy/types';
import { useFavoritesStore } from '../../stores/favorites.store';
import { useFootprintStore } from '../../stores/footprint.store';
import { ProductImageGalleryModal } from '../../components/product/ProductImageGalleryModal';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params || {};
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  const addItemToCart = useCartStore((state) => state.addItem);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const { isFavorite: checkFavorite, toggleFavorite: storeToggleFavorite } = useFavoritesStore();
  const recordFootprint = useFootprintStore((state) => state.recordFootprint);

  // Find product or fallback to first item
  const product: Product = useMemo(() => {
    return MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];
  }, [productId]);

  const isFavorited = checkFavorite(product.id);

  React.useEffect(() => {
    recordFootprint(product);
  }, [product, recordFootprint]);

  // Gallery and Variant state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // Recommendations: Related products in the same category (or fallback items) excluding current product
  const recommendedProducts: Product[] = useMemo(() => {
    const sameCategory = MOCK_PRODUCTS.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    if (sameCategory.length >= 2) {
      return sameCategory.slice(0, 4);
    }
    const otherProducts = MOCK_PRODUCTS.filter((p) => p.id !== product.id);
    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [product]);

  const availableColors = [
    { name: 'Light Gray', hex: '#CBD5E1' },
    { name: 'Teal Green', hex: '#0D9488' },
    { name: 'Midnight Navy', hex: '#1E293B' },
    { name: 'Amber Gold', hex: '#F59E0B' },
  ];

  // Handlers
  const handleAddToCart = () => {
    const success = addItemToCart(product, quantity);
    if (!success) {
      setToastMessage('Cart can only contain items from one store. Clear cart to add items from another store.');
    } else {
      setToastMessage(`Added ${quantity} x "${product.name}" to cart!`);
    }
  };

  const handleBuyNow = () => {
    addItemToCart(product, quantity);
    navigation.navigate('BuyerCart');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.name} on Wunabuy for ${formatXAF(product.price)}! Secure Escrow payment included.`,
      });
    } catch (error) {
      // Ignore share cancellation
    }
  };

  const handleSelectRecommended = (item: Product) => {
    navigation.push('ProductDetail', { productId: item.id });
  };

  const originalPrice = Math.round(product.price * 1.22);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* ── Top Floating Header Bar ────────────────────────────────────────── */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top + spacing.xs, spacing.md),
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation.getParent()?.canGoBack()) {
              navigation.getParent()?.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          {/* Favorite Love Icon on the SAME line with Share and Shopping */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
            onPress={() => {
              storeToggleFavorite(product);
              setToastMessage(isFavorited ? 'Removed from favorites' : 'Added to favorites ❤️');
            }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? colors.semantic.error[500] : theme.text}
            />
          </TouchableOpacity>

          {/* Share Icon */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color={theme.text} />
          </TouchableOpacity>

          {/* Shopping Cart Icon with Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('BuyerCart')}
          >
            <Ionicons name="cart-outline" size={20} color={theme.text} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.cartBadgeText}>
                  {cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Scrollable Body ─────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, 120) },
        ]}
      >
        {/* ── Expansive Hero Image Showcase Stage (92% Grid Coverage) ────── */}
        <View style={styles.heroWrapper}>
          <View
            style={[
              styles.galleryStage,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => setIsGalleryModalVisible(true)}
              style={styles.heroImageClickable}
            >
              <Image
                source={{ uri: product.images[activeImageIndex] || product.images[0] }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </TouchableOpacity>

            {/* Top Overlay Badge: Quality Tier */}
            <View style={styles.heroOverlayHeader}>
              <View style={styles.qualityPill}>
                <Ionicons name="shield-checkmark" size={13} color={colors.semantic.success[500]} />
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.qualityPillText}>
                  {product.quality_tier?.toUpperCase() ?? 'NEW'} • 100% VERIFIED
                </Text>
              </View>
            </View>



            {/* Thumbnail Strip (if multiple images) */}
            {product.images.length > 1 && (
              <View style={styles.thumbnailsContainer}>
                {product.images.map((imgUri, idx) => {
                  const isSelected = idx === activeImageIndex;
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => setActiveImageIndex(idx)}
                      style={[
                        styles.thumbBox,
                        {
                          borderColor: isSelected ? colors.primary[500] : 'transparent',
                        },
                      ]}
                    >
                      <Image source={{ uri: imgUri }} style={styles.thumbImage} resizeMode="cover" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Pagination Dots Indicator */}
            {product.images.length > 1 && (
              <View style={styles.paginationDots}>
                {product.images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === activeImageIndex
                        ? [styles.activeDot, { backgroundColor: colors.primary[500] }]
                        : { backgroundColor: theme.border },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Product Title & Pricing Card ─────────────────────────────────── */}
        <View style={styles.contentSection}>
          <View style={styles.titleRow}>
            <Text variant="h1" bold style={styles.title}>
              {product.name}
            </Text>
            {discountPercent > 0 && (
              <Badge label={`${discountPercent}% OFF`} variant="success" size="small" />
            )}
          </View>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text variant="display" bold color={colors.primary[500]} style={styles.priceText}>
              {formatXAF(product.price)}
            </Text>
            <Text variant="bodyLarge" secondary style={styles.struckPrice}>
              {formatXAF(originalPrice)}
            </Text>
            <View style={styles.inStockBadge}>
              <View style={styles.inStockDot} />
              <Text variant="caption" bold color={colors.semantic.success[700]}>
                In Stock ({product.quantity} left)
              </Text>
            </View>
          </View>

          {/* Review Stars & Location Proximity */}
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={15} color={colors.accent[500]} style={{ marginRight: 4 }} />
              <Text variant="bodyMedium" bold color={colors.accent[500]}>
                {product.rating_avg?.toFixed(1) ?? '4.9'}
              </Text>
              <Text variant="caption" secondary style={{ marginLeft: 4 }}>
                ({product.total_reviews ?? 42} verified reviews)
              </Text>
            </View>

            {product.distance_km !== null && (
              <View style={styles.locationPill}>
                <Ionicons name="location-outline" size={13} color={colors.primary[500]} />
                <Text variant="caption" color={colors.primary[500]} bold style={{ marginLeft: 2 }}>
                  {formatDistance(product.distance_km)} away • Akwa, Douala
                </Text>
              </View>
            )}
          </View>

          {/* ── Verified Store Card ───────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() =>
              navigation.navigate('StoreDetail', {
                store: product.store,
                storeId: product.store?.id || 'store_101',
              })
            }
          >
            <Card style={styles.storeCard}>
              <View style={styles.storeRow}>
                <View style={[styles.storeIconCircle, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="storefront" size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.storeInfo}>
                  <View style={styles.storeTitleRow}>
                    <Text variant="bodyMedium" bold numberOfLines={1}>
                      {product.store?.store_name ?? 'Douala Tech Hub (Akwa)'}
                    </Text>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} style={{ marginLeft: 4 }} />
                  </View>
                  <Text variant="caption" secondary numberOfLines={1}>
                    Official Verified Merchant • 99.4% Fulfillment Rate
                  </Text>
                </View>

                <View style={[styles.visitStoreBtn, { borderColor: colors.primary[500] }]}>
                  <Text variant="caption" bold color={colors.primary[500]}>
                    Visit
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          {/* ── 48H Escrow & Express Delivery Banner ───────────────────────── */}
          <View
            style={[
              styles.trustBanner,
              {
                backgroundColor: isDark ? '#064E3B' : '#F0FDF4',
                borderColor: isDark ? '#047857' : '#BBF7D0',
              },
            ]}
          >
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={18} color={colors.semantic.success[500]} />
              <View style={styles.trustTextCol}>
                <Text variant="caption" bold color={isDark ? '#A7F3D0' : '#14532D'}>
                  48-Hour Escrow Protection
                </Text>
                <Text variant="caption" color={isDark ? '#6EE7B7' : '#166534'} style={styles.trustSubtext}>
                  Payment held safely until you inspect &amp; confirm receipt.
                </Text>
              </View>
            </View>

            <View style={[styles.trustDivider, { backgroundColor: isDark ? '#047857' : '#DCFCE7' }]} />

            <View style={styles.trustItem}>
              <Ionicons name="flash-outline" size={18} color={colors.accent[500]} />
              <View style={styles.trustTextCol}>
                <Text variant="caption" bold color={isDark ? '#FDE68A' : '#78350F'}>
                  Express Transporter Delivery
                </Text>
                <Text variant="caption" color={isDark ? '#FCD34D' : '#92400E'} style={styles.trustSubtext}>
                  Live GPS tracked motorbike courier to your doorstep in Douala.
                </Text>
              </View>
            </View>
          </View>

          {/* ── Color / Variant Selector ──────────────────────────────────── */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            Available Variant: <Text variant="caption" bold color={theme.text}>{availableColors[selectedColor]?.name || 'Standard'}</Text>
          </Text>
          <View style={styles.colorRow}>
            {availableColors.map((colorObj, idx) => {
              const isSelected = selectedColor === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedColor(idx)}
                  style={[
                    styles.colorCircleOuter,
                    { borderColor: isSelected ? colors.primary[500] : 'transparent' },
                  ]}
                >
                  <View style={[styles.colorCircleInner, { backgroundColor: colorObj.hex }]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Description Section with Read More ────────────────────────── */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            Product Description
          </Text>
          <Text
            variant="bodyMedium"
            secondary
            numberOfLines={isDescExpanded ? undefined : 3}
            style={styles.description}
          >
            {product.description}
          </Text>
          <TouchableOpacity
            onPress={() => setIsDescExpanded(!isDescExpanded)}
            style={styles.readMoreBtn}
            activeOpacity={0.7}
          >
            <Text variant="bodyMedium" bold color={colors.primary[500]}>
              {isDescExpanded ? 'Show less ▲' : 'Read full description ▼'}
            </Text>
          </TouchableOpacity>

          {/* ── Recommendations / Related Products Section ────────────────── */}
          <View style={styles.recommendationsSection}>
            <View style={styles.recommendationsHeaderRow}>
              <View>
                <Text variant="h2" bold style={styles.recommendationsTitle}>
                  You May Also Like ✨
                </Text>
                <Text variant="caption" secondary>
                  Hand-picked related items from verified Douala stores
                </Text>
              </View>
            </View>

            {/* 2-Column Product Grid */}
            <View style={styles.recGrid}>
              {recommendedProducts.map((item) => (
                <View key={item.id} style={styles.recCardWrapper}>
                  <ProductCard
                    product={item}
                    onPress={() => handleSelectRecommended(item)}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Action Bar with Adjusted Dual CTAs ───────────────── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom + spacing.xs, spacing.md),
          },
        ]}
      >
        {/* Quantity Stepper Pill */}
        <View
          style={[
            styles.stepperPill,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC',
              borderColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.stepBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="remove" size={18} color={theme.text} />
          </TouchableOpacity>

          <Text variant="bodyLarge" bold style={styles.stepQty}>
            {quantity}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setQtyModalVisible(true)}
            style={styles.qtyTouchBtn}
          >
            <Text variant="bodyLarge" bold style={styles.stepQty}>
              {quantity}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.stepBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Adjusted "Add to Cart" Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddToCart}
          style={[
            styles.addToCartBtn,
            {
              backgroundColor: isDark ? 'rgba(13, 148, 136, 0.15)' : '#F0FDFA',
              borderColor: colors.primary[500],
            },
          ]}
        >
          <Ionicons name="cart-outline" size={18} color={colors.primary[500]} style={{ marginRight: 6 }} />
          <Text variant="bodyMedium" bold color={colors.primary[500]}>
            Add to Cart
          </Text>
        </TouchableOpacity>

        {/* "Buy Now" Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBuyNow}
          style={[
            styles.buyNowBtn,
            {
              backgroundColor: colors.primary[500],
            },
          ]}
        >
          <Ionicons name="flash" size={16} color={colors.neutral[0]} style={{ marginRight: 6 }} />
          <Text variant="bodyMedium" bold color={colors.neutral[0]}>
            Buy Now
          </Text>
        </TouchableOpacity>
      </View>

      {toastMessage && <Toast message={toastMessage} type="info" />}

      {/* Fullscreen Swipeable Product Image Gallery Modal */}
      <ProductImageGalleryModal
        visible={isGalleryModalVisible}
        images={product.images}
        initialIndex={activeImageIndex}
        productName={product.name}
        onClose={() => setIsGalleryModalVisible(false)}
      />

      <QuantityInputModal
        visible={qtyModalVisible}
        onClose={() => setQtyModalVisible(false)}
        onConfirm={(newQty) => setQuantity(newQty)}
        currentQuantity={quantity}
        minQuantity={1}
        maxQuantity={product.quantity || 99}
        title="Enter Order Quantity"
        itemName={product.name}
      />
    </ScreenContainer>
  );
};


const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 4,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.md,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.semantic.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  scrollContent: {
    paddingTop: 0,
  },
  heroWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
  },
  galleryStage: {
    width: '92%', // Covers entire grid with only 4% margin on both sides
    height: 380,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginTop: spacing.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageClickable: {
    width: '100%',
    height: '100%',
  },
  heroOverlayHeader: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  qualityPill: {

    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  qualityPillText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  favoriteBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: spacing.lg + 8,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  thumbBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  paginationDots: {
    position: 'absolute',
    bottom: spacing.xs + 4,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
  },
  contentSection: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  priceText: {
    fontSize: 22,
  },

  struckPrice: {
    textDecorationLine: 'line-through',
  },
  inStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.success[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginLeft: 'auto',
  },
  inStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.semantic.success[500],
    marginRight: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  storeCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  storeInfo: {
    flex: 1,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitStoreBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  trustBanner: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  trustTextCol: {
    flex: 1,
  },
  trustSubtext: {
    marginTop: 2,
    lineHeight: 16,
  },
  trustDivider: {
    height: 1,
    width: '100%',
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorCircleOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  description: {
    lineHeight: 22,
  },
  readMoreBtn: {
    marginTop: 6,
    marginBottom: spacing.md,
  },
  recommendationsSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  recommendationsHeaderRow: {
    marginBottom: spacing.md,
  },
  recommendationsTitle: {
    fontSize: 20,
    marginBottom: 2,
  },
  recGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recCardWrapper: {
    width: (SCREEN_WIDTH - spacing.base * 2 - spacing.sm) / 2,
    marginBottom: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    gap: spacing.sm,
    zIndex: 30,
    ...shadows.lg,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: spacing.xs,
  },
  stepBtn: {
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyTouchBtn: {
    paddingHorizontal: spacing.xs + 2,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepQty: {
    paddingHorizontal: spacing.xs + 2,
    minWidth: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  addToCartBtn: {
    flex: 1.1,
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  buyNowBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    ...shadows.sm,
  },
});
