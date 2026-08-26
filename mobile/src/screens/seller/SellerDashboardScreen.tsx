import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge } from '../../components/ui';
import { KYCStatusBanner } from '../../components/seller/KYCStatusBanner';
import { KYCStatus } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const SellerDashboardScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.APPROVED);

  // Mock revenue balances
  const escrowBalance = 185000;
  const availableBalance = 450000;

  const handleStartKYC = () => {
    navigation.navigate('StoreKYC');
  };

  return (
    <ScreenContainer>
      {/* Dashboard Top Header */}
      <View style={styles.header}>
        <View>
          <Text variant="caption" secondary>
            MERCHANT DASHBOARD
          </Text>
          <Text variant="h1" bold color={colors.role.seller}>
            Douala Tech Hub 🏪
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddEditProduct')}
          style={styles.addProductHeaderBtn}
        >
          <Text variant="bodyLarge" color={colors.neutral[0]} bold>
            + Product
          </Text>
        </TouchableOpacity>
      </View>

      {/* KYC Verification Status Banner */}
      <KYCStatusBanner
        status={kycStatus}
        onStartKYC={handleStartKYC}
      />

      {/* Revenue & Wallet Overview Card */}
      <Card style={styles.walletCard}>
        <Text variant="caption" color="rgba(255,255,255,0.8)" bold style={styles.walletCardLabel}>
          TOTAL STORE BALANCES
        </Text>

        <View style={styles.balancesRow}>
          <View>
            <Text variant="caption" color="rgba(255,255,255,0.8)">
              Available Payout
            </Text>
            <Text variant="display" bold color={colors.neutral[0]}>
              {formatXAF(availableBalance)}
            </Text>
          </View>

          <View style={styles.escrowSubBox}>
            <Text variant="caption" color="rgba(255,255,255,0.8)">
              Locked in Escrow 🔒
            </Text>
            <Text variant="h2" bold color={colors.accent[300]}>
              {formatXAF(escrowBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.walletActionsRow}>
          <Button
            title="Request Payout (MoMo / Bank)"
            variant="secondary"
            size="small"
            fullWidth={false}
            onPress={() => navigation.navigate('SellerWallet')}
          />
        </View>
      </Card>

      {/* Fulfillment Orders Summary */}
      <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
        ORDERS TO FULFILL
      </Text>
      <View style={styles.statsGrid}>
        <Card style={styles.statBox}>
          <Text variant="display" bold color={colors.semantic.warning[500]}>
            3
          </Text>
          <Text variant="caption" secondary bold>
            Paid (Awaiting Prep)
          </Text>
        </Card>

        <Card style={styles.statBox}>
          <Text variant="display" bold color={colors.primary[500]}>
            2
          </Text>
          <Text variant="caption" secondary bold>
            Ready for Driver Pickup
          </Text>
        </Card>
      </View>

      {/* Action Shortcuts */}
      <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
        STORE MANAGEMENT
      </Text>
      <Card style={styles.shortcutsCard}>
        <TouchableOpacity
          style={styles.shortcutRow}
          onPress={() => navigation.navigate('AddEditProduct')}
        >
          <Text variant="bodyLarge">📦 List New Product Item</Text>
          <Text variant="bodyMedium" secondary>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutRow, styles.borderTop, { borderColor: theme.border }]}
          onPress={() => navigation.navigate('SellerProducts')}
        >
          <Text variant="bodyLarge">🏷️ Manage Catalog & Stock Levels</Text>
          <Text variant="bodyMedium" secondary>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutRow, styles.borderTop, { borderColor: theme.border }]}
          onPress={() => navigation.navigate('SellerWallet')}
        >
          <Text variant="bodyLarge">💳 Wallet Ledger & Payout History</Text>
          <Text variant="bodyMedium" secondary>›</Text>
        </TouchableOpacity>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  addProductHeaderBtn: {
    backgroundColor: colors.role.seller,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  walletCard: {
    backgroundColor: colors.neutral[900],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  walletCardLabel: {
    marginBottom: spacing.xs,
  },
  balancesRow: {
    marginBottom: spacing.md,
  },
  escrowSubBox: {
    marginTop: spacing.sm,
  },
  walletActionsRow: {
    flexDirection: 'row',
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  shortcutsCard: {
    paddingVertical: 0,
    marginBottom: spacing.xl,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  borderTop: {
    borderTopWidth: 1,
  },
});

