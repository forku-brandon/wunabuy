import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isScanningProcess, setIsScanningProcess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tripData, setTripData] = useState<ActiveTripPayload>({
    job_id: jobId,
    order_code: 'WB-2026-9842',
    current_stage: stage,
    verification_code: '7842',
    delivery_fee: 1500,
    items_summary: 'Samsung Galaxy A54 5G (128GB - Factory Sealed)',
    package_specs: 'Fragile Electronics • Small Box (< 2 kg)',
    store_name: 'Douala Tech Hub (Akwa Branch)',
    store_address: 'Rue Joss, Quartier Akwa, Douala, Cameroon',
    store_landmark_directions: 'Opposite Place du Gouvernement, Next to Akwa Mall (1st Floor, Suite 104)',
    store_phone: '+237 670 123 456 / +237 699 876 543',
    store_operating_hours: 'Mon - Sat: 8:00 AM - 6:30 PM',
    store_handover_instructions: '🔑 Present rider ID & ask merchant for pickup PIN #7842. Package ready at Counter #2.',
    buyer_name: 'Marie Claire Ngono',
    buyer_address: 'Boulevard de la Liberté, Quartier Akwa, Douala, Cameroon',
    buyer_landmark_directions: 'Near BICEC Bank Main Gate, White 2-Story Building with Blue Gate (2nd Floor)',
    buyer_phone: '+237 671 234 567',
    buyer_delivery_instructions: 'Ring doorbell at front gate or call buyer on arrival. Buyer will inspect parcel & sign POD.',
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
  const storeLandmark = tripData.store_landmark_directions;
  const storePhone = tripData.store_phone;
  const storeHours = tripData.store_operating_hours;
  const storeHandoverNote = tripData.store_handover_instructions;
  const buyerName = tripData.buyer_name;
  const buyerAddress = tripData.buyer_address;
  const buyerLandmark = tripData.buyer_landmark_directions;
  const buyerPhone = tripData.buyer_phone;
  const buyerInstructions = tripData.buyer_delivery_instructions;
  const itemsSummary = tripData.items_summary;
  const packageSpecs = tripData.package_specs;
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

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || isScanningProcess) return;
    setScanned(true);
    setIsScanningProcess(true);

    setTimeout(() => {
      setIsScanningProcess(false);
      setIsScannerOpen(false);
      setToastMessage(`⚡ Live Package QR/Barcode #${data} scanned! Verified order specs.`);
    }, 600);
  };

  const handleSimulateScan = (presetCode?: string) => {
    setScanned(true);
    setIsScanningProcess(true);
    const code = presetCode || 'WB-2026-9842';
    setTimeout(() => {
      setIsScanningProcess(false);
      setIsScannerOpen(false);
      setToastMessage(`📦 Package QR #${code} scanned! Order verified & ready for handover.`);
    }, 600);
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

          {/* App Bar Scanner Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsScannerOpen(true)}
            style={[styles.backBtnCircle, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50], borderColor: colors.primary[200], borderWidth: 1 }]}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.primary[600]} />
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
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text variant="caption" secondary bold style={{ letterSpacing: 0.5 }}>
                ITEM TO TRANSPORT
              </Text>
              <Text variant="bodyLarge" bold color={colors.primary[500]} style={{ marginTop: 2 }}>
                📦 {itemsSummary}
              </Text>
              {packageSpecs && (
                <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 2 }}>
                  {packageSpecs}
                </Text>
              )}
            </View>
            <View style={styles.payoutBadgePillContainer}>
              <Text variant="caption" secondary bold style={{ fontSize: 10 }}>
                PAYOUT
              </Text>
              <View style={styles.payoutPillBadge}>
                <Text variant="bodyLarge" bold color={colors.primary[600]}>
                  {formatXAF(deliveryFee)}
                </Text>
              </View>
            </View>
          </View>

          {/* Emphasized Route Addresses with Active Stage Highlight */}
          <View style={styles.routeSectionContainer}>
            {/* 1. Store Pickup Location (Merchant Collection Specs) */}
            <View
              style={[
                styles.locationBox,
                {
                  backgroundColor: currentStage <= 2 ? (isDark ? 'rgba(13,148,136,0.15)' : '#F0FDFA') : (isDark ? colors.neutral[800] : colors.neutral[50]),
                  borderColor: currentStage <= 2 ? colors.primary[500] : theme.border,
                  borderWidth: currentStage <= 2 ? 2 : 1,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.xs }}>
                  <Ionicons name="storefront" size={16} color={colors.primary[600]} />
                  <Text variant="caption" bold color={colors.primary[700]} style={{ marginLeft: 6 }}>
                    1. MERCHANT PICKUP LOCATION
                  </Text>
                </View>
                {currentStage <= 2 ? (
                  <Badge label="ACTIVE STEP" variant="primary" size="small" />
                ) : (
                  <Badge label="COMPLETED ✓" variant="success" size="small" />
                )}
              </View>

              {/* Store Name & Address */}
              <Text variant="bodyLarge" bold style={{ marginTop: 4 }}>
                🏬 {storeName}
              </Text>
              <Text variant="bodyMedium" color={theme.textSecondary} style={{ marginTop: 2 }}>
                📍 {storeAddress}
              </Text>

              {/* Detailed Landmark Directions */}
              {storeLandmark && (
                <View style={styles.specDetailRow}>
                  <Ionicons name="compass-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text}>
                    Landmarks:
                  </Text>
                  <Text variant="caption" secondary style={{ marginLeft: 4, flex: 1 }}>
                    {storeLandmark}
                  </Text>
                </View>
              )}

              {/* Store Phone Contacts Row */}
              <View style={styles.specDetailRow}>
                <Ionicons name="call-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                <Text variant="caption" bold color={theme.text}>
                  Store Phone:
                </Text>
                <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 4, flex: 1 }}>
                  {storePhone}
                </Text>
              </View>

              {/* Operating Hours */}
              {storeHours && (
                <View style={styles.specDetailRow}>
                  <Ionicons name="time-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text}>
                    Counter Hours:
                  </Text>
                  <Text variant="caption" secondary style={{ marginLeft: 4, flex: 1 }}>
                    {storeHours}
                  </Text>
                </View>
              )}

              {/* Pickup Handover Instructions */}
              {storeHandoverNote && (
                <View style={[styles.handoverNoteBox, { backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF', borderColor: theme.border }]}>
                  <Text variant="caption" bold color={colors.primary[700]} style={{ lineHeight: 16 }}>
                    {storeHandoverNote}
                  </Text>
                </View>
              )}

              {/* Action Buttons for Merchant Collection */}
              <View style={styles.contactActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Calling Merchant Store', `Dialing store counter: ${storePhone}`)}
                  style={[styles.callBtn, { flex: 1, backgroundColor: isDark ? colors.neutral[700] : '#CCFBF1' }]}
                >
                  <Ionicons name="call" size={14} color={colors.primary[700]} />
                  <Text variant="caption" bold color={colors.primary[700]}>
                    Call Merchant 📞
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('GPS Navigation', `Opening GPS turn-by-turn directions to: ${storeAddress}`)}
                  style={[styles.callBtn, { paddingHorizontal: spacing.md, backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                >
                  <Ionicons name="navigate" size={14} color={theme.text} />
                  <Text variant="caption" bold color={theme.text}>
                    GPS Route 🧭
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Buyer Delivery Destination (Doorstep Drop-off Specs) */}
            <View
              style={[
                styles.locationBox,
                {
                  backgroundColor: currentStage > 2 ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : (isDark ? colors.neutral[800] : colors.neutral[50]),
                  borderColor: currentStage > 2 ? '#10B981' : theme.border,
                  borderWidth: currentStage > 2 ? 2 : 1,
                  marginTop: spacing.md,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.xs }}>
                  <Ionicons name="location" size={16} color="#10B981" />
                  <Text variant="caption" bold color="#10B981" style={{ marginLeft: 6 }}>
                    2. BUYER DELIVERY DESTINATION
                  </Text>
                </View>
                {currentStage > 2 && <Badge label="ACTIVE STEP" variant="success" size="small" />}
              </View>

              {/* Buyer Name & Address */}
              <Text variant="bodyLarge" bold style={{ marginTop: 4 }}>
                👤 {buyerName}
              </Text>
              <Text variant="bodyMedium" color={theme.textSecondary} style={{ marginTop: 2 }}>
                📍 {buyerAddress}
              </Text>

              {/* Detailed Buyer Landmark Directions */}
              {buyerLandmark && (
                <View style={styles.specDetailRow}>
                  <Ionicons name="compass-outline" size={14} color="#10B981" style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text}>
                    Landmarks:
                  </Text>
                  <Text variant="caption" secondary style={{ marginLeft: 4, flex: 1 }}>
                    {buyerLandmark}
                  </Text>
                </View>
              )}

              {/* Customer Phone Row */}
              <View style={styles.specDetailRow}>
                <Ionicons name="call-outline" size={14} color="#10B981" style={{ marginRight: 6 }} />
                <Text variant="caption" bold color={theme.text}>
                  Customer Phone:
                </Text>
                <Text variant="caption" bold color="#10B981" style={{ marginLeft: 4, flex: 1 }}>
                  {buyerPhone}
                </Text>
              </View>

              {/* Delivery Drop-off Instructions */}
              {buyerInstructions && (
                <View style={[styles.handoverNoteBox, { backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF', borderColor: theme.border }]}>
                  <Text variant="caption" bold color="#059669" style={{ lineHeight: 16 }}>
                    📌 Drop-off Note: {buyerInstructions}
                  </Text>
                </View>
              )}

              {/* Action Buttons for Buyer Delivery */}
              <View style={styles.contactActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Calling Buyer', `Dialing customer: ${buyerPhone}`)}
                  style={[styles.callBtn, { flex: 1, backgroundColor: isDark ? colors.neutral[700] : '#D1FAE5' }]}
                >
                  <Ionicons name="call" size={14} color="#10B981" />
                  <Text variant="caption" bold color="#10B981">
                    Call Customer 📞
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('GPS Navigation', `Opening GPS turn-by-turn directions to buyer: ${buyerAddress}`)}
                  style={[styles.callBtn, { paddingHorizontal: spacing.md, backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                >
                  <Ionicons name="navigate" size={14} color={theme.text} />
                  <Text variant="caption" bold color={theme.text}>
                    GPS Route 🧭
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

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
      {/* Live QR & Barcode Scanner Modal */}
      <Modal
        visible={isScannerOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsScannerOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
            <View style={styles.topRow}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setIsScannerOpen(false)} style={styles.backBtnCircle}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                <Text variant="caption" bold color={colors.primary[600]}>
                  WAYBILL & HANDOVER VERIFIER 📷
                </Text>
                <Text variant="h2" bold numberOfLines={1}>
                  Live Trip Package Scanner
                </Text>
              </View>
              <Badge label="ACTIVE TRIP" variant="primary" size="small" />
            </View>
          </View>

          <ScrollView style={{ flex: 1, padding: spacing.base }}>
            {/* Live Viewfinder */}
            <View style={{
              backgroundColor: '#0F172A',
              height: 220,
              borderRadius: borderRadius.lg,
              borderWidth: 2,
              borderColor: colors.primary[500],
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  enableTorch={torchEnabled}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                  }}
                />
              ) : (
                <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: spacing.base, backgroundColor: '#0F172A' }}>
                  <Ionicons name="camera-outline" size={36} color="#94A3B8" />
                  <Text variant="bodyMedium" bold color="#FFFFFF" align="center" style={{ marginTop: 6 }}>
                    Live Camera Hardware Sensor
                  </Text>
                  <Text variant="caption" color="rgba(255,255,255,0.7)" align="center" style={{ marginTop: 2, marginBottom: spacing.xs }}>
                    Enable camera access to scan package waybills and QR codes live.
                  </Text>
                  <Button
                    title="Grant Camera Permission"
                    variant="primary"
                    size="small"
                    onPress={requestPermission}
                  />
                </View>
              )}

              {/* Laser line */}
              <View style={{
                position: 'absolute',
                left: 20,
                right: 20,
                height: 2,
                backgroundColor: '#EF4444',
              }} />

              {/* Torch Button */}
              {permission?.granted && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setTorchEnabled(!torchEnabled)}
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: torchEnabled ? colors.accent[500] : 'rgba(15,23,42,0.85)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: borderRadius.full,
                  }}
                >
                  <Ionicons name={torchEnabled ? 'flash' : 'flash-off'} size={16} color={torchEnabled ? '#000000' : '#FFFFFF'} />
                  <Text variant="caption" bold color={torchEnabled ? '#000000' : '#FFFFFF'}>
                    {torchEnabled ? 'Torch ON' : 'Torch OFF'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Sensor Status Tag */}
              <View style={{
                position: 'absolute',
                bottom: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(15,23,42,0.85)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: borderRadius.full,
              }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: scanned ? colors.accent[500] : '#10B981' }} />
                <Text variant="caption" bold color="#FFFFFF">
                  {scanned ? 'WAYBILL QR DETECTED!' : 'LIVE CAMERA SCANNER ACTIVE'}
                </Text>
              </View>
            </View>

            {/* Quick Sample Presets */}
            <Text variant="caption" secondary bold style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
              ACTIVE TRIP WAYBILL PRESET
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSimulateScan('WB-2026-9842')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: spacing.sm + 2,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <Ionicons name="cube-outline" size={24} color={colors.primary[500]} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="bodyMedium" bold>
                  📦 Order #{orderCode} Waybill QR
                </Text>
                <Text variant="caption" secondary>
                  {storeName} • {itemsSummary}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <Button
              title={isScanningProcess ? 'Verifying Package Code...' : '⚡ Scan & Verify Active Trip Package'}
              variant="primary"
              size="large"
              loading={isScanningProcess}
              onPress={() => handleSimulateScan('WB-2026-9842')}
              style={{ marginTop: spacing.lg, marginBottom: spacing.xl, backgroundColor: colors.primary[500] }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* POD Signature Capture Modal */}
      <DigitalSignatureModal
        visible={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirmSignature={handleCompleteDelivery}
      />

      {toastMessage && <Toast message={toastMessage} type="success" onDismiss={() => setToastMessage(null)} />}

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
  payoutBadgePillContainer: {
    alignItems: 'flex-end',
  },
  payoutPillBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
    marginTop: 2,
  },
  routeSectionContainer: {
    marginBottom: spacing.md,
  },
  locationBox: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  contactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  specDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  handoverNoteBox: {
    padding: spacing.xs + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.xs + 2,
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
    letterSpacing: 6,
    fontSize: 22,
    marginVertical: spacing.xs,
  },

  stageActionBtn: {
    marginTop: spacing.xs,
  },
});
