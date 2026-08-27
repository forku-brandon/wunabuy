import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, QualityTier } from '@wunabuy/types';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';
import { useCartStore } from '../../stores/cart.store';

const PLACEHOLDER = require('../../../assets/placeholder_product.png');

export interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
}) => {
  const { theme, isDark } = useThemeStore();
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);

  const getQualityBadgeVariant = (tier: QualityTier) => {
    switch (tier) {
      case QualityTier.NEW:
        return 'success';
      case QualityTier.LIKE_NEW:
        return 'primary';
      case QualityTier.GOOD:
        return 'info';
      case QualityTier.FAIR:
      default:
        return 'neutral';
    }
  };

  const mainImage = product.images?.[0];

  const handleQuickAdd = (e: any) => {
    e.stopPropagation?.();
    addItemToCart(product, 1);
  };

  const toggleFavorite = (e: any) => {
    e.stopPropagation?.();
    setIsFavorite(!isFavorite);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(product)}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        !isDark && shadows.sm,
        style,
      ]}
    >
      {/* Product Image Stage */}
      <View style={[styles.imageContainer, { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' }]}>
        <Image
          source={imageError || !mainImage ? PLACEHOLDER : { uri: mainImage }}
          style={styles.image}
          resizeMode={imageError || !mainImage ? 'contain' : 'cover'}
          onError={() => setImageError(true)}
        />

        {/* Top-Left Quality / Discount Badge */}
        <View style={styles.badgeTopLeft}>
          <Badge
            label={product.quality_tier === QualityTier.NEW ? 'NEW' : '25% OFF'}
            variant={getQualityBadgeVariant(product.quality_tier)}
            size="small"
          />
        </View>

        {/* Top-Right Favorite Heart Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleFavorite}
          style={[
            styles.favoriteBtn,
            { backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.9)' },
          ]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={16}
            color={isFavorite ? colors.semantic.error[500] : theme.textSecondary}
          />
        </TouchableOpacity>

        {/* Bottom Distance Badge */}
        {product.distance_km !== null && product.distance_km !== undefined && (
          <View style={styles.distanceBadge}>
            <Text variant="caption" color={colors.neutral[0]} bold style={styles.distanceText}>
              📍 {formatDistance(product.distance_km)}
            </Text>
          </View>
        )}
      </View>

      {/* Product Info & Floating Quick Add */}
      <View style={styles.content}>
        <Text variant="caption" secondary numberOfLines={1} style={styles.storeName}>
          {product.store?.store_name ?? 'Verified Store'}
        </Text>

        <Text variant="bodyMedium" bold numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <View>
            <Text variant="h3" bold color={colors.primary[500]}>
              {formatXAF(product.price)}
            </Text>

            {product.rating_avg !== null && product.rating_avg !== undefined && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={colors.accent[500]} style={{ marginRight: 2 }} />
                <Text variant="caption" bold color={colors.accent[500]}>
                  {product.rating_avg.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Floating Quick Add Button matching reference mockup */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleQuickAdd}
            style={[styles.quickAddBtn, { backgroundColor: theme.text }]}
          >
            <Ionicons name="add" size={18} color={theme.background} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 145,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: spacing.xs + 2,
    left: spacing.xs + 2,
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.xs + 2,
    right: spacing.xs + 2,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: spacing.xs + 2,
    left: spacing.xs + 2,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  distanceText: {
    fontSize: 9,
  },
  content: {
    padding: spacing.sm + 2,
    position: 'relative',
  },
  storeName: {
    marginBottom: 2,
    fontSize: 10,
  },
  name: {
    height: 36,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  quickAddBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
