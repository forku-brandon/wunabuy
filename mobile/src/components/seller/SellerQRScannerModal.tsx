import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatXAF } from '@wunabuy/utils';

export interface VerifiedOrderData {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  amountXAF: number;
  pickupPin: string;
  fulfillmentType: 'self_pickup' | 'transporter';
  transporterName?: string;
  escrowStatus: string;
}

export interface SellerQRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccessHandover?: (order: VerifiedOrderData) => void;
}

export const SellerQRScannerModal: React.FC<SellerQRScannerModalProps> = ({
  visible,
  onClose,
  onSuccessHandover,
}) => {
  const { theme, isDark } = useThemeStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    order?: VerifiedOrderData;
    errorMsg?: string;
  } | null>(null);
  const [isHandedOverSuccess, setIsHandedOverSuccess] = useState(false);

  // Laser animation line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && activeTab === 'camera' && !verificationResult) {
      scanLineAnim.setValue(0);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [visible, activeTab, verificationResult, scanLineAnim]);

  const handleReset = () => {
    setVerificationResult(null);
    setManualCode('');
    setIsVerifying(false);
    setScanned(false);
    setIsHandedOverSuccess(false);
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const processCodeVerification = (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(100);
      } catch {
        // Ignored on unsupported platforms
      }
    }

    setTimeout(() => {
      const clean = codeToVerify.trim().toUpperCase().replace('#', '');

      if (clean === 'INVALID' || clean === '00000') {
        setIsVerifying(false);
        setVerificationResult({
          success: false,
          errorMsg: 'Invalid or expired QR verification code. Please request the buyer to check their 5-digit PIN.',
        });
        return;
      }

      let order: VerifiedOrderData;

      if (clean.includes('ORD-9082') || clean === '9082') {
        order = {
          orderCode: 'ORD-9082-DLA',
          customerName: 'Ahmadou Bello (Dispatch Rider)',
          customerPhone: '+237 699 876 543',
          itemsSummary: '1x Samsung Galaxy S24 Ultra (512GB)',
          amountXAF: 450000,
          pickupPin: '90820',
          fulfillmentType: 'transporter',
          transporterName: 'Wunabuy Express Rider #402',
          escrowStatus: 'Locked in Escrow (Release on Handover)',
        };
      } else {
        // Default / PIN 84920 match
        order = {
          orderCode: `ORD-${clean || '84920'}-DLA`,
          customerName: 'Jean-Pierre Manga',
          customerPhone: '+237 670 123 456',
          itemsSummary: '2x Sony WH-1000XM5 Headphones (Black)',
          amountXAF: 185000,
          pickupPin: clean || '84920',
          fulfillmentType: 'self_pickup',
          escrowStatus: 'Locked in Escrow (Release on Handover)',
        };
      }

      setIsVerifying(false);
      setVerificationResult({
        success: true,
        order,
      });
    }, 1000);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || isVerifying || verificationResult) return;
    setScanned(true);
    processCodeVerification(data);
  };

  const handleConfirmHandover = () => {
    if (!verificationResult?.order) return;
    setIsHandedOverSuccess(true);
    if (onSuccessHandover) {
      onSuccessHandover(verificationResult.order);
    }
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 210],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[0] },
          ]}
        >
          {/* Top Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.modalHeaderLeft}>
              <Ionicons name="qr-code" size={22} color={colors.primary[500]} />
              <Text variant="h3" bold style={{ marginLeft: 8 }} color={theme.text}>
                Store QR & PIN Scanner
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCloseModal}
              style={[styles.closeBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Verification Mode Selector Tabs */}
          {!verificationResult && (
            <View style={[styles.tabContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('camera')}
                style={[
                  styles.tabBtn,
                  activeTab === 'camera' && [styles.tabBtnActive, { backgroundColor: theme.card }],
                ]}
              >
                <Ionicons
                  name="camera-outline"
                  size={16}
                  color={activeTab === 'camera' ? colors.primary[500] : theme.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  variant="caption"
                  bold={activeTab === 'camera'}
                  color={activeTab === 'camera' ? colors.primary[500] : theme.textSecondary}
                >
                  Camera Scanner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('manual')}
                style={[
                  styles.tabBtn,
                  activeTab === 'manual' && [styles.tabBtnActive, { backgroundColor: theme.card }],
                ]}
              >
                <Ionicons
                  name="keypad-outline"
                  size={16}
                  color={activeTab === 'manual' ? colors.primary[500] : theme.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  variant="caption"
                  bold={activeTab === 'manual'}
                  color={activeTab === 'manual' ? colors.primary[500] : theme.textSecondary}
                >
                  Manual PIN Code
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* MAIN BODY AREA */}
          <View style={styles.modalBody}>
            {/* Loading Verification Overlay */}
            {isVerifying && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text variant="bodyLarge" bold color={theme.text} style={{ marginTop: spacing.md }}>
                  Verifying Escrow Code...
                </Text>
                <Text variant="caption" secondary style={{ marginTop: 4 }}>
                  Connecting to Wunabuy Order Verification API
                </Text>
              </View>
            )}

            {/* VERIFICATION RESULT STATE */}
            {!isVerifying && verificationResult && (
              <View style={styles.resultContainer}>
                {verificationResult.success && verificationResult.order ? (
                  isHandedOverSuccess ? (
                    /* Success Handover Completion State */
                    <View style={styles.successCompletionCard}>
                      <View style={styles.successIconRing}>
                        <Ionicons name="checkmark-circle" size={56} color={colors.semantic.success[500]} />
                      </View>
                      <Text variant="h2" bold color={colors.semantic.success[700]} style={{ marginTop: spacing.sm }}>
                        Handover Confirmed! ✓
                      </Text>
                      <Text variant="bodyMedium" secondary style={{ textAlign: 'center', marginTop: spacing.xs }}>
                        Parcel released for <Text bold color={theme.text}>{verificationResult.order.orderCode}</Text>.
                      </Text>

                      <View style={[styles.escrowReleasePill, { backgroundColor: '#ECFDF5', borderColor: colors.semantic.success[500] }]}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.semantic.success[600]} />
                        <Text variant="caption" bold color={colors.semantic.success[700]} style={{ marginLeft: 6 }}>
                          {formatXAF(verificationResult.order.amountXAF)} Released to Wallet!
                        </Text>
                      </View>

                      <Button
                        title="Scan Next Order Code 📷"
                        variant="primary"
                        onPress={handleReset}
                        style={{ marginTop: spacing.lg, width: '100%', backgroundColor: colors.primary[500] }}
                      />
                    </View>
                  ) : (
                    /* Verified Order Preview Card */
                    <View style={[styles.orderVerifiedCard, { backgroundColor: isDark ? colors.neutral[800] : '#F0FDFA', borderColor: colors.primary[400] }]}>
                      <View style={styles.verifiedHeaderRow}>
                        <Badge label="VERIFIED MATCH ✓" variant="success" size="small" />
                        <Text variant="caption" bold color={colors.primary[700]}>
                          {verificationResult.order.orderCode}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={16} color={colors.primary[600]} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text variant="caption" secondary>Customer / Courier</Text>
                          <Text variant="bodyMedium" bold color={theme.text}>{verificationResult.order.customerName}</Text>
                          <Text variant="caption" color={colors.primary[600]}>{verificationResult.order.customerPhone}</Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Ionicons name="cube-outline" size={16} color={colors.primary[600]} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text variant="caption" secondary>Package Contents</Text>
                          <Text variant="bodyMedium" bold color={theme.text}>{verificationResult.order.itemsSummary}</Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={16} color={colors.primary[600]} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text variant="caption" secondary>Escrow Amount</Text>
                          <Text variant="h3" bold color={colors.primary[600]}>{formatXAF(verificationResult.order.amountXAF)}</Text>
                        </View>
                      </View>

                      <View style={styles.actionButtonGroup}>
                        <Button
                          title="Confirm Handover & Release Parcel ✓"
                          variant="primary"
                          onPress={handleConfirmHandover}
                          style={{ flex: 1, backgroundColor: colors.semantic.success[500] }}
                        />
                      </View>
                    </View>
                  )
                ) : (
                  /* Error State */
                  <View style={styles.errorCard}>
                    <Ionicons name="alert-circle" size={48} color={colors.semantic.error[500]} />
                    <Text variant="h3" bold color={colors.semantic.error[600]} style={{ marginTop: spacing.sm }}>
                      Verification Failed
                    </Text>
                    <Text variant="bodyMedium" secondary style={{ textAlign: 'center', marginTop: spacing.xs }}>
                      {verificationResult.errorMsg}
                    </Text>
                    <Button
                      title="Try Scanning Again 🔄"
                      variant="outline"
                      onPress={handleReset}
                      style={{ marginTop: spacing.md, width: '100%' }}
                    />
                  </View>
                )}
              </View>
            )}

            {/* CAMERA SCANNER TAB */}
            {!isVerifying && !verificationResult && activeTab === 'camera' && (
              <View style={styles.cameraContainer}>
                {/* Live Viewfinder Frame with Real Camera Sensor */}
                <View style={[styles.viewfinderFrame, { backgroundColor: '#0F172A' }]}>
                  {permission?.granted ? (
                    <CameraView
                      style={StyleSheet.absoluteFillObject}
                      enableTorch={isTorchOn}
                      onBarcodeScanned={scanned || isVerifying ? undefined : handleBarCodeScanned}
                      barcodeScannerSettings={{
                        barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                      }}
                    />
                  ) : (
                    <View style={styles.permissionBox}>
                      <Ionicons name="camera-outline" size={40} color="#94A3B8" />
                      <Text variant="bodyMedium" bold color="#FFFFFF" style={{ marginTop: 6 }}>
                        Camera Permission Required
                      </Text>
                      <Text variant="caption" color="rgba(255,255,255,0.7)" style={{ textAlign: 'center', marginVertical: spacing.xs }}>
                        Grant camera access to scan buyer PINs & QR codes live using your phone camera.
                      </Text>
                      <Button
                        title="Enable Camera Access"
                        variant="primary"
                        size="small"
                        onPress={requestPermission}
                        style={{ marginTop: spacing.xs, backgroundColor: colors.primary[500] }}
                      />
                    </View>
                  )}

                  {/* Corner framing brackets */}
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />

                  {/* Animated Laser Scanning Line */}
                  <Animated.View
                    style={[
                      styles.laserLine,
                      {
                        transform: [{ translateY }],
                        backgroundColor: colors.primary[500],
                      },
                    ]}
                  />

                  {/* Flashlight / Torch Toggle (If permission granted) */}
                  {permission?.granted && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsTorchOn(!isTorchOn)}
                      style={[
                        styles.torchBtn,
                        { backgroundColor: isTorchOn ? colors.accent[500] : 'rgba(0,0,0,0.6)' },
                      ]}
                    >
                      <Ionicons
                        name={isTorchOn ? 'flash' : 'flash-outline'}
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <Text variant="caption" secondary style={styles.cameraInstruction}>
                  Align buyer QR code or order barcode within the frame to auto-scan
                </Text>

                {/* Instant Test Sample QR Barcode Pills */}
                <View style={styles.sampleBarcodesRow}>
                  <Text variant="caption" bold color={theme.textSecondary} style={{ marginBottom: 4, width: '100%', textAlign: 'center' }}>
                    TAP TEST SAMPLE BARCODES:
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => processCodeVerification('84920')}
                    style={[styles.samplePill, { backgroundColor: isDark ? colors.neutral[800] : '#E0F2FE' }]}
                  >
                    <Text variant="caption" bold color={colors.primary[600]}>
                      🎟️ Buyer PIN (#84920)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => processCodeVerification('ORD-9082')}
                    style={[styles.samplePill, { backgroundColor: isDark ? colors.neutral[800] : '#FEF3C7' }]}
                  >
                    <Text variant="caption" bold color="#B45309">
                      📦 Dispatch QR (#9082)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => processCodeVerification('INVALID')}
                    style={[styles.samplePill, { backgroundColor: isDark ? colors.neutral[800] : '#FEE2E2' }]}
                  >
                    <Text variant="caption" bold color={colors.semantic.error[600]}>
                      ❌ Invalid Code
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* MANUAL CODE ENTRY TAB */}
            {!isVerifying && !verificationResult && activeTab === 'manual' && (
              <View style={styles.manualContainer}>
                <Ionicons name="keypad" size={40} color={colors.primary[500]} style={{ marginBottom: spacing.xs }} />
                <Text variant="h3" bold color={theme.text}>
                  Enter Pickup PIN / Order Code
                </Text>
                <Text variant="caption" secondary style={{ textAlign: 'center', marginTop: 4, marginBottom: spacing.md }}>
                  Type the buyer's 5-digit verification PIN (e.g. #84920) or order number to verify fulfillment.
                </Text>

                <View style={[styles.inputBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }]}>
                  <Text variant="h2" bold color={colors.primary[500]} style={{ marginRight: 6 }}>
                    #
                  </Text>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Enter code (e.g. 84920)"
                    placeholderTextColor={theme.textSecondary}
                    value={manualCode}
                    onChangeText={setManualCode}
                    keyboardType="default"
                    autoCapitalize="characters"
                    maxLength={15}
                  />
                </View>

                <Button
                  title="Verify Escrow Order Code ✓"
                  variant="primary"
                  onPress={() => processCodeVerification(manualCode)}
                  style={{ width: '100%', marginTop: spacing.md, backgroundColor: colors.primary[500] }}
                  disabled={!manualCode.trim()}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingBottom: spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: 4,
    borderRadius: borderRadius.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  tabBtnActive: {
    ...shadows.sm,
  },
  modalBody: {
    padding: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  cameraContainer: {
    alignItems: 'center',
  },
  viewfinderFrame: {
    width: 240,
    height: 240,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  permissionBox: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: '#0F172A',
    zIndex: 2,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.primary[500],
    zIndex: 3,
  },
  topLeft: {
    top: 12,
    left: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 12,
    right: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  laserLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 4,
  },
  torchBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  cameraInstruction: {
    marginTop: spacing.sm,
    fontSize: 12,
    textAlign: 'center',
  },
  sampleBarcodesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  samplePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  manualContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    paddingVertical: spacing.sm,
  },
  orderVerifiedCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  verifiedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  actionButtonGroup: {
    marginTop: spacing.md,
  },
  successCompletionCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowReleasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
