import React from 'react';
import { View, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { Product } from '@wunabuy/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { spacing } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  refreshing?: boolean;
  hasMore?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onSelectProduct: (product: Product) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  refreshing = false,
  hasMore = false,
  onRefresh,
  onLoadMore,
  onSelectProduct,
  emptyTitle = 'No Products Found',
  emptyDescription = 'Try adjusting your search query, filters, or proximity radius.',
}) => {
  const { theme } = useThemeStore();

  if (loading && products.length === 0) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={styles.cardWrapper}>
            <Skeleton height={140} borderRadiusValue={12} style={styles.skelImage} />
            <Skeleton height={16} width="60%" style={styles.skelText} />
            <Skeleton height={14} width="90%" style={styles.skelText} />
            <Skeleton height={20} width="40%" style={styles.skelPrice} />
          </View>
        ))}
      </View>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        ) : undefined
      }
      onEndReached={() => {
        if (hasMore && !loading && onLoadMore) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loading && products.length > 0 ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <ProductCard product={item} onPress={onSelectProduct} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    width: '48%',
  },
  skelImage: {
    marginBottom: spacing.xs,
  },
  skelText: {
    marginBottom: spacing.xs,
  },
  skelPrice: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
