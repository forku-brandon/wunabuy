import React, { useState } from 'react';
import { View, Image, FlatList, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ScreenContainer, Text, Card, Input, Button, Badge, Toast } from '../../components/ui';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { Product, QualityTier } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const SellerProductsScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleToggleActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: !p.is_active } : p))
    );
    setToastMessage('Product status updated!');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setToastMessage('Product listing deleted.');
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text variant="h1" bold>
            Store Inventory
          </Text>
          <Button
            title="+ List Item"
            variant="primary"
            size="small"
            fullWidth={false}
            onPress={() => navigation.navigate('AddEditProduct')}
          />
        </View>

        <Input
          placeholder="Filter inventory by product title..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
          leftIcon={<Text>🔍</Text>}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <View style={styles.cardRow}>
              <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />

              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text variant="bodyLarge" bold numberOfLines={1} style={{ flex: 1 }}>
                    {item.name}
                  </Text>
                  <Switch
                    value={item.is_active}
                    onValueChange={() => handleToggleActive(item.id)}
                    trackColor={{ false: theme.border, true: colors.primary[500] }}
                  />
                </View>

                <View style={styles.badgeRow}>
                  <Badge
                    label={item.quality_tier.replace('_', ' ').toUpperCase()}
                    variant={item.quality_tier === QualityTier.NEW ? 'success' : 'primary'}
                    size="small"
                  />
                  <Badge
                    label={`Stock: ${item.quantity}`}
                    variant={item.quantity > 0 ? 'info' : 'error'}
                    size="small"
                  />
                </View>

                <View style={styles.priceRow}>
                  <Text variant="h3" bold color={colors.primary[500]}>
                    {formatXAF(item.price)}
                  </Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddEditProduct', { product: item })}
                      style={styles.actionBtn}
                    >
                      <Text variant="caption" bold color={colors.role.seller}>
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteProduct(item.id)}
                      style={styles.actionBtn}
                    >
                      <Text variant="caption" bold color={colors.semantic.error[500]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        )}
      />

      {toastMessage && <Toast message={toastMessage} type="info" />}
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
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.md,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
});
