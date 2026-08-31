import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Modal,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';
import { useCartStore } from '../../stores/cart.store';
import { useFavoritesStore } from '../../stores/favorites.store';
import { useFootprintStore } from '../../stores/footprint.store';

import { ProductImageGalleryModal } from './ProductImageGalleryModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLACEHOLDER = require('../../../assets/placeholder_product.png');

export interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  horizontal?: boolean;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  horizontal = false,
  style,
}) => {
  const { theme, isDark } = useThemeStore();
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedNotice, setShowAddedNotice] = useState(false);


  const addItemToCart = useCartStore((state) => state.addItem);
  const { isFavorite: checkFavorite, toggleFavorite: storeToggleFavorite } = useFavoritesStore();
  const recordFootprint = useFootprintStore((state) => state.recordFootprint);

  const isFavorited = checkFavorite(product.id);

  // Gallery image list (at least 2 images for swipe demo if product has only 1)
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'];

  const mainImage = productImages[0];

  const handleCardPress = () => {
    recordFootprint(product);
    onPress(product);
  };

  const handleOpenExpand = (e: any) => {
    e.stopPropagation?.();
    recordFootprint(product);
    setIsExpanded(true);
  };

  const handleCloseExpand = () => {
    setIsExpanded(false);
    setShowAddedNotice(false);
  };

  const toggleFavorite = (e: any) => {
    e.stopPropagation?.();
    storeToggleFavorite(product);
  };

  const handleAddToCart = () => {
    addItemToCart(product, quantity);
    setShowAddedNotice(true);
    setTimeout(() => {
      setShowAddedNotice(false);
    }, 2500);
  };

  const handleNavigateToDetail = () => {
    setIsExpanded(false);
    recordFootprint(product);
    onPress(product);
  };

  const galleryCardWidth = Math.min(SCREEN_WIDTH - 64, 380);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleCardPress}
        style={[
          styles.card,
          horizontal && styles.horizontalCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
          !isDark && shadows.sm,
          style,
        ]}
      >
        {/* Product Image Stage */}
        <View style={[styles.imageContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
          <Image
            source={imageError || !mainImage ? PLACEHOLDER : { uri: mainImage }}
            style={styles.image}
            resizeMode={imageError || !mainImage ? 'contain' : 'cover'}
            onError={() => setImageError(true)}
          />

          {/* Top-Right Favorite Heart Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleFavorite}
            style={[
              styles.favoriteBtn,
              { backgroundColor: isDark ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.92)' },
            ]}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={15}
              color={isFavorited ? colors.semantic.error[500] : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <Text variant="bodyMedium" bold numberOfLines={1} style={styles.name}>
            {product.name}
          </Text>

          <Text variant="caption" secondary numberOfLines={1} style={styles.subtitleText}>
            {product.category || 'Verified Product'}
          </Text>

          {/* 5-Star Rating Row */}
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="star" size={11} color="#F59E0B" style={{ marginRight: 1 }} />
            ))}
            <Text variant="caption" secondary style={styles.reviewsCount}>
              ({product.total_reviews ?? 126})
            </Text>
          </View>

          {/* Price & Primary Teal Circular Expand Plus Button */}
          <View style={styles.priceRow}>
            <Text variant="bodyLarge" bold color={colors.primary[500]}>
              {formatXAF(product.price)}
            </Text>

            {/* Expand Plus Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenExpand}
              style={[styles.tealAddBtn, { backgroundColor: colors.primary[500] }]}
            >
              <Ionicons name="add" size={18} color={colors.neutral[0]} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* ─── EXPANDED PRODUCT QUICK-VIEW MODAL ───────────────────────── */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={handleCloseExpand}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleCloseExpand}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.expandModalContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Header with Title, Favorite & Close Button */}
            <View style={styles.expandHeader}>
              <View style={styles.expandHeaderBadgeRow}>
                <Badge label="VERIFIED" variant="success" size="small" />
                <Text variant="caption" secondary style={{ marginLeft: 6 }}>
                  48H Escrow
                </Text>
              </View>

              <View style={styles.expandHeaderRightActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={toggleFavorite}
                  style={[styles.modalActionCircle, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                >
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFavorited ? colors.semantic.error[500] : theme.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCloseExpand}
                  style={[styles.modalActionCircle, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], marginLeft: 8 }]}
                >
                  <Ionicons name="close" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Horizontal Swipeable Image Gallery Stage */}
            <View style={styles.galleryStageContainer}>
              <FlatList
                data={productImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => `img_${index}`}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(e.nativeEvent.contentOffset.x / galleryCardWidth);
                  setActiveImageIndex(newIndex);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => setIsGalleryModalVisible(true)}
                    style={[styles.galleryImageWrapper, { width: galleryCardWidth }]}
                  >
                    <Image
                      source={{ uri: item }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />

              {/* Image Counter Badge (e.g. 1 / 3) */}
              <View style={styles.imageCounterPill}>
                <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 11 }}>
                  {activeImageIndex + 1} / {productImages.length}
                </Text>
              </View>

              {/* Floating Fullscreen Expand (<>) Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsGalleryModalVisible(true)}
                style={styles.expandGalleryFloatingBtn}
              >
                <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
                <Text variant="caption" bold color="#FFFFFF" style={{ fontSize: 10, marginLeft: 3 }}>
                  &lt;&gt;
                </Text>
              </TouchableOpacity>

              {/* Swipe Guidance Dots */}
              {productImages.length > 1 && (
                <View style={styles.paginationDotsRow}>
                  {productImages.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        idx === activeImageIndex
                          ? [styles.activeDot, { backgroundColor: colors.primary[500] }]
                          : { backgroundColor: isDark ? colors.neutral[600] : colors.neutral[300] },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>


            {/* Product Details Section */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.expandScrollBody}>
              <View style={styles.expandProductInfoRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="h2" bold numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text variant="caption" secondary style={{ marginTop: 2 }}>
                    {product.category || 'General Products'} • {product.store?.store_name ?? 'Verified Merchant'}
                  </Text>
                </View>
                <Text variant="h2" bold color={colors.primary[500]} style={{ marginLeft: 8 }}>
                  {formatXAF(product.price)}
                </Text>
              </View>

              {/* 5-Star Rating Row */}
              <View style={styles.expandRatingRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons key={i} name="star" size={13} color="#F59E0B" style={{ marginRight: 2 }} />
                ))}
                <Text variant="caption" bold style={{ marginLeft: 4 }}>
                  {product.rating_avg ?? 4.9}
                </Text>
                <Text variant="caption" secondary style={{ marginLeft: 3 }}>
                  ({product.total_reviews ?? 126} reviews)
                </Text>
              </View>

              {/* Product Description */}
              <Text variant="bodyMedium" secondary style={styles.expandDescriptionText}>
                {product.description ||
                  'Authentic verified product with guaranteed 48-hour escrow protection. Tested for quality and packaged directly by verified local merchants.'}
              </Text>

              {/* Quantity Selector & Added Notice */}
              <View style={styles.quantitySectionRow}>
                <Text variant="bodyMedium" bold>
                  Quantity:
                </Text>
                <View style={[styles.stepperContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="remove" size={16} color={theme.text} />
                  </TouchableOpacity>
                  <Text variant="bodyMedium" bold style={styles.stepperText}>
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setQuantity(quantity + 1)}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="add" size={16} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {showAddedNotice && (
                <View style={styles.addedNoticeBox}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success[500]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={colors.semantic.success[700]}>
                    Added {quantity} item{quantity > 1 ? 's' : ''} to Cart!
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom Action Bar (Add to Cart + View Full Details) */}
            <View style={[styles.expandBottomBar, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAddToCart}
                style={[
                  styles.expandAddCartBtn,
                  { backgroundColor: isDark ? colors.primary[900] : colors.primary[50], borderColor: colors.primary[500] },
                ]}
              >
                <Ionicons name="cart-outline" size={18} color={colors.primary[600]} style={{ marginRight: 6 }} />
                <Text variant="bodyMedium" bold color={colors.primary[600]}>
                  Add to Cart
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleNavigateToDetail}
                style={[styles.expandDetailBtn, { backgroundColor: colors.primary[500] }]}
              >
                <Text variant="bodyMedium" bold color={colors.neutral[0]}>
                  View Full Product ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── FULLSCREEN EXPANDED IMAGE GALLERY MODAL ────────────────── */}
      <ProductImageGalleryModal
        visible={isGalleryModalVisible}
        images={productImages}
        initialIndex={activeImageIndex}
        productName={product.name}
        onClose={() => setIsGalleryModalVisible(false)}
      />
    </>
  );
};


const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  horizontalCard: {
    width: 165,
    marginRight: spacing.md,
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.xs + 2,
    right: spacing.xs + 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.sm + 2,
  },
  name: {
    fontSize: 13,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 10,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewsCount: {
    fontSize: 10,
    marginLeft: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  tealAddBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: spacing.base,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  expandModalContainer: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.xl,
  },
  expandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  expandHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandHeaderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryStageContainer: {
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImageWrapper: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  imageCounterPill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    zIndex: 10,
  },
  expandGalleryFloatingBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },

  paginationDotsRow: {
    position: 'absolute',
    bottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 14,
    borderRadius: 7,
  },
  expandScrollBody: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    maxHeight: 190,
  },
  expandProductInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  expandRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  expandDescriptionText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  quantitySectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    paddingHorizontal: spacing.md,
  },
  addedNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  expandBottomBar: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  expandAddCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md - 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
  },
  expandDetailBtn: {
    flex: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md - 2,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
});
