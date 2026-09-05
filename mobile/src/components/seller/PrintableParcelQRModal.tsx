import React from 'react';
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
import { Text, Button, Badge } from '../ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

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

  if (!order) return null;

  const handlePrintTag = () => {
    Alert.alert(
      '🖨️ Printing Parcel QR Code',
      `QR Code for Order #${order.order_code} (PIN: #${order.pickup_pin}) sent to printer.\nAttached to package for transporter scan verification.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
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
                Parcel QR Tag
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
            {/* Printable Waybill Tag Box */}
            <View style={[styles.waybillCard, { backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF', borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
              {/* Top Banner */}
              <View style={styles.waybillTopBanner}>
                <Text variant="caption" bold color="#FFFFFF" style={{ letterSpacing: 1 }}>
                  PARCEL VERIFICATION QR CODE
                </Text>
                <Badge label="RIDER READY" variant="success" size="small" />
              </View>

              {/* Centered QR Barcode */}
              <View style={styles.qrDisplayBox}>
                <View style={styles.qrFrame}>
                  <Ionicons name="qr-code" size={160} color={isDark ? '#FFFFFF' : '#0F172A'} />
                </View>

                {/* Big Order Code & PIN Pill */}
                <View style={styles.codePill}>
                  <Text variant="caption" bold color={colors.primary[700]}>
                    ORDER CODE: #{order.order_code}
                  </Text>
                  <Text variant="h1" bold color={colors.primary[600]} style={{ letterSpacing: 4, marginTop: 2 }}>
                    #{order.pickup_pin}
                  </Text>
                </View>
              </View>

              {/* Rider & Item Info Summary */}
              <View style={[styles.infoBox, { borderColor: theme.border }]}>
                <View style={styles.infoRow}>
                  <Ionicons name="bicycle-outline" size={16} color={colors.primary[500]} style={{ marginRight: 8 }} />
                  <Text variant="caption" bold secondary style={{ width: 90 }}>RIDER:</Text>
                  <Text variant="bodyMedium" bold color={theme.text} style={{ flex: 1 }}>
                    {order.transporter_name || 'Wunabuy Express Rider #402'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="cube-outline" size={16} color={colors.primary[500]} style={{ marginRight: 8 }} />
                  <Text variant="caption" bold secondary style={{ width: 90 }}>PACKAGE:</Text>
                  <Text variant="bodyMedium" bold color={theme.text} style={{ flex: 1 }}>
                    {order.items_summary}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer: Print vs Cancel */}
          <View style={styles.actionFooter}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title="Print QR Code 🖨️"
              variant="primary"
              onPress={handlePrintTag}
              style={{ flex: 1.5, backgroundColor: colors.primary[500] }}
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
    backgroundColor: 'rgba(0,0,0,0.65)',
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
    marginBottom: spacing.xs,
  },
  waybillTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  qrDisplayBox: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrFrame: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  codePill: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[400],
    width: '100%',
  },
  infoBox: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: spacing.xs + 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
