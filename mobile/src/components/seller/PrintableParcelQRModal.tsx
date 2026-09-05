import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge } from '../ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { formatXAF, formatDate } from '@wunabuy/utils';

export interface PrintableParcelQRModalProps {
  visible: boolean;
  onClose: () => void;
  order: {
    id: string;
    order_code: string;
    customer_name: string;
    customer_phone: string;
    items_summary: string;
    total_amount: number;
    pickup_pin: string;
    transporter_name?: string;
    delivery_address?: string;
    created_at?: string;
  } | null;
}

export const PrintableParcelQRModal: React.FC<PrintableParcelQRModalProps> = ({
  visible,
  onClose,
  order,
}) => {
  const { theme, isDark } = useThemeStore();
  const [testScanResult, setTestScanResult] = useState<{
    matched: boolean;
    scannedCode: string;
    assignedCode: string;
  } | null>(null);

  if (!order) return null;

  const handlePrintTag = () => {
    Alert.alert(
      '🖨️ Printing Parcel Waybill Tag',
      `Shipping Tag for Order #${order.order_code} (PIN: #${order.pickup_pin}) generated successfully.\nLabel sent to store thermal printer & saved to device.`,
      [{ text: 'OK' }]
    );
  };

  const handleSimulateTransporterScan = (isCorrectParcel: boolean) => {
    const scannedCode = isCorrectParcel ? order.order_code : 'ORD-MISMATCH-999';
    const matched = scannedCode === order.order_code;
    setTestScanResult({
      matched,
      scannedCode,
      assignedCode: order.order_code,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="qr-code-outline" size={24} color={colors.primary[500]} />
              <Text variant="h2" bold style={{ marginLeft: 8 }}>
                Parcel Waybill & QR Tag
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
            {/* Printable Waybill Shipping Tag Card */}
            <View style={[styles.waybillCard, { backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF', borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
              {/* Header Banner */}
              <View style={styles.waybillTopBanner}>
                <Text variant="caption" bold color="#FFFFFF" style={{ letterSpacing: 1 }}>
                  WUNABUY EXPRESS SHIPPING TAG
                </Text>
                <Badge label="ESCROW PROTECTED" variant="success" size="small" />
              </View>

              {/* QR Code Graphical Display */}
              <View style={styles.qrDisplayBox}>
                <View style={styles.qrFrame}>
                  <Ionicons name="qr-code" size={130} color={isDark ? '#FFFFFF' : '#0F172A'} />
                </View>

                {/* Big Verification PIN Pill */}
                <View style={styles.pinPill}>
                  <Text variant="caption" bold color={colors.primary[700]}>
                    RIDER VERIFICATION PIN
                  </Text>
                  <Text variant="h1" bold color={colors.primary[600]} style={{ letterSpacing: 4 }}>
                    #{order.pickup_pin}
                  </Text>
                </View>
              </View>

              {/* Waybill Specs Table */}
              <View style={[styles.detailsTable, { borderColor: theme.border }]}>
                <View style={styles.detailRow}>
                  <Text variant="caption" bold secondary style={styles.colLabel}>ORDER CODE:</Text>
                  <Text variant="bodyMedium" bold color={colors.primary[600]}>{order.order_code}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="caption" bold secondary style={styles.colLabel}>CONTENTS:</Text>
                  <Text variant="bodyMedium" bold color={theme.text} style={{ flex: 1 }}>{order.items_summary}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="caption" bold secondary style={styles.colLabel}>RECIPIENT:</Text>
                  <Text variant="bodyMedium" color={theme.text} style={{ flex: 1 }}>
                    {order.customer_name} ({order.customer_phone})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="caption" bold secondary style={styles.colLabel}>TRANSPORTER:</Text>
                  <Text variant="bodyMedium" bold color={colors.semantic.info[500]} style={{ flex: 1 }}>
                    {order.transporter_name || 'Wunabuy Express Rider #402'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Transporter Scan Matching Test Section */}
            <View style={[styles.testSection, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                <Ionicons name="hardware-chip-outline" size={16} color={colors.primary[600]} />
                <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 6 }}>
                  TRANSPORTER SCAN MATCHING TEST:
                </Text>
              </View>

              <Text variant="caption" secondary style={{ marginBottom: spacing.sm }}>
                Simulate how the transporter's scanner compares parcel QR tags on pickup:
              </Text>

              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSimulateTransporterScan(true)}
                  style={[styles.testBtn, { backgroundColor: '#D1FAE5', borderColor: colors.semantic.success[500] }]}
                >
                  <Text variant="caption" bold color={colors.semantic.success[700]}>
                    Test Correct Scan Match ✓
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSimulateTransporterScan(false)}
                  style={[styles.testBtn, { backgroundColor: '#FEE2E2', borderColor: colors.semantic.error[500] }]}
                >
                  <Text variant="caption" bold color={colors.semantic.error[600]}>
                    Test Wrong Item Match ❌
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Test Scan Result Alert Box */}
              {testScanResult && (
                <View
                  style={[
                    styles.resultAlertBox,
                    {
                      backgroundColor: testScanResult.matched ? '#ECFDF5' : '#FEF2F2',
                      borderColor: testScanResult.matched ? colors.semantic.success[500] : colors.semantic.error[500],
                    },
                  ]}
                >
                  <Ionicons
                    name={testScanResult.matched ? 'checkmark-circle' : 'alert-circle'}
                    size={22}
                    color={testScanResult.matched ? colors.semantic.success[600] : colors.semantic.error[600]}
                  />
                  <View style={{ flex: 1, marginLeft: spacing.xs }}>
                    <Text
                      variant="caption"
                      bold
                      color={testScanResult.matched ? colors.semantic.success[700] : colors.semantic.error[600]}
                    >
                      {testScanResult.matched
                        ? '✅ PARCEL MATCH CONFIRMED!'
                        : '❌ WRONG ITEM WARNING!'}
                    </Text>
                    <Text variant="caption" color={theme.text} style={{ fontSize: 11, marginTop: 2 }}>
                      {testScanResult.matched
                        ? `Scanned tag (${testScanResult.scannedCode}) matches assigned dispatch (${testScanResult.assignedCode}). Right item for Rider #402!`
                        : `Scanned tag (${testScanResult.scannedCode}) does NOT match assigned dispatch (${testScanResult.assignedCode}). Do NOT pick up this item!`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.actionFooter}>
            <Button
              title="🖨️ Print Waybill / Save Tag"
              variant="primary"
              onPress={handlePrintTag}
              style={{ flex: 1, backgroundColor: colors.primary[500] }}
            />
            <Button
              title="Close"
              variant="secondary"
              onPress={onClose}
              style={{ width: 90, marginLeft: spacing.sm }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    ...shadows.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  closeBtn: {
    padding: 4,
  },
  waybillCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  waybillTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  qrDisplayBox: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrFrame: {
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    marginBottom: spacing.sm,
  },
  pinPill: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[400],
  },
  detailsTable: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colLabel: {
    width: 105,
    fontSize: 11,
  },
  testSection: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  testBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
