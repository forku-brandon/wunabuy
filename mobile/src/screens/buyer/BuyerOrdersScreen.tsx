import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Badge, Toast } from '../../components/ui';
import { DigitalSignatureModal } from '../../components/order/DigitalSignatureModal';
import { DisputeModal } from '../../components/order/DisputeModal';
import { OrderStatus, DisputeReason } from '@wunabuy/types';
import { formatXAF, getStatusLabel } from '@wunabuy/utils';
import { spacing, borderRadius, colors, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface OrderItemData {
  id: string;
  order_code: string;
  store_name: string;
  item_name: string;
  item_image: string;
  total: number;
  status: OrderStatus;
  date: string;
}

const MOCK_ORDERS_DATA: OrderItemData[] = [
  {
    id: 'wb_order_1',
    order_code: 'WNB-2026-9842',
    store_name: 'Douala Tech Hub (Akwa)',
    item_name: 'Samsung Galaxy A54 5G (128GB, Awesome Lime)',
    item_image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    total: 188000,
    status: OrderStatus.EN_ROUTE,
    date: 'Aug 26, 2026 • 14:30',
  },
  {
    id: 'wb_order_2',
    order_code: 'WNB-2026-4109',
    store_name: 'Heritage African Couture',
    item_name: 'Traditional Bamenda Toghu Handmade Outfit',
    item_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    total: 48000,
    status: OrderStatus.PAID_ESCROW,
    date: 'Aug 24, 2026 • 09:15',
  },
  {
    id: 'wb_order_3',
    order_code: 'WNB-2026-1052',
    store_name: 'Bonanjo Beauty & Essentials',
    item_name: 'Organic Shea Glow Skincare Body Butter (250g)',
    item_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    total: 18500,
    status: OrderStatus.COMPLETED,
    date: 'Aug 20, 2026 • 16:45',
  },
];

export const BuyerOrdersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();
  const [orders, setOrders] = useState<OrderItemData[]>(MOCK_ORDERS_DATA);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeOrderForModal, setActiveOrderForModal] = useState<OrderItemData | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filterTabs = ['All', 'Paid Escrow', 'En Route', 'Completed', 'Disputed'];

  const filteredOrders =
    selectedFilter === 'All'
      ? orders
      : orders.filter((o) => {
          if (selectedFilter === 'Paid Escrow') return o.status === OrderStatus.PAID_ESCROW;
          if (selectedFilter === 'En Route') return o.status === OrderStatus.EN_ROUTE || o.status === OrderStatus.IN_TRANSIT;
          if (selectedFilter === 'Completed') return o.status === OrderStatus.COMPLETED;
          if (selectedFilter === 'Disputed') return o.status === OrderStatus.DISPUTED;
          return true;
        });

  const handleConfirmSignature = (signatureData: string) => {
    if (!activeOrderForModal) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrderForModal.id ? { ...o, status: OrderStatus.COMPLETED } : o))
    );
    setToastMessage('Receipt confirmed! 100% Escrow funds released to merchant.');
    setIsSignModalOpen(false);
  };

  const handleSubmitDispute = (reason: DisputeReason, description: string) => {
    if (!activeOrderForModal) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrderForModal.id ? { ...o, status: OrderStatus.DISPUTED } : o))
    );
    setToastMessage('Dispute opened! Escrow funds frozen under staff mediation.');
    setIsDisputeModalOpen(false);
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <Text variant="h1" bold style={styles.titleText}>
          My Orders &amp; Escrow
        </Text>
        <Text variant="caption" secondary>
          Track active deliveries &amp; manage 48h escrow protection
        </Text>
      </View>

      {/* Escrow Guarantee Summary Card */}
      <View style={styles.escrowSummarySection}>
        <View style={[styles.escrowSummaryCard, { backgroundColor: isDark ? '#1E293B' : colors.primary[50] }]}>
          <View style={styles.escrowIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.escrowTextCol}>
            <Text variant="bodyLarge" bold color={colors.primary[600]}>
              236,000 FCFA Locked in Escrow
            </Text>
            <Text variant="caption" secondary style={{ marginTop: 2 }}>
              Your money stays 100% safe in buyer protection until delivery is inspected &amp; signed.
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          data={filterTabs}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item;
            return (
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setSelectedFilter(item)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected
                      ? colors.primary[500]
                      : isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                  },
                ]}
              >
                <Text
                  variant="caption"
                  bold={isSelected}
                  color={isSelected ? colors.neutral[0] : theme.text}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
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
          <Card style={styles.orderCard}>
            {/* Top Order Code & Status Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.orderCodeRow}>
                <Ionicons name="bag-handle-outline" size={16} color={colors.primary[500]} style={{ marginRight: 4 }} />
                <Text variant="bodyLarge" bold color={colors.primary[500]}>
                  #{item.order_code}
                </Text>
              </View>

              <Badge
                label={getStatusLabel(item.status)}
                variant={
                  item.status === OrderStatus.COMPLETED
                    ? 'success'
                    : item.status === OrderStatus.DISPUTED
                    ? 'error'
                    : 'primary'
                }
              />
            </View>

            <Text variant="caption" secondary style={styles.dateText}>
              🏬 {item.store_name} • {item.date}
            </Text>

            {/* Item Image + Details */}
            <View style={styles.itemDetailRow}>
              <Image source={{ uri: item.item_image }} style={styles.itemThumb} resizeMode="cover" />
              <View style={styles.itemTextCol}>
                <Text variant="bodyMedium" bold numberOfLines={2} style={styles.itemName}>
                  {item.item_name}
                </Text>
                <Text variant="bodyLarge" bold color={colors.primary[500]} style={{ marginTop: 4 }}>
                  {formatXAF(item.total)}
                </Text>
              </View>
            </View>

            {/* Action Buttons Section — Clean Stacked Layout */}
            <View style={styles.cardActionSection}>
              {/* Row 1: Full-Width Primary Track Live Order Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('OrderTracking', { orderId: item.order_code })}
                style={styles.fullWidthTrackBtn}
              >
                <Ionicons name="map-outline" size={16} color={colors.neutral[0]} style={{ marginRight: 6 }} />
                <Text variant="bodyMedium" bold color={colors.neutral[0]}>
                  Track Live GPS Order ➔
                </Text>
              </TouchableOpacity>

              {/* Row 2: Equal 2-Column Split for Confirm Receipt & Dispute */}
              {item.status !== OrderStatus.COMPLETED && item.status !== OrderStatus.DISPUTED && (
                <View style={styles.secondaryActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setActiveOrderForModal(item);
                      setIsSignModalOpen(true);
                    }}
                    style={styles.confirmReceiptBtn}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success[700]} style={{ marginRight: 4 }} />
                    <Text variant="caption" bold color={colors.semantic.success[700]}>
                      Confirm Receipt
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setActiveOrderForModal(item);
                      setIsDisputeModalOpen(true);
                    }}
                    style={styles.openDisputeBtn}
                  >
                    <Ionicons name="alert-circle" size={16} color={colors.semantic.error[500]} style={{ marginRight: 4 }} />
                    <Text variant="caption" bold color={colors.semantic.error[500]}>
                      Open Dispute
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Card>
        )}
      />

      <DigitalSignatureModal
        visible={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirmSignature={handleConfirmSignature}
      />

      <DisputeModal
        visible={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSubmitDispute={handleSubmitDispute}
      />

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
  titleText: {
    fontSize: 24,
  },
  escrowSummarySection: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  escrowSummaryCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  escrowIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  escrowTextCol: {
    flex: 1,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs + 2,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  orderCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  orderCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    marginBottom: spacing.md,
  },
  itemDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemThumb: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
  },
  itemTextCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    lineHeight: 17,
  },
  cardActionSection: {
    gap: spacing.xs + 2,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  fullWidthTrackBtn: {
    width: '100%',
    height: 42,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  confirmReceiptBtn: {
    flex: 1,
    height: 38,
    backgroundColor: colors.semantic.success[50],
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openDisputeBtn: {
    flex: 1,
    height: 38,
    backgroundColor: colors.semantic.error[50],
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
