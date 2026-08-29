import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState, Toast } from '../../components/ui';
import { useFollowedStoresStore, FollowedStoreData } from '../../stores/followedStores.store';
import { useThemeStore } from '../../stores/theme.store';
import { useCartStore } from '../../stores/cart.store';
import { BuyerService } from '../../services/api/buyerService';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { Product } from '@wunabuy/types';

export const FollowedStoresScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const { followedStoreIds, stores, toggleFollow } = useFollowedStoresStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadFollowedStores = useCallback(async () => {
    try {
      await BuyerService.getFollowedStores();
    } catch {
      // Safe fallback to store
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFollowedStores();
  }, [loadFollowedStores]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFollowedStores();
  }, [loadFollowedStores]);

  const followedStoresList: FollowedStoreData[] = Object.values(stores).filter((s) =>
    followedStoreIds.includes(s.id)
  );

  const handleAddToCart = (product: Product, e: any) => {
    e.stopPropagation?.();
    addItemToCart(product, 1);
    setToastMessage(`Added "${product.name}" to cart!`);
  };

  const handleToggleFollow = (item: FollowedStoreData) => {
    toggleFollow(item);
    BuyerService.unfollowStore(item.id);
    setToastMessage(`Unfollowed ${item.name}`);
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation.getParent()?.canGoBack()) {
              navigation.getParent()?.goBack();
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.headerTitle}>
          Followed Stores
        </Text>
        <Badge
          label={`${followedStoresList.length} Stores`}
          variant="primary"
          size="small"
        />
      </View>

      {followedStoresList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No Stores Followed Yet"
            description="Follow your favorite verified sellers and artisans in Cameroon to see their latest product arrivals here."
            actionLabel="Discover Products"
            onAction={() => navigation.navigate('BuyerHome')}
          />
        </View>
      ) : (
        <FlatList
          data={followedStoresList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.storeCard}>
              {/* Store Header Row */}
              <View style={styles.storeHeader}>
                <Image source={{ uri: item.avatar_url }} style={styles.storeAvatar} />

                <View style={styles.storeMeta}>
                  <View style={styles.nameRow}>
                    <Text variant="bodyLarge" bold numberOfLines={1} style={{ flex: 1 }}>
                      {item.name}
                    </Text>
                    {item.is_verified && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} style={{ marginLeft: 4 }} />
                    )}
                  </View>

                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#F59E0B" />
                    <Text variant="caption" bold style={{ marginLeft: 3 }}>
                      {item.rating_avg}
                    </Text>
                    <Text variant="caption" secondary style={{ marginLeft: 2 }}>
                      ({item.total_reviews} reviews) • {item.followers_count} followers
                    </Text>
                  </View>

                  <Text variant="caption" secondary numberOfLines={1} style={{ marginTop: 2 }}>
                    📍 {item.location}
                  </Text>
                </View>

                {/* Follow / Unfollow Action */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggleFollow(item)}
                  style={[
                    styles.followingBtn,
                    { borderColor: theme.border, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                  ]}
                >
                  <Text variant="caption" bold color={theme.textSecondary}>
                    Following ✓
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Store Products Horizontal Carousel */}
              <Text variant="caption" bold secondary style={styles.productsSectionTitle}>
                LATEST STORE ARRIVALS
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsScroll}
              >
                {item.featured_products.map((prod) => (
                  <TouchableOpacity
                    key={prod.id}
                    activeOpacity={0.88}
                    onPress={() => navigation.navigate('ProductDetail', { productId: prod.id })}
                    style={[
                      styles.productMiniCard,
                      { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: theme.border },
                    ]}
                  >
                    <Image source={{ uri: prod.images[0] }} style={styles.productThumbnail} />
                    <Text variant="caption" bold numberOfLines={1} style={styles.productTitle}>
                      {prod.name}
                    </Text>
                    <View style={styles.productBottomRow}>
                      <Text variant="caption" bold color={colors.primary[500]}>
                        {formatXAF(prod.price)}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={(e) => handleAddToCart(prod, e)}
                        style={[styles.addMiniBtn, { backgroundColor: colors.primary[500] }]}
                      >
                        <Ionicons name="cart" size={12} color={colors.neutral[0]} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.base,
    gap: spacing.base,
  },
  storeCard: {
    padding: spacing.base,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  storeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.sm,
  },
  storeMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  followingBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginLeft: spacing.xs,
  },
  productsSectionTitle: {
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  productsScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  productMiniCard: {
    width: 140,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
  },
  productThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  productTitle: {
    marginBottom: 4,
  },
  productBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
