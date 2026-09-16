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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Badge, Button, Card, Toast, QuantityInputModal, OptimizedImage } from '../../components/ui';
import { ActivityIndicator } from 'react-native';
import { ProductsService, api } from '../../services/api';
import { useCartStore } from '../../stores/cart.store';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Product } from '@wunabuy/types';
import { useFavoritesStore } from '../../stores/favorites.store';
import { useFootprintStore } from '../../stores/footprint.store';
import { ProductImageGalleryModal } from '../../components/product/ProductImageGalleryModal';
import { ProductCard } from '../../components/product/ProductCard';
import { normalizeMobileImageUrl } from '../../utils/imageUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params || {};
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  const addItemToCart = useCartStore((state) => state.addItem);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const { isFavorite: checkFavorite, toggleFavorite: storeToggleFavorite } = useFavoritesStore();
  const recordFootprint = useFootprintStore((state) => state.recordFootprint);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await ProductsService.getProductById(productId);
        if (data && isMounted) {
          setProduct(data);
          recordFootprint(data);
          if ((data as any).reviews && Array.isArray((data as any).reviews)) {
            setReviews((data as any).reviews);
          }
          const [recs, revsRes] = await Promise.all([
            ProductsService.getProducts({ category: data.category }).catch(() => []),
            api.client.get(`/reviews/product/${data.id}`).catch(() => null),
          ]);
          if (isMounted) {
            setRecommendedProducts(recs.filter((p) => p.id !== data.id).slice(0, 4));
            if (revsRes?.data?.data && Array.isArray(revsRes.data.data)) {
              setReviews(revsRes.data.data);
            }
          }
        }
      } catch {
        // Handled
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
    return () => { isMounted = false; };
  }, [productId, recordFootprint]);

  const isFavorited = product ? checkFavorite(product.id) : false;

  // Gallery and State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real Customer Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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
      setToastMessage('Review reported. Our moderation team will investigate.');
    } catch {
      setReportingReviewId(null);
      setToastMessage('Review reported.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!newComment.trim()) {
      setToastMessage('Please write a brief comment for your review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.client.post('/reviews', {
        target_type: 'product',
        target_id: product.id,
        rating: newRating,
        comment: newComment.trim(),
      });
      if (res.data?.success || res.status === 200 || res.status === 201) {
        setToastMessage('Thank you! Your verified review has been submitted. ⭐');
        setReviewModalVisible(false);
        setNewComment('');
        setNewRating(5);
        // Refresh product and reviews in real-time
        const [refreshedProd, refreshedRev] = await Promise.all([
          ProductsService.getProductById(product.id),
          api.client.get(`/reviews/product/${product.id}`),
        ]);
        if (refreshedProd) setProduct(refreshedProd);
        if (refreshedRev?.data?.data) setReviews(refreshedRev.data.data);
      } else {
        setToastMessage('Could not submit review. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit review. Check your connection.';
      setToastMessage(`⚠️ ${msg}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <ScreenContainer scrollable={false} padded={false}>
        <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text variant="bodyMedium" secondary style={{ marginTop: spacing.md }}>
            Loading product details...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Handlers
  const handleAddToCart = () => {
    if ((product.quantity ?? 0) <= 0) {
      setToastMessage('⚠️ This item is currently out of stock.');
      return;
    }
    const success = addItemToCart(product, quantity);
    if (!success) {
      setToastMessage('Cart can only contain items from one store. Clear cart to add items from another store.');
    } else {
      setToastMessage(`Added ${quantity} x "${product.name}" to cart!`);
    }
  };

  const handleBuyNow = () => {
    if ((product.quantity ?? 0) <= 0) {
      setToastMessage('⚠️ This item is currently out of stock.');
      return;
    }
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
              <OptimizedImage
                uri={product.images[activeImageIndex] || product.images[0]}
                style={styles.heroImage}
                contentFit="cover"
                priority="high"
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

              {/* Verified Return Escrow Badge */}
              <View style={[styles.escrowPill, { backgroundColor: 'rgba(15,23,42,0.75)' }]}>
                <Ionicons name="lock-closed" size={11} color={colors.primary[400]} />
                <Text variant="caption" bold color={colors.primary[400]} style={{ marginLeft: 3, fontSize: 11 }}>
                  48H ESCROW
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
                      <OptimizedImage uri={imgUri} style={styles.thumbImage} contentFit="cover" />
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
            <View
              style={[
                styles.inStockBadge,
                (product.quantity ?? 0) <= 0 && { backgroundColor: colors.semantic.error[50] },
              ]}
            >
              <View
                style={[
                  styles.inStockDot,
                  (product.quantity ?? 0) <= 0 && { backgroundColor: colors.semantic.error[500] },
                ]}
              />
              <Text
                variant="caption"
                bold
                color={(product.quantity ?? 0) > 0 ? colors.semantic.success[700] : colors.semantic.error[700]}
              >
                {(product.quantity ?? 0) > 0 ? `In Stock (${product.quantity} left)` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Review Stars & Location Proximity */}
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Ionicons
                name={(product.rating_avg ?? 0) > 0 ? 'star' : 'star-outline'}
                size={15}
                color={colors.accent[500]}
                style={{ marginRight: 4 }}
              />
              <Text variant="bodyMedium" bold color={colors.accent[500]}>
                {(product.rating_avg ?? 0) > 0
                  ? Number(product.rating_avg).toFixed(1)
                  : 'New'}
              </Text>
              <Text variant="caption" secondary style={{ marginLeft: 4 }}>
                ({product.total_reviews ?? reviews.length ?? 0} {(product.total_reviews ?? reviews.length ?? 0) === 1 ? 'review' : 'reviews'})
              </Text>
            </View>

            <View style={styles.locationPill}>
              <Ionicons name="location-outline" size={13} color={colors.primary[500]} />
              <Text variant="caption" color={colors.primary[500]} bold style={{ marginLeft: 2 }} numberOfLines={1}>
                {product.distance_km !== null && product.distance_km !== undefined
                  ? `${formatDistance(product.distance_km)} away • `
                  : ''}
                {(product.store as any)?.address_text || (product.store as any)?.city || 'Cameroon'}
              </Text>
            </View>
          </View>

          {/* ── Verified Store Card ───────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              const targetStoreId = product.store?.id || (product as any)?.store_id;
              if (targetStoreId) {
                navigation.navigate('StoreDetail', {
                  store: product.store,
                  storeId: targetStoreId,
                });
              }
            }}
          >
            <Card style={styles.storeCard}>
              <View style={styles.storeRow}>
                <View style={[styles.storeIconCircle, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="storefront" size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.storeInfo}>
                  <View style={styles.storeTitleRow}>
                    <Text variant="bodyMedium" bold numberOfLines={1}>
                      {product.store?.store_name ?? 'Official Verified Store'}
                    </Text>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} style={{ marginLeft: 4 }} />
                  </View>
                  <Text variant="caption" secondary numberOfLines={1}>
                    Official Verified Merchant
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
                  Live GPS tracked motorbike courier to your doorstep in {(product.store as any)?.city || 'Cameroon'}.
                </Text>
              </View>
            </View>
          </View>

          {/* ── Verified Product Specifications & Logistics Origin ─────── */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            Verified Specifications &amp; Origin
          </Text>
          <View
            style={[
              styles.specCard,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC',
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.specGridRow}>
              <View style={styles.specItem}>
                <Text variant="caption" secondary style={styles.specLabel}>
                  QUALITY GRADE
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="ribbon-outline" size={14} color={colors.primary[500]} />
                  <Text variant="bodyMedium" bold>
                    {product.quality_tier ? product.quality_tier.toUpperCase() : 'BRAND NEW'}
                  </Text>
                </View>
              </View>

              <View style={styles.specItem}>
                <Text variant="caption" secondary style={styles.specLabel}>
                  CATEGORY
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="pricetag-outline" size={14} color={colors.primary[500]} />
                  <Text variant="bodyMedium" bold>
                    {product.category || 'General'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.specDivider, { backgroundColor: theme.border }]} />

            <View style={styles.specGridRow}>
              <View style={styles.specItem}>
                <Text variant="caption" secondary style={styles.specLabel}>
                  WAREHOUSE INVENTORY
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <View
                    style={[
                      styles.inStockDot,
                      {
                        backgroundColor:
                          (product.quantity ?? 0) > 0
                            ? colors.semantic.success[500]
                            : colors.semantic.error[500],
                      },
                    ]}
                  />
                  <Text
                    variant="bodyMedium"
                    bold
                    color={
                      (product.quantity ?? 0) > 0
                        ? colors.semantic.success[700]
                        : colors.semantic.error[700]
                    }
                  >
                    {(product.quantity ?? 0) > 0
                      ? `${product.quantity} in stock`
                      : 'Out of stock'}
                  </Text>
                </View>
              </View>

              <View style={styles.specItem}>
                <Text variant="caption" secondary style={styles.specLabel}>
                  CATALOG SKU
                </Text>
                <Text variant="bodyMedium" bold style={{ marginTop: 2 }}>
                  WNB-{product.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={[styles.specDivider, { backgroundColor: theme.border }]} />

            <View style={styles.specFullRow}>
              <Ionicons name="business-outline" size={15} color={colors.primary[500]} />
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text variant="caption" secondary style={styles.specLabel}>
                  DISPATCH HUB &amp; FULFILLMENT
                </Text>
                <Text variant="bodyMedium" bold numberOfLines={1}>
                  {(product.store as any)?.store_name ?? 'Verified Merchant'} • {(product.store as any)?.address_text || (product.store as any)?.city || 'Douala Hub'}
                </Text>
              </View>
            </View>
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

          {/* ── Verified Customer Reviews Section ───────────────────────────── */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text variant="h2" bold style={styles.reviewsTitle}>
                  Customer Reviews ⭐
                </Text>
                <Text variant="caption" secondary>
                  Real opinions from verified customers
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setReviewModalVisible(true)}
                style={[
                  styles.writeReviewBtn,
                  {
                    borderColor: colors.primary[500],
                    backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#F0FDFA',
                  },
                ]}
              >
                <Ionicons name="create-outline" size={15} color={colors.primary[500]} style={{ marginRight: 4 }} />
                <Text variant="caption" bold color={colors.primary[500]}>
                  Write Review
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rating Metric Summary Card */}
            <Card style={[styles.reviewsSummaryCard, { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC', borderColor: theme.border }]}>
              <View style={styles.ratingLeftCol}>
                <Text style={styles.bigRatingNum}>
                  {(product.rating_avg ?? 0) > 0 ? Number(product.rating_avg).toFixed(1) : 'New'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 3, marginVertical: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={(product.rating_avg ?? 0) > 0 && star <= Math.round(product.rating_avg || 0) ? 'star' : 'star-outline'}
                      size={18}
                      color={colors.accent[500]}
                    />
                  ))}
                </View>
                <Text variant="caption" secondary>
                  {(product.total_reviews ?? reviews.length ?? 0) > 0
                    ? `Based on ${product.total_reviews ?? reviews.length} verified purchase${(product.total_reviews ?? reviews.length) === 1 ? '' : 's'}`
                    : 'No customer reviews yet'}
                </Text>
              </View>
            </Card>

            {/* Reviews List or Honest Empty State */}
            {reviews.length === 0 ? (
              <View style={[styles.emptyReviewsBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: theme.border }]}>
                <Ionicons name="chatbox-ellipses-outline" size={38} color={theme.textTertiary} />
                <Text variant="bodyMedium" bold style={{ marginTop: spacing.xs }}>
                  Be the First to Review
                </Text>
                <Text variant="caption" secondary align="center" style={{ marginTop: 4, maxWidth: 260 }}>
                  Share your experience with quality, packaging, and delivery to help fellow buyers.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setReviewModalVisible(true)}
                  style={[styles.firstReviewBtn, { backgroundColor: colors.primary[500] }]}
                >
                  <Ionicons name="star" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color="#FFFFFF">
                    Rate This Product
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                {reviews.map((rev, idx) => (
                  <Card key={rev.id || idx} style={styles.customerReviewCard}>
                    <View style={styles.customerReviewHeader}>
                      <View style={[styles.reviewerAvatar, { backgroundColor: colors.primary[500], overflow: 'hidden' }]}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="shield-checkmark" size={12} color={colors.semantic.success[500]} />
                          <Text variant="caption" color={colors.semantic.success[700]} bold style={{ fontSize: 11 }}>
                            Verified Purchase
                          </Text>
                          <Text variant="caption" secondary style={{ fontSize: 11 }}>
                            • {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                          </Text>
                        </View>
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

                    <Text variant="bodyMedium" style={styles.customerReviewText}>
                      "{rev.comment || rev.review_text || 'Item arrived in perfect condition.'}"
                    </Text>

                    {/* Review Photos if any */}
                    {Array.isArray(rev.images) && rev.images.length > 0 && (
                      <View style={styles.reviewPhotosRow}>
                        {rev.images.map((imgUrl: string, pIdx: number) => (
                          <Image key={pIdx} source={{ uri: imgUrl }} style={styles.reviewPhotoThumb} />
                        ))}
                      </View>
                    )}

                    {/* Review Report Action (Google Play UGC Compliance) */}
                    <View style={styles.reviewActionFooter}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleOpenReportModal(rev.id || `rev_${idx}`)}
                        style={styles.reportReviewBtn}
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
            )}
          </View>

          {/* ── Recommendations / Related Products Section ────────────────── */}
          <View style={styles.recommendationsSection}>
            <View style={styles.recommendationsHeaderRow}>
              <View>
                <Text variant="h2" bold style={styles.recommendationsTitle}>
                  You May Also Like ✨
                </Text>
                <Text variant="caption" secondary>
                  Hand-picked related items from verified stores
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
              opacity: (product.quantity ?? 0) <= 0 ? 0.4 : 1,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.stepBtn}
            activeOpacity={0.7}
            disabled={(product.quantity ?? 0) <= 0}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="remove" size={18} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if ((product.quantity ?? 0) > 0) setQtyModalVisible(true);
            }}
            disabled={(product.quantity ?? 0) <= 0}
            style={styles.qtyTouchBtn}
          >
            <Text variant="bodyLarge" bold style={styles.stepQty}>
              {(product.quantity ?? 0) <= 0 ? 0 : quantity}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setQuantity(Math.min(product.quantity || 99, quantity + 1))}
            style={styles.stepBtn}
            activeOpacity={0.7}
            disabled={(product.quantity ?? 0) <= 0 || quantity >= (product.quantity ?? 0)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Adjusted "Add to Cart" Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddToCart}
          disabled={(product.quantity ?? 0) <= 0}
          style={[
            styles.addToCartBtn,
            (product.quantity ?? 0) <= 0
              ? {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
                  borderColor: theme.border,
                  opacity: 0.6,
                }
              : {
                  backgroundColor: isDark ? 'rgba(13, 148, 136, 0.15)' : '#F0FDFA',
                  borderColor: colors.primary[500],
                },
          ]}
        >
          <Ionicons
            name="cart-outline"
            size={18}
            color={(product.quantity ?? 0) <= 0 ? theme.textSecondary : colors.primary[500]}
            style={{ marginRight: 6 }}
          />
          <Text
            variant="bodyMedium"
            bold
            color={(product.quantity ?? 0) <= 0 ? theme.textSecondary : colors.primary[500]}
          >
            {(product.quantity ?? 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>

        {/* "Buy Now" Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBuyNow}
          disabled={(product.quantity ?? 0) <= 0}
          style={[
            styles.buyNowBtn,
            (product.quantity ?? 0) <= 0
              ? {
                  backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300],
                  opacity: 0.6,
                }
              : {
                  backgroundColor: colors.primary[500],
                },
          ]}
        >
          <Ionicons
            name="flash"
            size={16}
            color={colors.neutral[0]}
            style={{ marginRight: 6 }}
          />
          <Text variant="bodyMedium" bold color={colors.neutral[0]}>
            {(product.quantity ?? 0) <= 0 ? 'Sold Out' : 'Buy Now'}
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

      {/* ── Review Submission Modal ─────────────────────────────────────── */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="h2" bold>
                  Write a Product Review
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  {product.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Interactive Star Picker */}
            <Text variant="caption" bold color={theme.textSecondary} style={{ marginTop: spacing.sm, marginBottom: spacing.xs }}>
              Overall Rating:
            </Text>
            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewRating(star)}
                  activeOpacity={0.7}
                  style={styles.starPickBtn}
                >
                  <Ionicons
                    name={star <= newRating ? 'star' : 'star-outline'}
                    size={32}
                    color={colors.accent[500]}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text variant="caption" bold color={colors.accent[600]} align="center" style={{ marginBottom: spacing.sm }}>
              {newRating === 5 ? '⭐⭐⭐⭐⭐ Excellent' :
               newRating === 4 ? '⭐⭐⭐⭐ Good' :
               newRating === 3 ? '⭐⭐⭐ Average' :
               newRating === 2 ? '⭐⭐ Poor' : '⭐ Terrible'}
            </Text>

            {/* Comment Box */}
            <Text variant="caption" bold color={theme.textSecondary} style={{ marginBottom: spacing.xs }}>
              Your Feedback:
            </Text>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Share details on product quality, packing, and courier delivery..."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[
                styles.reviewTextInput,
                {
                  backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC',
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />

            {/* Trust Escrow Note */}
            <View style={[styles.escrowNoteBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.12)' : '#F0FDFA' }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary[500]} />
              <Text variant="caption" color={colors.primary[600]} style={{ flex: 1, marginLeft: 6, fontSize: 11 }}>
                All reviews are verified against real orders and contribute to merchant ratings.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <Button
                variant="outline"
                title="Cancel"
                onPress={() => setReviewModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.xs }}
              />
              <Button
                variant="primary"
                title={submittingReview ? 'Submitting...' : 'Submit Review'}
                onPress={handleSubmitReview}
                loading={submittingReview}
                disabled={submittingReview}
                style={{ flex: 1, marginLeft: spacing.xs }}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    gap: 4,
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
  specCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  specGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specDivider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.sm,
  },
  specFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  reviewsTitle: {
    fontSize: 20,
    marginBottom: 2,
  },
  writeReviewBtn: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  reviewsSummaryCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  bigRatingNum: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.accent[500],
  },
  ratingLeftCol: {
    alignItems: 'center',
  },
  emptyReviewsBox: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  firstReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  customerReviewCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reviewActionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    paddingTop: 4,
  },
  reportReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
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
    marginBottom: spacing.xs,
  },
  customerReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerReviewText: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  reviewPhotosRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs + 2,
  },
  reviewPhotoThumb: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  starPickBtn: {
    padding: 4,
  },
  reviewTextInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    minHeight: 80,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  escrowNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
