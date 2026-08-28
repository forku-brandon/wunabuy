import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge, Input, BottomSheet, Toast } from '../../components/ui';
import { formatXAF, formatPhone } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { WalletService } from '../../services/api';

const MOCK_TRIP_HISTORY = [
  { id: 't1', code: 'WB-2026-9842', distance: '2.4 km', fee: 1500, date: 'Today, 14:20' },
  { id: 't2', code: 'WB-2026-7731', distance: '3.8 km', fee: 2000, date: 'Today, 11:45' },
  { id: 't3', code: 'WB-2026-3390', distance: '1.9 km', fee: 1500, date: 'Yesterday, 16:10' },
];

export const TransporterEarningsScreen = () => {
  const { theme } = useThemeStore();
  const [availablePayout, setAvailablePayout] = useState(14000);
  const [totalEarned, setTotalEarned] = useState(18500);
  const [trips, setTrips] = useState(MOCK_TRIP_HISTORY);
  const [refreshing, setRefreshing] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('+237 670 123 456');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadWalletData = useCallback(async () => {
    try {
      const walletData = await WalletService.getWallet();
      if (walletData) {
        setAvailablePayout(walletData.balance_available);
        setTotalEarned(walletData.total_deposited || walletData.balance_total);
      }
    } catch {
      // Safe fallback
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadWalletData();
  }, [loadWalletData]);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || isNaN(amount) || amount < 500) {
      setError('Minimum withdrawal amount is 500 FCFA.');
      return;
    }
    if (amount > availablePayout) {
      setError('Withdrawal amount exceeds available driver balance.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await WalletService.withdrawWallet({
        amount,
        destination_details: {
          type: 'momo' as any,
          phone: withdrawPhone,
          bank_code: null,
          account_number: withdrawPhone,
        },
      });

      setAvailablePayout((prev) => Math.max(0, prev - amount));
      setToastMessage(`Payout of ${formatXAF(amount)} initiated to ${formatPhone(withdrawPhone)}!`);
      setIsWithdrawModalVisible(false);
      setWithdrawAmount('');
    } catch (err: any) {
      setError(err?.message || 'Payout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text variant="h1" bold color={colors.role.transporter}>
          Transporter Wallet 💳
        </Text>
        <Text variant="caption" secondary>
          Payouts processed directly to Mobile Money
        </Text>
      </View>

      <View style={styles.content}>
        {/* Wallet Overview Card */}
        <Card style={styles.walletCard}>
          <Text variant="caption" color="rgba(255,255,255,0.8)" bold>
            AVAILABLE DRIVER BALANCE
          </Text>
          <Text variant="display" bold color={colors.neutral[0]} style={styles.balanceText}>
            {formatXAF(availablePayout)}
          </Text>

          <View style={styles.statsRow}>
            <View>
              <Text variant="caption" color="rgba(255,255,255,0.8)">
                Total Earned
              </Text>
              <Text variant="bodyLarge" bold color={colors.accent[300]}>
                {formatXAF(totalEarned)}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color="rgba(255,255,255,0.8)">
                Completed Trips
              </Text>
              <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                {trips.length} Trips
              </Text>
            </View>
          </View>

          <Button
            title="Withdraw Earnings to MoMo"
            variant="secondary"
            size="medium"
            style={styles.payoutBtn}
            onPress={() => setIsWithdrawModalVisible(true)}
          />
        </Card>

        {/* Trip History Header */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
          COMPLETED TRIP HISTORY
        </Text>

        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.role.transporter}
              colors={[colors.role.transporter]}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.tripCard}>
              <View style={styles.tripRow}>
                <View>
                  <Text variant="bodyLarge" bold color={colors.primary[500]}>
                    {item.code} ({item.distance})
                  </Text>
                  <Text variant="caption" secondary>
                    {item.date}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodyLarge" bold color={colors.role.transporter}>
                    +{formatXAF(item.fee)}
                  </Text>
                  <Badge label="CREDITED" variant="success" size="small" />
                </View>
              </View>
            </Card>
          )}
        />
      </View>

      <BottomSheet
        visible={isWithdrawModalVisible}
        onClose={() => setIsWithdrawModalVisible(false)}
        title="Withdraw Driver Earnings"
      >
        <Input
          label="Withdrawal Amount (FCFA)"
          placeholder="e.g. 5000"
          keyboardType="numeric"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          error={error}
        />

        <Input
          label="Mobile Money Phone Number"
          placeholder="+237 6XX XXX XXX"
          keyboardType="phone-pad"
          value={withdrawPhone}
          onChangeText={setWithdrawPhone}
        />

        <Button
          title={isProcessing ? 'Processing Payout...' : 'Confirm Instant Withdrawal'}
          variant="primary"
          onPress={handleWithdraw}
          style={styles.withdrawActionBtn}
        />
      </BottomSheet>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  walletCard: {
    backgroundColor: colors.role.transporter,
    padding: spacing.base,
    marginBottom: spacing.lg,
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
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  tripCard: {
    padding: spacing.md,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawActionBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
