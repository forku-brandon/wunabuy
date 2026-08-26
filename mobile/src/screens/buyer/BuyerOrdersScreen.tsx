import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Badge, EmptyState } from '../../components/ui';
import { OrderStatus } from '@wunabuy/types';
import { formatXAF, getStatusLabel, getStatusColor } from '@wunabuy/utils';
import { spacing, borderRadius, colors } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

const MOCK_BUYER_ORDERS = [
  {
    id: 'WB-2026-9842',
    store_name: 'Douala Tech Hub (Akwa)',
    item_summary: 'Samsung Galaxy A54 5G (128GB)',
    total: 188000,
    status: OrderStatus.EN_ROUTE,
    date: 'Aug 26, 2026',
  },
  {
    id: 'WB-2026-4109',
    store_name: 'Heritage African Couture',
    item_summary: 'Traditional Bamenda Toghu Outfit',
    total: 48000,
    status: OrderStatus.COMPLETED,
    date: 'Aug 20, 2026',
  },
];

export const BuyerOrdersScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text variant="h1" bold>
          My Orders & Escrow
        </Text>
        <Text variant="caption" secondary>
          Track active deliveries and review escrow status
        </Text>
      </View>

      <FlatList
        data={MOCK_BUYER_ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
          >
            <Card style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <Text variant="bodyLarge" bold color={colors.primary[500]}>
                  {item.id}
                </Text>
                <Badge
                  label={getStatusLabel(item.status)}
                  variant={item.status === OrderStatus.COMPLETED ? 'success' : 'primary'}
                />
              </View>

              <Text variant="caption" secondary style={styles.storeName}>
                🏬 {item.store_name} • {item.date}
              </Text>

              <Text variant="bodyMedium" bold style={styles.summary}>
                {item.item_summary}
              </Text>

              <View style={styles.footerRow}>
                <Text variant="h3" bold color={colors.primary[500]}>
                  {formatXAF(item.total)}
                </Text>

                <Text variant="bodyMedium" bold color={colors.primary[500]}>
                  Track Order →
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
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
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  orderCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  storeName: {
    marginBottom: spacing.xs,
  },
  summary: {
    marginBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

