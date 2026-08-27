import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { useCartStore } from '../../stores/cart.store';

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
  const [isFavorite, setIsFavorite] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);

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
            { backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.9)' },
          ]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={15}
            color={isFavorite ? colors.semantic.error[500] : theme.textSecondary}
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

        {/* Price & Primary Teal Circular Quick Add Button */}
        <View style={styles.priceRow}>
          <Text variant="bodyLarge" bold color={colors.primary[500]}>
            {formatXAF(product.price)}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleQuickAdd}
            style={[styles.tealAddBtn, { backgroundColor: colors.primary[500] }]}
          >
            <Ionicons name="add" size={16} color={colors.neutral[0]} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
