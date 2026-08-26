import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { LiveTrackingMap } from '../../components/order/LiveTrackingMap';
import { DigitalSignatureModal } from '../../components/order/DigitalSignatureModal';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const TransporterActiveTripScreen = ({ route, navigation }: any) => {
  const { jobId = 'job_1' } = route.params || {};
  const { theme } = useThemeStore();

  const [tripStage, setTripStage] = useState<'EN_ROUTE_STORE' | 'PICKED_UP' | 'EN_ROUTE_BUYER' | 'DELIVERED'>('EN_ROUTE_STORE');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleNextStage = () => {
    if (tripStage === 'EN_ROUTE_STORE') {
      setTripStage('PICKED_UP');
      setToastMessage('Arrived at store & picked up package!');
    } else if (tripStage === 'PICKED_UP') {
      setTripStage('EN_ROUTE_BUYER');
      setToastMessage('En route to buyer destination!');
    } else if (tripStage === 'EN_ROUTE_BUYER') {
      setTripStage('DELIVERED');
      setIsSignModalOpen(true);
    }
  };

  const handleCompleteDelivery = (signatureData: string) => {
    setToastMessage('Delivery completed & buyer signature captured! Transport fee credited to wallet.');
    setTimeout(() => {
      navigation.navigate('TransporterJobs');
    }, 1200);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="h2">←</Text>
        </TouchableOpacity>
        <Text variant="h1" bold color={colors.role.transporter}>
          Active Delivery Navigation 🛵
        </Text>
        <Text variant="caption" secondary>
          Order WB-2026-9842 • 2.4 km trip
        </Text>
      </View>

      <LiveTrackingMap driverName="You (On Duty)" driverPhone="+237 670 000 000" estimatedArrivalMin={10} />

      <Card style={styles.stageCard}>
        <Text variant="caption" bold color={theme.textSecondary} style={{ marginBottom: spacing.xs }}>
          TRIP STATUS PROGRESSION
        </Text>

        <View style={styles.stageRow}>
          <Badge
            label={tripStage.replace(/_/g, ' ')}
            variant="warning"
          />
          <Text variant="h3" bold color={colors.role.transporter}>
            Earnings: {formatXAF(1500)}
          </Text>
        </View>
      </Card>

      <Button
        title={
          tripStage === 'EN_ROUTE_STORE'
            ? 'Arrived at Store & Picked Up Package'
            : tripStage === 'PICKED_UP'
            ? 'En Route to Buyer Address'
            : 'Arrived at Destination (Capture Signature)'
        }
        variant="primary"
        onPress={handleNextStage}
        style={styles.stageBtn}
      />

      <DigitalSignatureModal
        visible={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirmSignature={handleCompleteDelivery}
      />

      {toastMessage && <Toast message={toastMessage} type="success" />}
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
  stageCard: {
    marginBottom: spacing.lg,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  stageBtn: {
    backgroundColor: colors.role.transporter,
    marginBottom: spacing.xl,
  },
});
