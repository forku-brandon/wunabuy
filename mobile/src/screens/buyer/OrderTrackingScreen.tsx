import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { OrderStatusStepper } from '../../components/order/OrderStatusStepper';
import { LiveTrackingMap } from '../../components/order/LiveTrackingMap';
import { DigitalSignatureModal } from '../../components/order/DigitalSignatureModal';
import { DisputeModal } from '../../components/order/DisputeModal';
import { OrderStatus, DisputeReason } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { formatXAF } from '@wunabuy/utils';

export const OrderTrackingScreen = ({ route, navigation }: any) => {
  const { orderId = 'WB-2026-9842' } = route.params || {};
  const { theme } = useThemeStore();

  const [status, setStatus] = useState<OrderStatus>(OrderStatus.EN_ROUTE);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmSignature = (signatureData: string) => {
    setStatus(OrderStatus.COMPLETED);
    setToastMessage('Delivery receipt confirmed! Escrow funds released to merchant.');
  };

  const handleSubmitDispute = (reason: DisputeReason, description: string) => {
    setStatus(OrderStatus.DISPUTED);
    setToastMessage('Dispute filed successfully! Escrow funds frozen under staff review.');
  };

  return (
    <ScreenContainer>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="h2">←</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text variant="h1" bold>
            Order {orderId}
          </Text>
          <Badge
            label={status.toUpperCase()}
            variant={
              status === OrderStatus.COMPLETED
                ? 'success'
                : status === OrderStatus.DISPUTED
                ? 'error'
                : 'primary'
            }
          />
        </View>
      </View>

      {/* Live Map View (When En Route or In Transit) */}
      {(status === OrderStatus.EN_ROUTE || status === OrderStatus.IN_TRANSIT) && (
        <LiveTrackingMap driverName="Samuel Mbida" driverPhone="+237 675 112 233" estimatedArrivalMin={15} />
      )}

      {/* 48-Hour Auto-Release Timer Notice */}
      <Card style={styles.autoReleaseCard}>
        <View style={styles.autoReleaseHeader}>
          <Text variant="h2">⏳</Text>
          <View style={styles.autoReleaseTextContainer}>
            <Text variant="bodyMedium" bold color={colors.primary[700]}>
              48-Hour Auto-Release Guarantee
            </Text>
            <Text variant="caption" color={colors.primary[700]} style={{ marginTop: 2 }}>
              Payment auto-releases to the seller 48 hours after delivery, unless you confirm earlier or open a dispute.
            </Text>
          </View>
        </View>
      </Card>

      {/* Order Status Timeline Stepper */}
      <Card style={styles.stepperCard}>
        <Text variant="caption" bold color={theme.textSecondary} style={{ marginBottom: spacing.sm }}>
          ORDER LIFECYCLE TIMELINE
        </Text>
        <OrderStatusStepper status={status} />
      </Card>

      {/* Action Buttons */}
      {status !== OrderStatus.COMPLETED && status !== OrderStatus.DISPUTED && (
        <View style={styles.actionsContainer}>
          <Button
            title="Confirm Receipt (Sign Delivery) →"
            variant="primary"
            onPress={() => setIsSignModalOpen(true)}
            style={styles.confirmBtn}
          />
          <Button
            title="Open Dispute"
            variant="outline"
            onPress={() => setIsDisputeModalOpen(true)}
          />
        </View>
      )}

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
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backBtn: {
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoReleaseCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
    marginBottom: spacing.lg,
  },
  autoReleaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  autoReleaseTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  stepperCard: {
    marginBottom: spacing.lg,
  },
  actionsContainer: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  confirmBtn: {
    marginBottom: 0,
  },
});
