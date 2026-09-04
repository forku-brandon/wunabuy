import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { OrderStatusStepper } from '../../components/order/OrderStatusStepper';
import { LiveTrackingMap } from '../../components/order/LiveTrackingMap';
import { DigitalSignatureModal } from '../../components/order/DigitalSignatureModal';
import { DisputeModal } from '../../components/order/DisputeModal';
import { OrderStatus, DisputeReason } from '@wunabuy/types';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { formatXAF, getStatusLabel } from '@wunabuy/utils';

export const OrderTrackingScreen = ({ route, navigation }: any) => {
  const { orderId = 'WNB-2026-9842' } = route.params || {};
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();

  const [status, setStatus] = useState<OrderStatus>(OrderStatus.EN_ROUTE);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmSignature = (signatureData: string) => {
    setStatus(OrderStatus.COMPLETED);
    setToastMessage('Delivery receipt confirmed! 100% Escrow funds released to merchant.');
    setIsSignModalOpen(false);
  };

  const handleSubmitDispute = (reason: DisputeReason, description: string) => {
    setStatus(OrderStatus.DISPUTED);
    setToastMessage('Dispute opened! Escrow funds frozen under staff mediation.');
    setIsDisputeModalOpen(false);
  };

  const handleCallDriver = () => {
    Linking.openURL('tel:+237675112233');
  };

  const handleMessageDriver = () => {
    navigation.navigate('ChatConversation', { conversationId: 'conv_driver_1' });
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation.getParent()?.canGoBack()) {
              navigation.getParent()?.goBack();
            }
          }}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text variant="h1" bold style={styles.headerTitle}>
            Order #{orderId}
          </Text>
          <Text variant="caption" secondary>
            Real-time GPS Tracking &amp; Escrow Control
          </Text>
        </View>

        <Badge
          label={getStatusLabel(status)}
          variant={
            status === OrderStatus.COMPLETED
              ? 'success'
              : status === OrderStatus.DISPUTED
              ? 'error'
              : 'primary'
          }
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Interactive Live GPS Tracking Map Canvas */}
        <LiveTrackingMap
          driverName="Jean-Paul Mbida"
          driverPhone="+237 675 112 233"
          driverRating="4.9 ★"
          estimatedArrivalMin={8}
          distanceKm={1.8}
          onCallDriver={handleCallDriver}
          onMessageDriver={handleMessageDriver}
        />

        {/* 48-Hour Auto-Release Protection Guarantee Banner */}
        <Card style={styles.autoReleaseCard}>
          <View style={styles.autoReleaseHeader}>
            <View style={styles.shieldIconCircle}>
              <Ionicons name="shield-checkmark" size={22} color={colors.primary[500]} />
            </View>
            <View style={styles.autoReleaseTextContainer}>
              <Text variant="bodyLarge" bold color={colors.primary[700]}>
                48-Hour Escrow Protection Guarantee
              </Text>
              <Text variant="caption" color={colors.primary[700]} style={{ marginTop: 2 }}>
                Payment auto-releases to the seller 48 hours after delivery confirmation, unless you open a dispute.
              </Text>
            </View>
          </View>
        </Card>

        {/* Order Lifecycle Timeline Stepper Card */}
        <Card style={styles.stepperCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary[500]} style={{ marginRight: 6 }} />
            <Text variant="caption" bold color={theme.textSecondary} style={{ letterSpacing: 0.5 }}>
              ORDER FULFILLMENT TIMELINE
            </Text>
          </View>

          <OrderStatusStepper status={status} />
        </Card>

        {/* Order Summary Item Card */}
        <Card style={styles.itemSummaryCard}>
          <Text variant="caption" bold color={theme.textSecondary} style={{ marginBottom: spacing.xs, letterSpacing: 0.5 }}>
            ORDERED ITEMS SUMMARY
          </Text>

          <View style={styles.itemRow}>
            <View style={styles.itemThumbPlaceholder}>
              <Ionicons name="hardware-chip-outline" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.itemTextCol}>
              <Text variant="bodyMedium" bold numberOfLines={1}>
                Samsung Galaxy A54 5G (128GB)
              </Text>
              <Text variant="caption" secondary>
                Seller: Douala Tech Hub (Akwa)
              </Text>
              <Text variant="bodyLarge" bold color={colors.primary[500]} style={{ marginTop: 2 }}>
                {formatXAF(188000)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Primary Action Buttons */}
        {status !== OrderStatus.COMPLETED && status !== OrderStatus.DISPUTED && (
          <View style={styles.actionsContainer}>
            <Button
              title="Confirm Receipt & Release Escrow ➔"
              variant="primary"
              onPress={() => setIsSignModalOpen(true)}
              style={styles.confirmBtn}
            />

            <Button
              title="Apply for Dispute (Freeze Funds)"
              variant="outline"
              onPress={() => setIsDisputeModalOpen(true)}
              style={styles.disputeBtn}
            />
          </View>
        )}
      </ScrollView>

      {/* Confirm Signature & Receipt Modal */}
      <DigitalSignatureModal
        visible={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirmSignature={handleConfirmSignature}
      />

      {/* Open Dispute Modal */}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.xs + 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  autoReleaseCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  autoReleaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  autoReleaseTextContainer: {
    flex: 1,
  },
  stepperCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemSummaryCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  itemThumbPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemTextCol: {
    flex: 1,
  },
  actionsContainer: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  confirmBtn: {
    height: 50,
  },
  disputeBtn: {
    borderColor: colors.semantic.error[500],
  },
});
