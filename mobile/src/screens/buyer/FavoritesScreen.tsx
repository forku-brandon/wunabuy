import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState, Toast } from '../../components/ui';
import { useFavoritesStore } from '../../stores/favorites.store';
import { useThemeStore } from '../../stores/theme.store';
import { useCartStore } from '../../stores/cart.store';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { Product } from '@wunabuy/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FavoritesScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const { favoriteIds, favoriteProducts, toggleFavorite, clearFavorites } = useFavoritesStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const favoritesList: Product[] = favoriteIds
    .map((id) => favoriteProducts[id])
    .filter(Boolean);

  const handleAddToCart = (product: Product, e: any) => {
    e.stopPropagation?.();
    addItemToCart(product, 1);
    setToastMessage(`Added "${product.name}" to cart!`);
  };

  const handleRemoveFavorite = (product: Product, e: any) => {
    e.stopPropagation?.();
    toggleFavorite(product);
    setToastMessage('Removed from favorites');
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation?.reset) {
              navigation.reset({ index: 0, routes: [{ name: 'BuyerApp' }] });
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.headerTitle}>
          My Wishlist ❤️
        </Text>
        {favoritesList.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={clearFavorites}
            style={styles.clearBtn}
          >
            <Text variant="caption" secondary bold>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {favoritesList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Your Wishlist is Empty"
            description="Tap the heart icon on any product you love to save it here for fast escrow checkout later."
            actionLabel="Start Shopping"
            onAction={() => navigation.navigate('BuyerHome')}
          />
        </View>
      ) : (
        <FlatList
          data={favoritesList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              style={[
                styles.productCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                !isDark && shadows.sm,
              ]}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={(e) => handleRemoveFavorite(item, e)}
                  style={[styles.heartBtn, { backgroundColor: isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)' }]}
                >
                  <Ionicons name="heart" size={16} color={colors.semantic.error[500]} />
                </TouchableOpacity>
              </View>

              <View style={styles.productMeta}>
                <Text variant="caption" secondary numberOfLines={1}>
                  {item.category || 'General Product'}
                </Text>
                <Text variant="bodyMedium" bold numberOfLines={1} style={styles.productName}>
                  {item.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text variant="bodyLarge" bold color={colors.primary[500]}>
                    {formatXAF(item.price)}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={(e) => handleAddToCart(item, e)}
                    style={[styles.addCartBtn, { backgroundColor: colors.primary[500] }]}
                  >
                    <Ionicons name="cart" size={14} color={colors.neutral[0]} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
  },
  clearBtn: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.base,
    gap: spacing.base,
  },
  columnWrapper: {
    gap: spacing.base,
  },
  productCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageWrapper: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productMeta: {
    padding: spacing.sm,
  },
  productName: {
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addCartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
