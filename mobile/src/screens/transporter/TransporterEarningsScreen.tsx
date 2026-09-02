import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, Input, BottomSheet, Toast } from '../../components/ui';
import { formatXAF, formatPhone } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { WalletService, TransporterService } from '../../services/api';

const MOCK_TRIP_HISTORY = [
  { id: 't1', code: 'WB-2026-9842', distance: '2.4 km', fee: 1500, date: 'Today, 14:20', type: 'TRIP_PAYOUT' },
  { id: 't2', code: 'WB-2026-7731', distance: '3.8 km', fee: 2000, date: 'Today, 11:45', type: 'TRIP_PAYOUT' },
  { id: 't3', code: 'WB-2026-3390', distance: '1.9 km', fee: 1500, date: 'Yesterday, 16:10', type: 'TRIP_PAYOUT' },
  { id: 't4', code: 'TIP-2026-004', distance: 'Customer Tip', fee: 500, date: 'Yesterday, 14:00', type: 'CUSTOMER_TIP' },
  { id: 't5', code: 'CASHOUT-881', distance: 'MTN MoMo (*126#)', fee: -10000, date: '2 days ago', type: 'CASHOUT' },
];

export const TransporterEarningsScreen = () => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  const [availablePayout, setAvailablePayout] = useState(48500);
  const [pendingEscrow, setPendingEscrow] = useState(12500);
  const [totalEarned, setTotalEarned] = useState(384500);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [trips, setTrips] = useState(MOCK_TRIP_HISTORY);
  const [refreshing, setRefreshing] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('+237 670 123 456');
  const [momoProvider, setMomoProvider] = useState<'momo' | 'om'>('momo');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadWalletData = useCallback(async () => {
    try {
      const data = await TransporterService.getDriverEarnings();
      if (data) {
        setAvailablePayout(data.available_payout);
        setPendingEscrow(data.pending_escrow);
        setTotalEarned(data.total_earned);
        if (data.transactions && data.transactions.length > 0) {
          setTrips(data.transactions as any);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, [loadWalletData]);

  const handlePresetPercentage = (percentage: number) => {
    const calc = Math.floor((availablePayout * percentage) / 100);
    setWithdrawAmount(calc.toString());
    setError('');
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || isNaN(amount) || amount < 500) {
      setError('Minimum payout amount is 500 FCFA.');
      return;
    }
    if (amount > availablePayout) {
      setError('Payout amount exceeds available driver balance.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await TransporterService.requestMoMoCashout(amount, withdrawPhone, momoProvider);

      setAvailablePayout((prev) => Math.max(0, prev - amount));
      setToastMessage(`Instant payout of ${formatXAF(amount)} initiated to ${formatPhone(withdrawPhone)}! 🚀`);
      setIsWithdrawModalVisible(false);
      setWithdrawAmount('');
    } catch (err: any) {
      setError(err?.message || 'Payout failed. Please check network connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const feeCalculation = withdrawAmount ? Math.floor(Number(withdrawAmount) * 0.01) : 0;
  const netPayout = withdrawAmount ? Math.max(0, Number(withdrawAmount) - feeCalculation) : 0;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <Text variant="caption" bold color={colors.primary[600]}>
          FLEET EARNINGS &amp; WALLET
        </Text>
        <Text variant="h1" bold style={styles.screenTitleText}>
          Driver Payout Ledger
        </Text>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* Wallet Overview Hero Card */}
        <Card style={[styles.walletCard, { backgroundColor: colors.primary[500] }]}>
          <View style={styles.walletHeaderRow}>
            <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
              AVAILABLE DRIVER CASHOUT BALANCE
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Ionicons
                name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <Text variant="display" bold color={colors.neutral[0]} style={styles.balanceText}>
            {isBalanceVisible ? formatXAF(availablePayout) : '•••••• FCFA'}
          </Text>

          <View style={styles.statsRow}>
            <View>
              <Text variant="caption" color="rgba(255,255,255,0.8)">
                Total Lifetime Earned
              </Text>
              <Text variant="bodyLarge" bold color={colors.primary[100]}>
                {isBalanceVisible ? formatXAF(totalEarned) : '••••••'}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color="rgba(255,255,255,0.8)">
                🔒 In Escrow (Pending)
              </Text>
              <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                {isBalanceVisible ? formatXAF(pendingEscrow) : '••••••'}
              </Text>
            </View>
          </View>

          <Button
            title="Instant Mobile Money Cashout 📲"
            variant="secondary"
            size="large"
            style={styles.payoutBtn}
            onPress={() => setIsWithdrawModalVisible(true)}
          />
        </Card>

        {/* Driver Shift Telemetry Cards Grid */}
        <View style={styles.telemetryGridRow}>
          <View style={[styles.telemetryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary[500]} />
            <Text variant="h2" bold style={{ marginTop: 2 }}>
              248
            </Text>
            <Text variant="caption" secondary>
              Trips Delivered
            </Text>
          </View>

          <View style={[styles.telemetryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="star-outline" size={20} color="#F59E0B" />
            <Text variant="h2" bold style={{ marginTop: 2 }}>
              4.95 ★
            </Text>
            <Text variant="caption" secondary>
              Fleet Rating
            </Text>
          </View>

          <View style={[styles.telemetryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="gift-outline" size={20} color={colors.primary[500]} />
            <Text variant="h2" bold style={{ marginTop: 2 }}>
              3,500
            </Text>
            <Text variant="caption" secondary>
              Tips (FCFA)
            </Text>
          </View>
        </View>

        {/* Transaction History Header */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h2" bold style={styles.sectionTitleText}>
            Driver Transaction History
          </Text>
          <Text variant="caption" secondary>
            Last {trips.length} Entries
          </Text>
        </View>

        <View style={styles.historyList}>
          {trips.map((item) => {
            const isCashout = item.fee < 0;
            return (
              <Card key={item.id} style={styles.tripCard}>
                <View style={styles.tripRow}>
                  <View style={[styles.iconCircle, { backgroundColor: isCashout ? '#FEE2E2' : colors.primary[50] }]}>
                    <Ionicons
                      name={isCashout ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
                      size={22}
                      color={isCashout ? '#EF4444' : colors.primary[500]}
                    />
                  </View>

                  <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                    <Text variant="bodyLarge" bold color={isCashout ? theme.text : colors.primary[500]}>
                      {item.code}
                    </Text>
                    <Text variant="caption" secondary>
                      {item.distance} • {item.date}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodyLarge" bold color={isCashout ? '#EF4444' : colors.primary[600]}>
                      {isCashout ? formatXAF(item.fee) : `+${formatXAF(item.fee)}`}
                    </Text>
                    <Badge label={isCashout ? 'CASHOUT' : 'CREDITED'} variant={isCashout ? 'error' : 'primary'} size="small" />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>


      {/* Payout Bottom Sheet Modal */}
      <BottomSheet
        visible={isWithdrawModalVisible}
        onClose={() => setIsWithdrawModalVisible(false)}
        title="Withdraw Driver Earnings to MoMo"
      >
        <Text variant="caption" secondary style={{ marginBottom: spacing.xs }}>
          SELECT MOBILE MONEY PROVIDER
        </Text>

        <View style={styles.momoTabRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMomoProvider('momo')}
            style={[
              styles.momoTabBtn,
              momoProvider === 'momo'
                ? { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }
                : { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <Text variant="caption" bold color={momoProvider === 'momo' ? '#FFFFFF' : theme.text}>
              MTN MoMo (*126#) 🟡
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMomoProvider('om')}
            style={[
              styles.momoTabBtn,
              momoProvider === 'om'
                ? { backgroundColor: '#EA580C', borderColor: '#EA580C' }
                : { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <Text variant="caption" bold color={momoProvider === 'om' ? '#FFFFFF' : theme.text}>
              Orange Money (#150#) 🟠
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Withdrawal Amount (FCFA)"
          placeholder="e.g. 10000"
          keyboardType="numeric"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          error={error}
        />

        {/* Percentage Preset Chips */}
        <View style={styles.presetChipRow}>
          {[25, 50, 75, 100].map((pct) => (
            <TouchableOpacity
              key={pct}
              activeOpacity={0.7}
              onPress={() => handlePresetPercentage(pct)}
              style={[styles.presetChip, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            >
              <Text variant="caption" bold color={colors.accent[500]}>
                {pct === 100 ? 'Max (100%)' : `${pct}%`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Mobile Money Registered Phone Number"
          placeholder="+237 6XX XXX XXX"
          keyboardType="phone-pad"
          value={withdrawPhone}
          onChangeText={setWithdrawPhone}
        />

        {withdrawAmount ? (
          <View style={styles.feeBreakdownBox}>
            <View style={styles.feeRow}>
              <Text variant="caption" secondary>
                Telecom Processing Fee (1%):
              </Text>
              <Text variant="caption" bold>
                {formatXAF(feeCalculation)}
              </Text>
            </View>
            <View style={styles.feeRow}>
              <Text variant="bodyMedium" bold>
                Net Amount Received in MoMo:
              </Text>
              <Text variant="bodyLarge" bold color="#10B981">
                {formatXAF(netPayout)}
              </Text>
            </View>
          </View>
        ) : null}

        <Button
          title={isProcessing ? 'Processing Payout...' : 'Confirm Instant Cashout ⚡'}
          variant="primary"
          size="large"
          loading={isProcessing}
          onPress={handleWithdraw}
          style={[styles.withdrawActionBtn, { backgroundColor: colors.primary[500] }]}
        />

      </BottomSheet>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onDismiss={() => setToastMessage(null)}
        />
      )}

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  screenTitleText: {
    fontSize: 22,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  walletCard: {
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceText: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  payoutBtn: {
    backgroundColor: colors.neutral[0],
  },
  telemetryGridRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  telemetryCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  sectionTitleText: {
    fontSize: 16,
  },
  historyList: {
    gap: spacing.sm,
  },
  tripCard: {
    padding: spacing.md,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoTabRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  momoTabBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetChipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  presetChip: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  feeBreakdownBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  withdrawActionBtn: {
    marginTop: spacing.xs,
  },
});
