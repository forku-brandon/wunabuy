import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Badge, Button, Card, Toast } from '../../components/ui';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { useCartStore } from '../../stores/cart.store';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { QualityTier } from '@wunabuy/types';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params || {};
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const addItemToCart = useCartStore((state) => state.addItem);

  const product = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = () => {
    const success = addItemToCart(product, 1);
    if (!success) {
      setToastMessage('Cart can only contain items from one store. Clear cart to add items from another store.');
    } else {
      setToastMessage(`Added "${product.name}" to cart!`);
    }
  };

  const handleBuyNow = () => {
    addItemToCart(product, 1);
    navigation.navigate('BuyerCart');
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.circleBtn, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
            <Text variant="h2">←</Text>
          </TouchableOpacity>
        </View>

        {/* Multi-Image Gallery */}
        <View style={styles.galleryContainer}>
          <Image
            source={{ uri: product.images[activeImageIndex] || product.images[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {product.images.length > 1 && (
            <View style={styles.thumbnailRow}>
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActiveImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    activeImageIndex === index && { borderColor: colors.primary[500], borderWidth: 2 },
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImg} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Meta Section */}
        <View style={styles.contentSection}>
          <View style={styles.tagRow}>
            <Badge
              label={product.quality_tier.replace('_', ' ').toUpperCase()}
              variant={product.quality_tier === QualityTier.NEW ? 'success' : 'primary'}
            />
            {product.distance_km !== null && (
              <Badge label={`📍 ${formatDistance(product.distance_km)} away`} variant="neutral" />
            )}
          </View>

          <Text variant="h1" bold style={styles.title}>
            {product.name}
          </Text>

          <Text variant="display" bold color={colors.primary[500]} style={styles.price}>
            {formatXAF(product.price)}
          </Text>

          {/* 48-Hour Escrow Protection Banner */}
          <Card style={styles.escrowCard}>
            <View style={styles.escrowHeader}>
              <Text variant="h2">🔒</Text>
              <View style={styles.escrowTextContainer}>
                <Text variant="bodyMedium" bold color={colors.semantic.success[700]}>
                  Protected by 48-Hour Wunabuy Escrow
                </Text>
                <Text variant="caption" color={colors.semantic.success[700]} style={styles.escrowSub}>
                  Your payment is held safely in escrow until you inspect and sign off on your delivery.
                </Text>
              </View>
            </View>
          </Card>

          {/* Store Profile Card */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            STORE INFORMATION
          </Text>
          <Card style={styles.storeCard}>
            <View style={styles.storeRow}>
              <View style={styles.storeAvatar}>
                <Text variant="h2">🏪</Text>
              </View>

              <View style={styles.storeInfo}>
                <View style={styles.storeNameRow}>
                  <Text variant="h3" bold numberOfLines={1}>
                    {product.store?.store_name ?? 'Douala Tech Hub'}
                  </Text>
                  {product.store?.is_verified && <Badge label="VERIFIED" variant="primary" size="small" />}
                </View>

                <Text variant="caption" secondary>
                  ★ {product.store?.rating_avg ?? '4.9'} Rating ({product.total_reviews} reviews)
                </Text>
              </View>
            </View>
          </Card>

          {/* Description Section */}
          <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
            PRODUCT DESCRIPTION
          </Text>
          <Text variant="bodyMedium" secondary style={styles.description}>
            {product.description}
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <Button
          title="Add to Cart"
          variant="outline"
          fullWidth={false}
          onPress={handleAddToCart}
          style={styles.cartBtn}
        />
        <Button
          title="Buy Now (Escrow)"
          variant="primary"
          fullWidth={false}
          onPress={handleBuyNow}
          style={styles.buyBtn}
        />
      </View>

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 90, // Leave space for fixed bottom bar
  },
  topBar: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  galleryContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.neutral[100],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    gap: spacing.xs,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    padding: spacing.base,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
    lineHeight: 28,
  },
  price: {
    marginBottom: spacing.md,
  },
  escrowCard: {
    backgroundColor: colors.semantic.success[50],
    borderColor: colors.semantic.success[500],
    marginBottom: spacing.lg,
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  escrowTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  escrowSub: {
    marginTop: 2,
    lineHeight: 16,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  storeCard: {
    marginBottom: spacing.lg,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  storeInfo: {
    flex: 1,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  description: {
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  cartBtn: {
    flex: 1,
  },
  buyBtn: {
    flex: 1.5,
  },
});

