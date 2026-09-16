import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '../ui';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors, borderRadius, shadows } from '@wunabuy/design-tokens';
import { NotificationManager } from '../../services/notifications/notificationManager';

interface PermissionPromptModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const PermissionPromptModal: React.FC<PermissionPromptModalProps> = ({
  visible,
  onDismiss,
}) => {
  const { theme, isDark } = useThemeStore();

  const handleEnable = async () => {
    await NotificationManager.requestPermissions();
    onDismiss();
  };

  const handleDismiss = async () => {
    await NotificationManager.setPromptedPermission();
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Top Hero Icon with Pulse Ring */}
          <View style={styles.iconCircleWrapper}>
            <View style={[styles.iconOuterRing, { backgroundColor: isDark ? 'rgba(13, 148, 136, 0.15)' : '#CCFBF1' }]}>
              <View style={[styles.iconInnerCircle, { backgroundColor: colors.primary[500] }]}>
                <Ionicons name="notifications" size={32} color={colors.neutral[0]} />
              </View>
            </View>
          </View>

          {/* Heading */}
          <Text variant="h2" bold align="center" style={styles.title}>
            Stay Updated in Real Time
          </Text>

          <Text variant="caption" secondary align="center" style={styles.subtitle}>
            Enable device notifications to receive instant updates throughout your shopping and delivery journey:
          </Text>

          {/* Value Propositions */}
          <View style={[styles.featureList, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="cube-outline" size={18} color="#0284C7" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" bold>
                  Escrow & Order Milestones
                </Text>
                <Text variant="caption" secondary>
                  Immediate alerts when orders are confirmed, dispatched, and delivered.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="bicycle-outline" size={18} color="#D97706" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" bold>
                  Live Transporter Arrival
                </Text>
                <Text variant="caption" secondary>
                  Real-time notification when the delivery rider arrives at your door.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="pricetag-outline" size={18} color="#16A34A" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" bold>
                  Flash Sales & Promotions
                </Text>
                <Text variant="caption" secondary>
                  Exclusive access to limited-time store deals and vouchers.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Button
              title="Enable Push Notifications"
              variant="primary"
              onPress={handleEnable}
              style={{ width: '100%', marginBottom: spacing.xs }}
            />

            <TouchableOpacity activeOpacity={0.7} onPress={handleDismiss} style={styles.maybeLaterBtn}>
              <Text variant="caption" secondary align="center" style={{ fontWeight: '500' }}>
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.xl,
  },
  iconCircleWrapper: {
    marginBottom: spacing.md,
  },
  iconOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 18,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  featureList: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  maybeLaterBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
