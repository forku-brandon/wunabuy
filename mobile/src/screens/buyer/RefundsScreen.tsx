import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState } from '../../components/ui';
import { useThemeStore } from '../../stores/theme.store';
import { DisputesService, RefundItemData } from '../../services/api/disputesService';
import { formatXAF, formatDate } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';

interface RefundItem extends RefundItemData {}

const MOCK_REFUNDS: RefundItem[] = [
  {
    id: 'ref_1',
    order_code: 'WB-2026-8812',
    store_name: 'Douala Tech Hub',
    product_name: 'Samsung Galaxy A54 5G',
    product_image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    amount: 185000,
    reason: 'Screen arrived cracked during transit (Escrow Frozen)',
    status: 'pending_review',
    requested_at: '2026-08-28T10:30:00Z',
  },
  {
    id: 'ref_2',
    order_code: 'WB-2026-4421',
    store_name: 'Heritage African Couture',
    product_name: 'Handcrafted Traditional Toghu Robe',
    product_image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800',
    amount: 65000,
    reason: 'Wrong size sent by merchant',
    status: 'refunded',
    requested_at: '2026-08-24T14:20:00Z',
    refunded_at: '2026-08-25T11:00:00Z',
    refund_destination: 'Wunabuy Wallet (Available Balance)',
    reference_id: 'WNB-REF-9921-WAL',
  },
  {
    id: 'ref_3',
    order_code: 'WB-2026-1190',
    store_name: 'Yaoundé Fresh Foods',
    product_name: 'Organic Plantain & Ndolé Bundle',
    product_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    amount: 15000,
    reason: 'Perishable item spoiled due to transport delay',
    status: 'refunded',
    requested_at: '2026-08-19T09:15:00Z',
    refunded_at: '2026-08-19T18:30:00Z',
    refund_destination: 'Mobile Money (+237 670 123 456)',
    reference_id: 'WNB-REF-1190-MOMO',
  },
];

export const RefundsScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [refunds, setRefunds] = useState<RefundItem[]>(MOCK_REFUNDS);
  const [refreshing, setRefreshing] = useState(false);

  const loadRefunds = useCallback(async () => {
    try {
      const data = await DisputesService.getRefunds();
      if (data && data.length > 0) {
        setRefunds(data);
      }
    } catch {
      // Fallback to initial mock data
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRefunds();
  }, [loadRefunds]);

  const pendingRefunds = refunds.filter((r) => r.status === 'pending_review' || r.status === 'merchant_evidence');
  const completedRefunds = refunds.filter((r) => r.status === 'refunded');

  const displayedList = activeTab === 'pending' ? pendingRefunds : completedRefunds;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header */}
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
          Refunds & Escrow Disputes
        </Text>
      </View>

      {/* Segmented Tab Controls */}
      <View style={[styles.tabBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('pending')}
          style={[
            styles.tabItem,
            activeTab === 'pending' && [styles.activeTabItem, { borderBottomColor: colors.primary[500] }],
          ]}
        >
          <Text
            variant="bodyMedium"
            bold={activeTab === 'pending'}
            color={activeTab === 'pending' ? colors.primary[500] : theme.textSecondary}
          >
            In Progress ({pendingRefunds.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('completed')}
          style={[
            styles.tabItem,
            activeTab === 'completed' && [styles.activeTabItem, { borderBottomColor: colors.primary[500] }],
          ]}
        >
          <Text
            variant="bodyMedium"
            bold={activeTab === 'completed'}
            color={activeTab === 'completed' ? colors.primary[500] : theme.textSecondary}
          >
            Completed ({completedRefunds.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {displayedList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title={activeTab === 'pending' ? 'No Pending Refunds' : 'No Past Refunds'}
            description={
              activeTab === 'pending'
                ? 'All your orders are delivered or confirmed with 48h escrow protection.'
                : 'You have not had any completed refund claims.'
            }
            actionLabel="View Orders"
            onAction={() => navigation.navigate('BuyerOrders')}
          />
        </View>
      ) : (
        <FlatList
          data={displayedList}
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
            <Card style={styles.refundCard}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text variant="caption" secondary>
                    ORDER {item.order_code}
                  </Text>
                  <Text variant="bodyLarge" bold style={{ marginTop: 2 }}>
                    {item.store_name}
                  </Text>
                </View>

                <Badge
                  label={
                    item.status === 'pending_review'
                      ? 'UNDER REVIEW'
                      : item.status === 'merchant_evidence'
                      ? 'MERCHANT EVIDENCE'
                      : 'REFUNDED'
                  }
                  variant={item.status === 'refunded' ? 'success' : 'warning'}
                  size="small"
                />
              </View>

              {/* Product Info Row */}
              <View style={styles.productRow}>
                <Image source={{ uri: item.product_image }} style={styles.productImage} />
                <View style={styles.productMeta}>
                  <Text variant="bodyMedium" bold numberOfLines={1}>
                    {item.product_name}
                  </Text>
                  <Text variant="caption" secondary numberOfLines={2} style={styles.reasonText}>
                    Dispute: {item.reason}
                  </Text>
                  <Text variant="h3" bold color={colors.primary[500]} style={{ marginTop: 4 }}>
                    {formatXAF(item.amount)}
                  </Text>
                </View>
              </View>

              {/* Resolution / Escrow Timeline Details */}
              <View style={[styles.timelineBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                {item.status === 'refunded' ? (
                  <View>
                    <View style={styles.timelineRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success[500]} />
                      <Text variant="caption" bold color={colors.semantic.success[500]} style={{ marginLeft: 4 }}>
                        Refund Credited on {formatDate(item.refunded_at!, 'full')}
                      </Text>
                    </View>
                    <Text variant="caption" secondary style={{ marginTop: 2, marginLeft: 20 }}>
                      Destination: {item.refund_destination} (Ref: {item.reference_id})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.timelineRow}>
                    <Ionicons name="shield-outline" size={16} color={colors.accent[500]} />
                    <Text variant="caption" bold color={colors.accent[500]} style={{ marginLeft: 4 }}>
                      Escrow Locked • Staff resolution in progress within 48h
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomWidth: 2,
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
  refundCard: {
    padding: spacing.base,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  productMeta: {
    flex: 1,
  },
  reasonText: {
    marginTop: 2,
    lineHeight: 16,
  },
  timelineBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
