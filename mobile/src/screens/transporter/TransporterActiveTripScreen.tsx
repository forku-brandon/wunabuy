import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { LiveTrackingMap } from '../../components/order/LiveTrackingMap';
import { DigitalSignatureModal } from '../../components/order/DigitalSignatureModal';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { TransporterService, ActiveTripPayload } from '../../services/api';

export const TransporterActiveTripScreen = ({ route, navigation }: any) => {
  const { jobId = 'job_1', stage = 1 } = route.params || {};
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  // 1: Navigating to Store Pickup, 2: Merchant Handover Verification, 3: Navigating to Buyer, 4: Proof of Delivery Signature
  const [currentStage, setCurrentStage] = useState<number>(stage);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tripData, setTripData] = useState<ActiveTripPayload>({
    job_id: jobId,
    order_code: 'WB-2026-9842',
    current_stage: stage,
    verification_code: '7842',
    delivery_fee: 1500,
    items_summary: '1x Samsung Galaxy A54 5G (Package size: Small)',
    store_name: 'Douala Tech Hub (Akwa)',
    store_address: 'Rue Joss, Akwa, Douala',
    store_phone: '+237 670 111 222',
    buyer_name: 'Sanusi Olamide',
    buyer_address: 'Boulevard de la Liberté, Bonanjo, Douala',
    buyer_phone: '+237 690 333 444',
  });

  useEffect(() => {
    async function fetchTrip() {
      const data = await TransporterService.getActiveTrip(jobId);
      setTripData(data);
    }
    fetchTrip();
  }, [jobId]);

  const orderCode = tripData.order_code;
  const storeName = tripData.store_name;
  const storeAddress = tripData.store_address;
  const storePhone = tripData.store_phone;
  const buyerName = tripData.buyer_name;
  const buyerAddress = tripData.buyer_address;
  const buyerPhone = tripData.buyer_phone;
  const itemsSummary = tripData.items_summary;
  const deliveryFee = tripData.delivery_fee;
  const verificationCode = tripData.verification_code;

  const handleNextStage = async () => {
    let nextStage = currentStage;
    if (currentStage === 1) {
      nextStage = 2;
      setCurrentStage(2);
      setToastMessage('Arrived at store! Inspect package & verify handover PIN.');
    } else if (currentStage === 2) {
      nextStage = 3;
      setCurrentStage(3);
      setToastMessage('Package picked up! En route to buyer destination 🏠');
    } else if (currentStage === 3) {
      nextStage = 4;
      setCurrentStage(4);
      setIsSignModalOpen(true);
    }
    await TransporterService.updateTripStage(jobId, nextStage);
  };

  const handleCompleteDelivery = async (signatureData: string) => {
    setIsSignModalOpen(false);
    setToastMessage(`Delivery completed! Signature verified & ${formatXAF(deliveryFee)} credited to wallet. 💰`);
    await TransporterService.submitProofOfDelivery(jobId, signatureData);
    setTimeout(() => {
      navigation.navigate('TransporterJobs');
    }, 1200);
  };


  const handleEmergencySOS = () => {
    Alert.alert(
      'Driver Emergency SOS Triggered',
      'Contacting Wunabuy 24/7 Safety Dispatch & sharing live GPS coordinates.\nEmergency Phone: 800-WUNABUY-SOS'
    );
  };

  const getStageTitle = () => {
    switch (currentStage) {
      case 1:
        return 'Stage 1 of 4: Navigating to Store Pickup';
      case 2:
        return 'Stage 2 of 4: Merchant Package Verification';
      case 3:
        return 'Stage 3 of 4: Navigating to Buyer Doorstep';
      case 4:
        return 'Stage 4 of 4: Customer Signature & POD';
      default:
        return 'Active Dispatch Trip';
    }
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('TransporterJobs');
              }
            }}
            style={[styles.backBtnCircle, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
            <Text variant="caption" bold color={colors.primary[600]}>
              ACTIVE TRIP • #{orderCode}
            </Text>
            <Text variant="h2" bold numberOfLines={1}>
              {getStageTitle()}
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={handleEmergencySOS} style={styles.sosCircleBtn}>
            <Ionicons name="alert-circle" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 4-Step Progress Indicator Bar */}
        <View style={styles.stepProgressRow}>
          {[1, 2, 3, 4].map((stepNum) => (
            <View
              key={stepNum}
              style={[
                styles.stepProgressBar,
                stepNum <= currentStage
                  ? { backgroundColor: colors.primary[500] }
                  : { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Live GPS Map Display */}
        <LiveTrackingMap driverName="You (Rider)" driverPhone="+237 670 000 000" estimatedArrivalMin={currentStage <= 2 ? 8 : 12} />

        {/* Dispatch Order Specs Card */}
        <Card style={styles.dispatchCard}>
          <View style={styles.dispatchHeaderRow}>
            <View style={{ flex: 1, marginRight: spacing.xs }}>
              <Text variant="caption" secondary bold>
                ITEMS TO TRANSPORT
              </Text>
              <Text variant="bodyLarge" bold color={colors.primary[500]} style={{ marginTop: 2 }}>
                📦 {itemsSummary}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', minWidth: 90 }}>
              <Text variant="caption" secondary bold>
                DRIVER PAYOUT
              </Text>
              <Text variant="h2" bold color={colors.primary[600]}>
                {formatXAF(deliveryFee)}
              </Text>
            </View>
          </View>


          {/* Location Focus Info */}
          {currentStage <= 2 ? (
            <View style={[styles.locationBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50], borderColor: colors.primary[500] }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="caption" bold color={colors.primary[600]}>
                  🏬 PICKUP MERCHANT STORE
                </Text>
                <Badge label="STAGE 1 & 2" variant="primary" size="small" />
              </View>
              <Text variant="bodyLarge" bold style={{ marginTop: 2 }}>
                {storeName}
              </Text>
              <Text variant="caption" secondary>
                {storeAddress}
              </Text>

              <View style={styles.contactActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Calling Store', `Dialing merchant store: ${storePhone}`)}
                  style={[styles.callBtn, { backgroundColor: isDark ? colors.neutral[700] : 'rgba(13,148,136,0.12)' }]}
                >
                  <Ionicons name="call-outline" size={16} color={colors.primary[600]} />
                  <Text variant="caption" bold color={colors.primary[600]}>
                    Call Store ({storePhone})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.locationBox, { backgroundColor: isDark ? colors.neutral[800] : '#ECFDF5', borderColor: '#10B981' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="caption" bold color="#10B981">
                  🏠 BUYER DROP-OFF DESTINATION
                </Text>
                <Badge label="STAGE 3 & 4" variant="success" size="small" />
              </View>
              <Text variant="bodyLarge" bold style={{ marginTop: 2 }}>
                {buyerName}
              </Text>
              <Text variant="caption" secondary>
                {buyerAddress}
              </Text>

              <View style={styles.contactActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Calling Buyer', `Dialing customer: ${buyerPhone}`)}
                  style={[styles.callBtn, { backgroundColor: isDark ? colors.neutral[700] : '#D1FAE5' }]}
                >
                  <Ionicons name="call-outline" size={16} color="#10B981" />
                  <Text variant="caption" bold color="#10B981">
                    Call Customer ({buyerPhone})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stage 2 Verification PIN Card */}
          {currentStage === 2 && (
            <View style={[styles.pinVerificationBox, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF', borderColor: '#6366F1' }]}>
              <Text variant="caption" bold color="#6366F1">
                🔑 MERCHANT HANDOVER VERIFICATION PIN
              </Text>
              <Text variant="h1" bold align="center" color="#6366F1" style={styles.pinCodeText}>
                {verificationCode}
              </Text>
              <Text variant="caption" secondary align="center">
                Ask merchant to confirm PIN #{verificationCode} before loading package.
              </Text>
            </View>
          )}

          {/* Dynamic Action Button */}
          <Button
            title={
              currentStage === 1
                ? 'Arrived at Store (Proceed to Verification) 🏬'
                : currentStage === 2
                ? 'Confirm Package Picked Up & Start Ride 📦'
                : currentStage === 3
                ? 'Arrived at Doorstep (Capture Signature) 🏠'
                : 'Complete Delivery & Release Escrow ✍️'
            }
            variant="primary"
            size="large"
            onPress={currentStage === 4 ? () => setIsSignModalOpen(true) : handleNextStage}
            style={[styles.stageActionBtn, { backgroundColor: colors.primary[500] }]}
          />
        </Card>

      </ScrollView>

      {/* Digital Signature Pad Modal */}
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
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  backBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  stepProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  dispatchCard: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  dispatchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  locationBox: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  contactActionRow: {
    marginTop: spacing.sm,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  pinVerificationBox: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  pinCodeText: {
    letterSpacing: 8,
    fontSize: 28,
    marginVertical: spacing.xs,
  },
  stageActionBtn: {
    marginTop: spacing.xs,
  },
});
