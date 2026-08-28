import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState, Toast } from '../../components/ui';
import { useFootprintStore, FootprintItem } from '../../stores/footprint.store';
import { useThemeStore } from '../../stores/theme.store';
import { useCartStore } from '../../stores/cart.store';
import { formatXAF, formatDate } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';

export const FootprintScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const { footprints, removeFootprint, clearFootprints } = useFootprintStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = (item: FootprintItem, e: any) => {
    e.stopPropagation?.();
    addItemToCart(item.product, 1);
    setToastMessage(`Added "${item.product.name}" to cart!`);
  };

  const handleRemoveItem = (item: FootprintItem, e: any) => {
    e.stopPropagation?.();
    removeFootprint(item.product.id);
    setToastMessage('Item removed from history');
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
          Browsing Footprints 🐾
        </Text>
        {footprints.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={clearFootprints}
            style={styles.clearBtn}
          >
            <Text variant="caption" secondary bold>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {footprints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No Browsing Footprints"
            description="Products and store items you browse on Wunabuy will appear here so you can easily find them again."
            actionLabel="Discover Items"
            onAction={() => navigation.navigate('BuyerHome')}
          />
        </View>
      ) : (
        <FlatList
          data={footprints}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.product.id })}
              style={[
                styles.footprintCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                !isDark && shadows.sm,
              ]}
            >
              <Image source={{ uri: item.product.images[0] }} style={styles.thumbnail} />

              <View style={styles.infoCol}>
                <View style={styles.rowTop}>
                  <Text variant="caption" secondary numberOfLines={1} style={{ flex: 1 }}>
                    {item.product.category || 'General Product'}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={(e) => handleRemoveItem(item, e)}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text variant="bodyMedium" bold numberOfLines={1} style={styles.productTitle}>
                  {item.product.name}
                </Text>

                <View style={styles.bottomRow}>
                  <Text variant="bodyLarge" bold color={colors.primary[500]}>
                    {formatXAF(item.product.price)}
                  </Text>

                  <View style={styles.actionRow}>
                    <Text variant="caption" secondary style={{ marginRight: spacing.sm, fontSize: 11 }}>
                      {formatDate(item.viewedAt, 'short')}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={(e) => handleAddToCart(item, e)}
                      style={[styles.cartAddBtn, { backgroundColor: colors.primary[500] }]}
                    >
                      <Ionicons name="cart" size={14} color={colors.neutral[0]} />
                    </TouchableOpacity>
                  </View>
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
    gap: spacing.md,
  },
  footprintCard: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    padding: 2,
  },
  productTitle: {
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
