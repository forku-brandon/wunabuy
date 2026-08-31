import React, { useState, useCallback } from 'react';
import { View, Image, FlatList, StyleSheet, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Input, Button, Badge, Toast, EmptyState } from '../../components/ui';
import { ProductImageGalleryModal } from '../../components/product/ProductImageGalleryModal';
import { useSellerStore } from '../../stores/seller.store';
import { Product, QualityTier } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { SellerService } from '../../services/api';

export const SellerProductsScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const { products, toggleProductActive, updateStock, deleteProduct } = useSellerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await SellerService.getStoreProducts();
    } catch {
      // Handled
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleToggleActive = (product: Product) => {
    toggleProductActive(product.id);
    SellerService.toggleProductActive(product.id, !product.is_active);
    setToastMessage(`Product "${product.name}" is now ${!product.is_active ? 'Active' : 'Paused'}.`);
  };

  const handleStockChange = (product: Product, delta: number) => {
    updateStock(product.id, delta);
    const newQty = Math.max(0, product.quantity + delta);
    SellerService.updateStock(product.id, newQty);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    setToastMessage('Product removed from catalog.');
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="caption" secondary bold>
              CATALOG & INVENTORY
            </Text>
            <Text variant="h1" bold color={colors.primary[600]}>
              Store Products ({products.length})
            </Text>
          </View>
          <Button
            title="+ List Item"
            variant="primary"
            size="small"
            fullWidth={false}
            onPress={() => navigation.navigate('AddEditProduct')}
            style={{ backgroundColor: colors.primary[500] }}
          />
        </View>

        <Input
          placeholder="Search inventory items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
          leftIcon={<Ionicons name="search-outline" size={18} color={theme.textSecondary} />}
        />
      </View>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            title="No Products Found"
            description="Add products to your store catalog with high-quality photos to start receiving orders."
            actionLabel="+ Add First Product"
            onAction={() => navigation.navigate('AddEditProduct')}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
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
          renderItem={({ item }) => {
            const isOutOfStock = item.quantity === 0;
            const isLowStock = item.quantity > 0 && item.quantity <= 5;

            return (
              <Card style={[styles.productCard, !item.is_active && { opacity: 0.75 }]}>
                <View style={styles.cardRow}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => setGalleryProduct(item)}
                    style={styles.thumbnailWrapper}
                  >
                    <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
                    <View style={styles.thumbnailExpandBadge}>
                      <Ionicons name="expand-outline" size={10} color="#FFFFFF" />
                      <Text variant="caption" bold color="#FFFFFF" style={{ fontSize: 8, marginLeft: 1 }}>
                        &lt;&gt;
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.info}>

                    <View style={styles.titleRow}>
                      <Text variant="bodyLarge" bold numberOfLines={1} style={{ flex: 1 }}>
                        {item.name}
                      </Text>
                      <Switch
                        value={item.is_active}
                        onValueChange={() => handleToggleActive(item)}
                        trackColor={{ false: theme.border, true: colors.primary[500] }}
                      />
                    </View>

                    <View style={styles.badgeRow}>
                      <Badge
                        label={item.quality_tier.replace('_', ' ').toUpperCase()}
                        variant={item.quality_tier === QualityTier.NEW ? 'success' : 'primary'}
                        size="small"
                      />
                      {isOutOfStock ? (
                        <Badge label="Out of Stock" variant="danger" size="small" />
                      ) : isLowStock ? (
                        <Badge label={`Low Stock: ${item.quantity}`} variant="warning" size="small" />
                      ) : (
                        <Badge label={`In Stock: ${item.quantity}`} variant="primary" size="small" />
                      )}
                    </View>

                    {/* Price and Stock Steppers Row */}
                    <View style={styles.priceRow}>
                      <Text variant="h3" bold color={colors.primary[600]}>
                        {formatXAF(item.price)}
                      </Text>

                      {/* Stock Stepper Controls */}
                      <View style={[styles.stockStepperBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleStockChange(item, -1)}
                          disabled={item.quantity <= 0}
                          style={[styles.stepperBtn, item.quantity <= 0 && { opacity: 0.4 }]}
                        >
                          <Ionicons name="remove" size={14} color={theme.text} />
                        </TouchableOpacity>

                        <Text variant="caption" bold style={styles.stepperText}>
                          {item.quantity}
                        </Text>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleStockChange(item, 1)}
                          style={styles.stepperBtn}
                        >
                          <Ionicons name="add" size={14} color={theme.text} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Bottom Actions Row */}
                    <View style={styles.bottomActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('AddEditProduct', { product: item })}
                        style={[styles.actionBtn, { borderColor: theme.border }]}
                      >
                        <Ionicons name="create-outline" size={14} color={colors.primary[600]} />
                        <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 4 }}>
                          Edit
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleDeleteProduct(item.id)}
                        style={[styles.actionBtn, { borderColor: theme.border, marginLeft: spacing.sm }]}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.semantic.error[500]} />
                        <Text variant="caption" bold color={colors.semantic.error[500]} style={{ marginLeft: 4 }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}

      {toastMessage && <Toast message={toastMessage} type="info" />}

      {/* Fullscreen Swipeable Product Image Gallery Modal */}
      {galleryProduct && (
        <ProductImageGalleryModal
          visible={!!galleryProduct}
          images={galleryProduct.images || []}
          initialIndex={0}
          productName={galleryProduct.name}
          onClose={() => setGalleryProduct(null)}
        />
      )}
    </ScreenContainer>
  );
};


const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  productCard: {
    marginBottom: 0,
  },
  cardRow: {
    flexDirection: 'row',
  },
  thumbnailWrapper: {
    position: 'relative',
    marginRight: spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  thumbnailExpandBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  info: {

    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  stockStepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    paddingHorizontal: 8,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
});

