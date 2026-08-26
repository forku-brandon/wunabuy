import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Product, QualityTier } from '@wunabuy/types';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';

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

  const mainImage = product.images?.[0] || 'https://via.placeholder.com/300';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
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
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: mainImage }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeTopLeft}>
          <Badge
            label={product.quality_tier.replace('_', ' ').toUpperCase()}
            variant={getQualityBadgeVariant(product.quality_tier)}
            size="small"
          />
        </View>

        {product.distance_km !== null && product.distance_km !== undefined && (
          <View style={styles.distanceBadge}>
            <Text variant="caption" color={colors.neutral[0]} bold style={styles.distanceText}>
              📍 {formatDistance(product.distance_km)}
            </Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <Text variant="caption" secondary numberOfLines={1} style={styles.storeName}>
          {product.store?.store_name ?? 'Verified Store'}
        </Text>

        <Text variant="bodyMedium" bold numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text variant="h3" bold color={colors.primary[500]}>
            {formatXAF(product.price)}
          </Text>

          {product.rating_avg !== null && product.rating_avg !== undefined && (
            <View style={styles.ratingRow}>
              <Text variant="caption" bold color={colors.accent[500]}>
                ★ {product.rating_avg.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: colors.neutral[100],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  distanceText: {
    fontSize: 10,
  },
  content: {
    padding: spacing.md,
  },
  storeName: {
    marginBottom: 2,
    fontSize: 11,
  },
  name: {
    height: 36,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

