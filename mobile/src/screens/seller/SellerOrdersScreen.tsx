import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState, Toast } from '../../components/ui';
import { useSellerStore, SellerOrder, SellerOrderStatus } from '../../stores/seller.store';
import { useThemeStore } from '../../stores/theme.store';
import { SellerService } from '../../services/api/sellerService';
import { formatXAF, formatDate, formatPhone } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { PrintableParcelQRModal } from '../../components/seller/PrintableParcelQRModal';

type OrderTab = 'all' | 'pending_acceptance' | 'preparing' | 'ready_for_pickup' | 'in_transit' | 'completed';

export const SellerOrdersScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const { orders, acceptOrder, declineOrder, markOrderReady, markOrderInTransit, markOrderCompleted } = useSellerStore();
  const [activeTab, setActiveTab] = useState<OrderTab>('pending_acceptance');
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Timer Tick State (re-renders countdown every 1s)
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ready Dispatch Modal State
  const [isReadyModalVisible, setIsReadyModalVisible] = useState(false);
  const [selectedOrderForReady, setSelectedOrderForReady] = useState<SellerOrder | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'wunabuy_transporter' | 'in_house_rider'>('wunabuy_transporter');
  const [inHouseRiderPhone, setInHouseRiderPhone] = useState('');

  // Rider Handover Code Verification Modal State
  const [isHandoverModalVisible, setIsHandoverModalVisible] = useState(false);
  const [selectedOrderForHandover, setSelectedOrderForHandover] = useState<SellerOrder | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Decline Reason Modal State
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [selectedOrderForDecline, setSelectedOrderForDecline] = useState<SellerOrder | null>(null);
  const [declineReason, setDeclineReason] = useState('Out of Stock');

  // Printable QR Modal State
  const [isPrintQRModalVisible, setIsPrintQRModalVisible] = useState(false);
  const [selectedOrderForPrintQR, setSelectedOrderForPrintQR] = useState<any | null>(null);

  const handleOpenPrintQRModal = (order: SellerOrder) => {
    setSelectedOrderForPrintQR({
      id: order.id,
      order_code: order.order_code,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      items_summary: order.items ? order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ') : 'Order Package',
      total_amount: order.total,
      pickup_pin: order.pickup_pin || '84920',
      transporter_name: order.transporter_name || 'Wunabuy Express Rider #402',
    });
    setIsPrintQRModalVisible(true);
  };

  const handleCallCustomer = (phoneNum: string) => {
    if (!phoneNum) return;
    const firstNumber = phoneNum.split('/')[0].split(',')[0].trim();
    const cleaned = firstNumber.replace(/[^+\d]/g, '');
    if (cleaned) {
      Linking.openURL(`tel:${cleaned}`).catch(() => {
        setToastMessage(`Dialing ${phoneNum}...`);
      });
    }
  };

  const loadOrders = useCallback(async () => {
    try {
      await SellerService.getFulfillmentOrders();
    } catch {
      // Fallback to store
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  // Tab counts
  const pendingCount = orders.filter((o) => o.status === 'pending_acceptance').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready_for_pickup').length;
  const inTransitCount = orders.filter((o) => o.status === 'in_transit').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const calculateTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return '00:00:00 (Expired)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAcceptOrder = (order: SellerOrder) => {
    acceptOrder(order.id);
    SellerService.acceptOrder(order.id);
    setToastMessage(`Order #${order.order_code} accepted! Moved to Preparing.`);
  };

  const handleOpenDeclineModal = (order: SellerOrder) => {
    setSelectedOrderForDecline(order);
    setIsDeclineModalVisible(true);
  };

  const handleConfirmDecline = () => {
    if (!selectedOrderForDecline) return;
    declineOrder(selectedOrderForDecline.id, declineReason);
    SellerService.declineOrder(selectedOrderForDecline.id, declineReason);
    setIsDeclineModalVisible(false);
    setToastMessage(`Order #${selectedOrderForDecline.order_code} declined.`);
  };

  const handleOpenReadyModal = (order: SellerOrder) => {
    setSelectedOrderForReady(order);
    setIsReadyModalVisible(true);
  };

  const handleConfirmReady = () => {
    if (!selectedOrderForReady) return;
    markOrderReady(selectedOrderForReady.id, deliveryOption, inHouseRiderPhone);
    SellerService.markReadyForPickup(selectedOrderForReady.id, {
      delivery_method: deliveryOption,
      driver_phone: inHouseRiderPhone,
    });
    setIsReadyModalVisible(false);
    setToastMessage(`Order #${selectedOrderForReady.order_code} ready for pickup!`);
  };

  const handleOpenHandoverModal = (order: SellerOrder) => {
    setSelectedOrderForHandover(order);
    setEnteredPin('');
    setPinError('');
    setIsHandoverModalVisible(true);
  };

  const handleConfirmHandoverVerification = () => {
    if (!selectedOrderForHandover) return;
    if (!enteredPin || enteredPin.length !== 5) {
      setPinError('Please enter the complete 5-digit verification PIN provided by the rider.');
      return;
    }
    const expectedPin = selectedOrderForHandover.pickup_pin || '84920';
    if (enteredPin !== expectedPin) {
      setPinError('❌ Invalid verification code! Code does not match the 5-digit PIN sent to the rider.');
      return;
    }

    markOrderInTransit(selectedOrderForHandover.id);
    setIsHandoverModalVisible(false);
    setToastMessage(`✅ Rider verified! Order #${selectedOrderForHandover.order_code} handed over successfully.`);
  };

  const handleCompleteOrder = (order: SellerOrder) => {
    markOrderCompleted(order.id);
    setToastMessage(`Order #${order.order_code} marked completed! Funds released to wallet.`);
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View>
          <Text variant="caption" secondary bold>
            MERCHANT FULFILLMENT
          </Text>
          <Text variant="h1" bold color={colors.primary[600]}>
            Store Orders 📦
          </Text>
        </View>
        <Badge label={`${orders.length} Total`} variant="primary" size="small" />
      </View>

      {/* Horizontal Filter Tabs */}
      <View style={[styles.tabScrollContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'pending_acceptance', label: 'New Orders', count: pendingCount, urgent: pendingCount > 0 },
            { key: 'preparing', label: 'Preparing', count: preparingCount },
            { key: 'ready_for_pickup', label: 'Ready', count: readyCount },
            { key: 'in_transit', label: 'In Transit', count: inTransitCount },
            { key: 'completed', label: 'Completed', count: completedCount },
            { key: 'all', label: 'All Orders', count: orders.length },
          ]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabScrollContent}
          renderItem={({ item }) => {
            const isActive = activeTab === item.key;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab(item.key as OrderTab)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isActive
                      ? colors.primary[500]
                      : isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                    borderColor: item.urgent && !isActive ? '#EF4444' : 'transparent',
                    borderWidth: item.urgent && !isActive ? 1 : 0,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  bold
                  color={isActive ? colors.neutral[0] : theme.text}
                >
                  {item.label}
                </Text>
                {item.count > 0 && (
                  <View
                    style={[
                      styles.tabCountBadge,
                      {
                        backgroundColor: isActive
                          ? 'rgba(255,255,255,0.3)'
                          : item.urgent
                          ? '#EF4444'
                          : colors.neutral[300],
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      bold
                      color={isActive || item.urgent ? '#FFFFFF' : colors.neutral[800]}
                      style={{ fontSize: 10 }}
                    >
                      {item.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            title="No Orders in this Stage"
            description="When buyers order from your store, incoming fulfillment jobs will appear here in real-time."
            actionLabel="Refresh Orders"
            onAction={handleRefresh}
          />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersListContent}
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
            const isPending = item.status === 'pending_acceptance';
            const isPreparing = item.status === 'preparing';
            const isReady = item.status === 'ready_for_pickup';
            const isInTransit = item.status === 'in_transit';
            const isCompleted = item.status === 'completed';

            return (
              <Card style={styles.orderCard}>
                {/* Card Header Row */}
                <View style={styles.orderCardHeader}>
                  <View style={styles.codeRow}>
                    <Text variant="bodyLarge" bold>
                      #{item.order_code}
                    </Text>
                    <Text variant="caption" secondary style={{ marginLeft: 6 }}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <Badge
                    label={
                      isPending
                        ? 'New Order'
                        : isPreparing
                        ? 'Preparing'
                        : isReady
                        ? 'Ready for Driver'
                        : isInTransit
                        ? 'In Transit'
                        : isCompleted
                        ? 'Completed'
                        : 'Cancelled'
                    }
                    variant={
                      isPending
                        ? 'warning'
                        : isPreparing
                        ? 'primary'
                        : isReady
                        ? 'primary'
                        : isInTransit
                        ? 'info'
                        : 'success'
                    }
                    size="small"
                  />
                </View>

                {/* 2-Hour Auto-Cancel Acceptance Timer Banner */}
                {isPending && (
                  <View style={styles.timerBanner}>
                    <Ionicons name="time" size={16} color="#DC2626" />
                    <Text variant="caption" bold color="#DC2626" style={{ marginLeft: 6, flex: 1 }}>
                      Accept before timer expires (2H rule): {calculateTimeRemaining(item.acceptance_expires_at)}
                    </Text>
                  </View>
                )}

                {/* Customer Details Row */}
                <View style={[styles.customerBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                  <View style={styles.customerMeta}>
                    <Text variant="bodyMedium" bold>
                      👤 {item.customer_name}
                    </Text>
                    <Text variant="caption" secondary style={{ marginTop: 2 }}>
                      📍 {item.delivery_address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleCallCustomer(item.customer_phone)}
                    style={[styles.callBtn, { borderColor: theme.border }]}
                  >
                    <Ionicons name="call-outline" size={16} color={colors.primary[600]} />
                  </TouchableOpacity>
                </View>

                {/* Item List */}
                <View style={styles.itemsList}>
                  {(item.items || []).map((prod, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Image source={{ uri: prod.image_url }} style={styles.itemThumbnail} />
                      <View style={styles.itemMeta}>
                        <Text variant="bodyMedium" bold numberOfLines={1}>
                          {prod.name}
                        </Text>
                        <Text variant="caption" secondary>
                          Qty: {prod.quantity} × {formatXAF(prod.price)}
                        </Text>
                      </View>
                      <Text variant="bodyMedium" bold color={colors.primary[600]}>
                        {formatXAF(prod.price * prod.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Financial Summary */}
                <View style={[styles.summaryBox, { borderTopColor: theme.border }]}>
                  <View style={styles.summaryRow}>
                    <Text variant="caption" secondary>
                      Store Subtotal
                    </Text>
                    <Text variant="caption" bold>
                      {formatXAF(item.subtotal)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text variant="caption" secondary>
                      Platform Commission (5%)
                    </Text>
                    <Text variant="caption" color="#DC2626">
                      - {formatXAF(item.commission)}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 4 }]}>
                    <Text variant="bodyMedium" bold>
                      Your Payout (Escrow Locked 🔒)
                    </Text>
                    <Text variant="bodyLarge" bold color={colors.primary[600]}>
                      {formatXAF(item.subtotal - item.commission)}
                    </Text>
                  </View>
                </View>

                {/* Transporter Details (If Assigned) */}
                {(isReady || isInTransit) && item.transporter_name && (
                  <View style={[styles.driverBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                    <Ionicons name="bicycle" size={18} color={colors.primary[500]} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text variant="caption" bold color={colors.primary[500]}>
                        {item.transporter_name}
                      </Text>
                      {item.transporter_phone && (
                        <Text variant="caption" secondary>
                          Phone: {item.transporter_phone}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* 5-Digit Handover Verification PIN Info Tag */}
                {isReady && item.pickup_pin && (
                  <View style={[styles.pinInfoBanner, { backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#ECFDF5', borderColor: colors.primary[400] }]}>
                    <Ionicons name="key" size={16} color={colors.primary[600]} />
                    <Text variant="caption" bold color={colors.primary[700]} style={{ flex: 1, marginLeft: 6 }}>
                      Rider Pickup 5-Digit Verification PIN: #{item.pickup_pin}
                    </Text>
                  </View>
                )}

                {/* Action Buttons Depending on Order State */}
                <View style={styles.actionButtonsRow}>
                  {isPending && (
                    <>
                      <Button
                        title="Decline"
                        variant="secondary"
                        size="small"
                        onPress={() => handleOpenDeclineModal(item)}
                        style={{ flex: 1, marginRight: spacing.sm }}
                      />
                      <Button
                        title="✓ Accept Order"
                        variant="primary"
                        size="small"
                        onPress={() => handleAcceptOrder(item)}
                        style={{ flex: 1.5, backgroundColor: colors.primary[500] }}
                      />
                    </>
                  )}

                  {isPreparing && (
                    <Button
                      title="📦 Mark Ready for Pickup"
                      variant="primary"
                      size="small"
                      onPress={() => handleOpenReadyModal(item)}
                      style={{ flex: 1, backgroundColor: colors.primary[500] }}
                    />
                  )}

                  {isReady && (
                    <Button
                      title="🚚 Handover to Rider"
                      variant="primary"
                      size="small"
                      onPress={() => handleOpenHandoverModal(item)}
                      style={{ flex: 1, backgroundColor: colors.primary[500] }}
                    />
                  )}

                  {isInTransit && (
                    <Button
                      title="✓ Confirm Buyer Received"
                      variant="primary"
                      size="small"
                      onPress={() => handleCompleteOrder(item)}
                      style={{ flex: 1, backgroundColor: colors.semantic.success[500] }}
                    />
                  )}

                  {isCompleted && (
                    <View style={styles.completedFeedback}>
                      <Ionicons name="checkmark-done-circle" size={18} color={colors.semantic.success[500]} />
                      <Text variant="caption" bold color={colors.semantic.success[500]} style={{ marginLeft: 6 }}>
                        Fulfillment completed • Escrow released to store wallet
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* ─── Ready for Pickup / Delivery Dispatch Modal ─────────────────── */}
      <Modal
        visible={isReadyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReadyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsReadyModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text variant="h2" bold>
              Choose Delivery Dispatch
            </Text>
            <Text variant="caption" secondary style={{ marginTop: 4, marginBottom: spacing.md }}>
              How will Order #{selectedOrderForReady?.order_code} be delivered to {selectedOrderForReady?.customer_name}?
            </Text>

            {/* Option 1: Wunabuy Express Transporter */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setDeliveryOption('wunabuy_transporter')}
              style={[
                styles.dispatchOptionCard,
                {
                  borderColor: deliveryOption === 'wunabuy_transporter' ? colors.primary[500] : theme.border,
                  backgroundColor:
                    deliveryOption === 'wunabuy_transporter'
                      ? isDark
                        ? colors.neutral[800]
                        : colors.primary[50]
                      : 'transparent',
                },
              ]}
            >
              <View style={styles.dispatchRadio}>
                {deliveryOption === 'wunabuy_transporter' && <View style={styles.dispatchRadioInner} />}
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="bodyMedium" bold>
                  🏍️ Wunabuy Express Transporter (Recommended)
                </Text>
                <Text variant="caption" secondary style={{ marginTop: 2 }}>
                  Broadcasts pickup job to verified nearby riders with live GPS route tracking.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Self-Delivery / In-House Rider */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setDeliveryOption('in_house_rider')}
              style={[
                styles.dispatchOptionCard,
                {
                  borderColor: deliveryOption === 'in_house_rider' ? colors.primary[500] : theme.border,
                  backgroundColor:
                    deliveryOption === 'in_house_rider'
                      ? isDark
                        ? colors.neutral[800]
                        : colors.primary[50]
                      : 'transparent',
                  marginTop: spacing.sm,
                },
              ]}
            >
              <View style={styles.dispatchRadio}>
                {deliveryOption === 'in_house_rider' && <View style={styles.dispatchRadioInner} />}
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="bodyMedium" bold>
                  🚚 Self-Delivery / Store In-House Rider
                </Text>
                <Text variant="caption" secondary style={{ marginTop: 2 }}>
                  Your store delivers directly to the customer.
                </Text>
              </View>
            </TouchableOpacity>

            {deliveryOption === 'in_house_rider' && (
              <View style={{ marginTop: spacing.sm }}>
                <Text variant="caption" secondary bold style={{ marginBottom: 4 }}>
                  In-House Rider Phone Number (Optional):
                </Text>
                <TextInput
                  value={inHouseRiderPhone}
                  onChangeText={setInHouseRiderPhone}
                  placeholder="+237 6XX XXX XXX"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="phone-pad"
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>
            )}

            <Button
              title="Confirm & Notify Driver"
              variant="primary"
              onPress={handleConfirmReady}
              style={{ marginTop: spacing.lg, backgroundColor: colors.primary[500] }}
            />
          </View>
        </View>
      </Modal>

      {/* ─── Decline Order Modal ─────────────────────────────────────────── */}
      <Modal
        visible={isDeclineModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeclineModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDeclineModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text variant="h2" bold color="#DC2626">
              Decline Order #{selectedOrderForDecline?.order_code}
            </Text>
            <Text variant="caption" secondary style={{ marginTop: 4, marginBottom: spacing.md }}>
              Please select a reason for declining. The buyer will receive a full instant escrow refund.
            </Text>

            {['Out of Stock', 'Store Closed / Capacity Limit', 'Customer Address Unreachable', 'Pricing Discrepancy'].map(
              (reason, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => setDeclineReason(reason)}
                  style={[
                    styles.declineOptionRow,
                    {
                      borderColor: declineReason === reason ? '#DC2626' : theme.border,
                      backgroundColor:
                        declineReason === reason
                          ? isDark
                            ? 'rgba(220,38,38,0.15)'
                            : '#FEF2F2'
                          : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={declineReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={declineReason === reason ? '#DC2626' : theme.textSecondary}
                  />
                  <Text variant="bodyMedium" style={{ marginLeft: spacing.sm }}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <View style={styles.modalActionsRow}>
              <Button
                title="Cancel"
                variant="secondary"
                size="small"
                onPress={() => setIsDeclineModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Confirm Decline"
                variant="danger"
                size="small"
                onPress={handleConfirmDecline}
                style={{ flex: 1.4 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Rider Handover Verification PIN Modal ───────────────────── */}
      <Modal
        visible={isHandoverModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHandoverModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsHandoverModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <View style={styles.pinIconBadge}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary[600]} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="h2" bold>
                  Rider Identification 🔑
                </Text>
                <Text variant="caption" color={colors.primary[600]} bold>
                  5-DIGIT HANDOVER PIN VERIFICATION
                </Text>
              </View>
            </View>

            <Text variant="caption" secondary style={{ marginVertical: spacing.xs }}>
              Ask rider <Text bold color={theme.text}>{selectedOrderForHandover?.transporter_name || 'assigned rider'}</Text> for the 5-digit verification PIN shown on their app for Order <Text bold>#{selectedOrderForHandover?.order_code}</Text>.
            </Text>

            <View style={[styles.pinInstructionCard, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary[600]} />
              <Text variant="caption" color={theme.text} style={{ flex: 1, marginLeft: 6 }}>
                Hand over the parcel ONLY when the system verifies the 5-digit code is correct.
              </Text>
            </View>

            <View style={{ marginVertical: spacing.md }}>
              <Text variant="caption" bold secondary style={{ marginBottom: 6 }}>
                ENTER RIDER 5-DIGIT VERIFICATION CODE:
              </Text>
              <TextInput
                value={enteredPin}
                onChangeText={(val) => {
                  setEnteredPin(val.replace(/[^0-9]/g, '').slice(0, 5));
                  if (pinError) setPinError('');
                }}
                placeholder="e.g. 84920"
                placeholderTextColor={theme.textTertiary}
                keyboardType="number-pad"
                maxLength={5}
                style={[
                  styles.pinInputField,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    color: theme.text,
                    borderColor: pinError ? '#EF4444' : theme.border,
                  },
                ]}
              />

              {selectedOrderForHandover?.pickup_pin && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setEnteredPin(selectedOrderForHandover.pickup_pin || '');
                    setPinError('');
                  }}
                  style={styles.demoPinFillBtn}
                >
                  <Ionicons name="sparkles" size={14} color={colors.primary[600]} />
                  <Text variant="caption" bold color={colors.primary[600]}>
                    Auto-fill Rider's Code for Testing: #{selectedOrderForHandover.pickup_pin}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {pinError !== '' && (
              <View style={styles.pinErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text variant="caption" bold color="#DC2626" style={{ marginLeft: 6, flex: 1 }}>
                  {pinError}
                </Text>
              </View>
            )}

            {/* Printable Parcel QR Tag Generation Button */}
            {selectedOrderForHandover && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  handleOpenPrintQRModal(selectedOrderForHandover);
                }}
                style={[
                  styles.printQRBannerBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : '#F0FDFA',
                    borderColor: colors.primary[400],
                  },
                ]}
              >
                <Ionicons name="qr-code-outline" size={18} color={colors.primary[600]} />
                <View style={{ flex: 1, marginLeft: spacing.xs }}>
                  <Text variant="caption" bold color={colors.primary[700]}>
                    🖨️ Printable Parcel Waybill QR Tag
                  </Text>
                  <Text variant="caption" secondary style={{ fontSize: 10 }}>
                    Generate & print package QR tag for rider scan matching
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
              </TouchableOpacity>
            )}

            <View style={styles.modalActionsRow}>
              <Button
                title="Cancel"
                variant="secondary"
                size="small"
                onPress={() => setIsHandoverModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="✓ Verify & Hand Over"
                variant="primary"
                size="small"
                onPress={handleConfirmHandoverVerification}
                style={{ flex: 1.5, backgroundColor: colors.primary[500] }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <PrintableParcelQRModal
        visible={isPrintQRModalVisible}
        order={selectedOrderForPrintQR}
        onClose={() => setIsPrintQRModalVisible(false)}
      />

      {toastMessage && <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />}

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  tabScrollContainer: {
    borderBottomWidth: 1,
    paddingVertical: spacing.xs + 2,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs + 2,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  tabCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  ordersListContent: {
    padding: spacing.base,
    paddingBottom: 40,
    gap: spacing.md,
  },
  orderCard: {
    padding: spacing.base,
    borderRadius: borderRadius.xl,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.xs + 2,
    marginBottom: spacing.xs + 2,
  },
  customerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  customerMeta: {
    flex: 1,
  },
  callBtn: {
    padding: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  itemsList: {
    gap: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemThumbnail: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  itemMeta: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  summaryBox: {
    borderTopWidth: 1,
    paddingTop: spacing.xs + 2,
    marginBottom: spacing.md,
    gap: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  pinInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs + 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  completedFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadows.lg,
  },
  pinIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(13,148,136,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInstructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
  },
  pinInputField: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
  },
  demoPinFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xs,
    paddingVertical: 4,
  },
  pinErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  printQRBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  dispatchOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  dispatchRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dispatchRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  declineOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.xs + 2,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});

