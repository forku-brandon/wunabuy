import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Badge, Button, Card, Toast } from '../../components/ui';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { useCartStore } from '../../stores/cart.store';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { QualityTier } from '@wunabuy/types';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params || {};
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const addItemToCart = useCartStore((state) => state.addItem);

  const product = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableColors = [
    { name: 'Light Gray', hex: '#CBD5E1' },
    { name: 'Teal Green', hex: '#0D9488' },
    { name: 'Midnight Navy', hex: '#1E293B' },
    { name: 'Amber Gold', hex: '#F59E0B' },
  ];

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

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header Navigation (Matching Mockup Screen 2) */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.circleBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.circleBtn, { backgroundColor: theme.card }]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.semantic.error[500] : theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Hero Image Showcase Stage (Matching Mockup Screen 2) */}
        <View style={[styles.galleryStage, { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' }]}>
          <Image
            source={{ uri: product.images[activeImageIndex] || product.images[0] }}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Pagination Indicators */}
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
        </View>

        {/* Product Info Section (Matching Mockup Screen 2) */}
        <View style={styles.contentSection}>
          {/* Title & Discount Badge */}
          <View style={styles.titleRow}>
            <Text variant="h1" bold style={styles.title}>
              {product.name}
            </Text>
            <Badge label="25% OFF" variant="success" size="small" />
          </View>

          {/* Price & Original Struck-Through Price */}
          <View style={styles.priceRow}>
            <Text variant="display" bold color={colors.primary[500]} style={styles.priceText}>
              {formatXAF(product.price)}
            </Text>
            <Text variant="bodyLarge" secondary style={styles.struckPrice}>
              {formatXAF(product.price * 1.25)}
            </Text>
          </View>

          {/* Rating & Distance */}
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color={colors.accent[500]} style={{ marginRight: 4 }} />
              <Text variant="bodyMedium" bold color={colors.accent[500]}>
                {product.rating_avg?.toFixed(1) ?? '4.9'} ({product.total_reviews ?? 34} reviews)
              </Text>
            </View>

            {product.distance_km !== null && (
              <Text variant="caption" secondary>
                📍 {formatDistance(product.distance_km)} away in Akwa
              </Text>
            )}
          </View>

          {/* Color Selector (Matching Mockup Screen 2) */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            Color: <Text variant="caption" bold color={theme.text}>{availableColors[selectedColor].name}</Text>
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

          {/* Description Section (Matching Mockup Screen 2) */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            Description
          </Text>
          <Text
            variant="bodyMedium"
            secondary
            numberOfLines={isDescExpanded ? undefined : 3}
            style={styles.description}
          >
            {product.description}
          </Text>
          <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={styles.readMoreBtn}>
            <Text variant="bodyMedium" bold color={colors.primary[500]}>
              {isDescExpanded ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>

          {/* Features Bullets (Matching Mockup Screen 2) */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            Features
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={colors.semantic.success[700]} style={styles.checkIcon} />
              <Text variant="bodyMedium">1-Year Official Manufacturer Warranty</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={colors.semantic.success[700]} style={styles.checkIcon} />
              <Text variant="bodyMedium">50MP OIS Triple Camera System &amp; 5000mAh Battery</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={colors.semantic.success[700]} style={styles.checkIcon} />
              <Text variant="bodyMedium">48-Hour Wunabuy Escrow Money-Back Guarantee</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar with Stepper + Add to Cart (Matching Mockup Screen 2) */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, spacing.base),
          },
        ]}
      >
        {/* Quantity Stepper Pill */}
        <View style={[styles.stepperPill, { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.stepBtn}
          >
            <Text variant="h2" bold>-</Text>
          </TouchableOpacity>

          <Text variant="bodyLarge" bold style={styles.stepQty}>
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.stepBtn}
          >
            <Text variant="h2" bold>+</Text>
          </TouchableOpacity>
        </View>

        {/* Primary CTA Button */}
        <Button
          title="Add to Cart"
          variant="primary"
          fullWidth={false}
          onPress={handleAddToCart}
          style={styles.addToCartBtn}
        />
      </View>

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  topBar: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  galleryStage: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 40,
  },
  heroImage: {
    width: '80%',
    height: '75%',
  },
  paginationDots: {
    position: 'absolute',
    bottom: spacing.md,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 16,
  },
  contentSection: {
    padding: spacing.base,
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
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  priceText: {
    fontSize: 26,
  },
  struckPrice: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorCircleOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  description: {
    lineHeight: 22,
  },
  readMoreBtn: {
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  featuresList: {
    gap: spacing.xs + 2,
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    height: 48,
    paddingHorizontal: spacing.sm,
  },
  stepBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    paddingHorizontal: spacing.md,
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
  },
});
