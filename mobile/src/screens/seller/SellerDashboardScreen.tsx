import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge } from '../../components/ui';
import { KYCStatusBanner } from '../../components/seller/KYCStatusBanner';
import { KYCStatus } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useSellerStore } from '../../stores/seller.store';
import { SellerService, KYCService } from '../../services/api';

export const SellerDashboardScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const {
    storeName,
    availableBalance,
    escrowLockedBalance,
    orders,
  } = useSellerStore();

  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.APPROVED);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [kycData] = await Promise.all([
        KYCService.getStoreKYCStatus(),
        SellerService.getStoreDashboard(),
      ]);

      if (kycData?.status) {
        setKycStatus(kycData.status as any);
      }
    } catch {
      // Fallbacks handled
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartKYC = () => {
    navigation.navigate('StoreKYC');
  };

  const pendingAcceptanceCount = orders.filter((o) => o.status === 'pending_acceptance').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready_for_pickup').length;

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.role.seller}
          colors={[colors.role.seller]}
        />
      }
    >
      {/* Dashboard Top Header */}
      <View style={styles.header}>
        <View>
          <Text variant="caption" secondary bold>
            MERCHANT DASHBOARD
          </Text>
          <Text variant="h1" bold color={colors.role.seller}>
            {storeName} 🏪
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
      <Card style={[styles.walletCard, { backgroundColor: isDark ? colors.neutral[900] : colors.role.seller }]}>
        <View style={styles.walletHeaderRow}>
          <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
            TOTAL STORE BALANCES
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            style={styles.eyeToggleBtn}
          >
            <Ionicons
              name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.balancesRow}>
          <View>
            <Text variant="caption" color="rgba(255,255,255,0.8)">
              Available for Payout
            </Text>
            <Text variant="display" bold color={colors.neutral[0]}>
              {isBalanceVisible ? formatXAF(availableBalance) : '•••••••• FCFA'}
            </Text>
          </View>

          <View style={styles.escrowSubBox}>
            <Text variant="caption" color="#FDE68A" bold>
              🔒 Locked in Escrow (48h Protection)
            </Text>
            <Text variant="h2" bold color="#FDE68A">
              {isBalanceVisible ? formatXAF(escrowLockedBalance) : '•••••• FCFA'}
            </Text>
          </View>
        </View>

        <View style={styles.walletActionsRow}>
          <Button
            title="Request Payout (Instant MoMo)"
            variant="secondary"
            size="small"
            fullWidth={false}
            onPress={() => navigation.navigate('SellerWallet')}
          />
        </View>
      </Card>

      {/* Fulfillment Orders Summary */}
      <View style={styles.sectionHeaderRow}>
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
          ORDERS TO FULFILL
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('SellerOrders')}>
          <Text variant="caption" bold color={colors.role.seller}>
            View All ({orders.length}) ›
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SellerOrders')}
          style={styles.statBoxWrapper}
        >
          <Card
            style={[
              styles.statBox,
              pendingAcceptanceCount > 0 && { borderColor: '#EF4444', borderWidth: 1 },
            ]}
          >
            <Text variant="display" bold color={pendingAcceptanceCount > 0 ? '#EF4444' : colors.semantic.warning[500]}>
              {pendingAcceptanceCount}
            </Text>
            <Text variant="caption" secondary bold style={{ textAlign: 'center', marginTop: 2 }}>
              {pendingAcceptanceCount > 0 ? '⏳ Urgent (2H Timer)' : 'Pending Prep'}
            </Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SellerOrders')}
          style={styles.statBoxWrapper}
        >
          <Card style={styles.statBox}>
            <Text variant="display" bold color={colors.role.seller}>
              {preparingCount}
            </Text>
            <Text variant="caption" secondary bold style={{ textAlign: 'center', marginTop: 2 }}>
              In Packing
            </Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SellerOrders')}
          style={styles.statBoxWrapper}
        >
          <Card style={styles.statBox}>
            <Text variant="display" bold color={colors.primary[500]}>
              {readyCount}
            </Text>
            <Text variant="caption" secondary bold style={{ textAlign: 'center', marginTop: 2 }}>
              Ready for Driver
            </Text>
          </Card>
        </TouchableOpacity>
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
          onPress={() => navigation.navigate('SellerOrders')}
        >
          <Text variant="bodyLarge">📋 Order Fulfillment Queue</Text>
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
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  eyeToggleBtn: {
    padding: 4,
  },
  balancesRow: {
    marginBottom: spacing.md,
  },
  escrowSubBox: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  walletActionsRow: {
    flexDirection: 'row',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBoxWrapper: {
    flex: 1,
  },
  statBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
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

