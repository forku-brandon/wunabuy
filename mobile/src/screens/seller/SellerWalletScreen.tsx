import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { useSellerStore, SellerTransaction } from '../../stores/seller.store';
import { useThemeStore } from '../../stores/theme.store';
import { formatXAF, formatDate } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { SellerService } from '../../services/api';

type LedgerFilter = 'all' | 'payout' | 'escrow_release' | 'commission_deduction';

export const SellerWalletScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const {
    availableBalance,
    escrowLockedBalance,
    totalRevenue,
    totalPaidOut,
    transactions,
    requestPayout,
  } = useSellerStore();

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeFilter, setActiveFilter] = useState<LedgerFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payout Modal State
  const [isPayoutModalVisible, setIsPayoutModalVisible] = useState(false);
  const [payoutProvider, setPayoutProvider] = useState<'mtn' | 'orange'>('mtn');
  const [payoutPhone, setPayoutPhone] = useState('+237 670 123 456');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      await SellerService.getStoreDashboard();
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.type === activeFilter;
  });

  const parsedAmount = parseInt(payoutAmount.replace(/\D/g, ''), 10) || 0;
  const telecomFee = Math.round(parsedAmount * 0.01);
  const netPayout = Math.max(0, parsedAmount - telecomFee);

  const handleSetAmountPreset = (fraction: number) => {
    const amount = Math.floor(availableBalance * fraction);
    setPayoutAmount(String(amount));
  };

  const handleConfirmPayout = async () => {
    if (parsedAmount <= 0) {
      setToastMessage('Please enter a valid payout amount.');
      return;
    }
    if (parsedAmount > availableBalance) {
      setToastMessage('Payout amount exceeds available balance.');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const apiRes = await SellerService.requestPayout({
        amount: parsedAmount,
        phone: payoutPhone,
        provider: payoutProvider,
      });
      const res = requestPayout(parsedAmount, payoutPhone, payoutProvider);
      setIsSubmittingPayout(false);
      setIsPayoutModalVisible(false);
      setPayoutAmount('');
      const refCode = apiRes.reference || res.reference;
      setToastMessage(`Payout request submitted! Ref: ${refCode}`);
    } catch (err: any) {
      setIsSubmittingPayout(false);
      setToastMessage('Payout failed. Please check network connection.');
    }
  };


  const ListHeader = (
    <>
      {/* ─── Top Balance & Escrow Banner Card ───────────────────────────── */}
      <View style={[styles.walletCard, { backgroundColor: isDark ? colors.neutral[900] : colors.primary[500] }]}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Top Header Label & Eye Toggle */}
        <View style={styles.walletHeaderRow}>
          <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
            STORE AVAILABLE BALANCE
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            style={styles.eyeToggleBtn}
          >
            <Ionicons
              name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Large Balance Display */}
        <Text variant="display" bold color="#FFFFFF" style={styles.mainBalanceText}>
          {isBalanceVisible ? formatXAF(availableBalance) : '•••••••• FCFA'}
        </Text>

        {/* Escrow Locked Sub-Banner */}
        <View style={styles.escrowLockedBox}>
          <View style={styles.escrowRow}>
            <Ionicons name="lock-closed" size={14} color="#FDE68A" />
            <Text variant="caption" bold color="#FDE68A" style={{ marginLeft: 4 }}>
              Locked in Escrow (48h Protection):
            </Text>
          </View>
          <Text variant="bodyLarge" bold color="#FFFFFF">
            {isBalanceVisible ? formatXAF(escrowLockedBalance) : '•••••• FCFA'}
          </Text>
        </View>

        {/* Request Payout CTA */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setIsPayoutModalVisible(true)}
          style={[
            styles.payoutCtaBtn,
            { opacity: availableBalance > 0 ? 1 : 0.6 },
          ]}
          disabled={availableBalance <= 0}
        >
          <Ionicons name="arrow-up-circle" size={20} color={colors.primary[600]} />
          <Text variant="bodyMedium" bold color={colors.primary[600]} style={{ marginLeft: spacing.xs }}>
            Request Payout (Instant MoMo)
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Financial Performance Stats ───────────────────────────────── */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text variant="caption" secondary bold>
            All-Time Revenue
          </Text>
          <Text variant="bodyLarge" bold color={colors.primary[600]} style={{ marginTop: 2 }}>
            {isBalanceVisible ? formatXAF(totalRevenue) : '••••••'}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Text variant="caption" secondary bold>
            Total Paid Out
          </Text>
          <Text variant="bodyLarge" bold color={colors.semantic.success[500]} style={{ marginTop: 2 }}>
            {isBalanceVisible ? formatXAF(totalPaidOut) : '••••••'}
          </Text>
        </Card>
      </View>

      {/* ─── Ledger Header & Filter Pills ─────────────────────────────── */}
      <View style={styles.ledgerHeader}>
        <Text variant="h2" bold>
          Transaction History
        </Text>
        <Text variant="caption" secondary>
          Audit trail of payouts and escrow fund releases
        </Text>
      </View>

      <View style={styles.filterPillsRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'escrow_release', label: 'Escrow Released' },
          { key: 'payout', label: 'Payouts' },
          { key: 'commission_deduction', label: 'Platform Fees' },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(tab.key as LedgerFilter)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive
                    ? colors.primary[500]
                    : isDark
                    ? colors.neutral[800]
                    : colors.neutral[100],
                },
              ]}
            >
              <Text
                variant="caption"
                bold
                color={isActive ? colors.neutral[0] : theme.textSecondary}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text variant="h1" bold color={colors.primary[600]}>
          Store Wallet 💳
        </Text>
        <Badge label="Active Escrow" variant="primary" size="small" />
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        renderItem={({ item }) => {
          const isRelease = item.type === 'escrow_release';
          const isPayout = item.type === 'payout';

          return (
            <Card style={styles.txCard}>
              <View style={styles.txRow}>
                {/* Transaction Icon */}
                <View
                  style={[
                    styles.txIconCircle,
                    {
                      backgroundColor: isRelease
                        ? '#DCFCE7'
                        : isPayout
                        ? '#EFF6FF'
                        : '#FEE2E2',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      isRelease
                        ? 'arrow-down-circle'
                        : isPayout
                        ? 'arrow-up-circle'
                        : 'receipt-outline'
                    }
                    size={22}
                    color={
                      isRelease
                        ? colors.semantic.success[500]
                        : isPayout
                        ? colors.primary[600]
                        : '#DC2626'
                    }
                  />
                </View>

                {/* Description & Reference */}
                <View style={styles.txMeta}>
                  <Text variant="bodyMedium" bold numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text variant="caption" secondary style={{ marginTop: 2 }}>
                    Ref: {item.reference} • {formatDate(item.created_at)}
                  </Text>
                </View>

                {/* Amount */}
                <Text
                  variant="bodyLarge"
                  bold
                  color={
                    isRelease
                      ? colors.semantic.success[500]
                      : isPayout
                      ? colors.primary[600]
                      : '#DC2626'
                  }
                >
                  {isRelease ? '+' : '-'} {formatXAF(item.amount)}
                </Text>
              </View>
            </Card>
          );
        }}
      />

      {/* ─── Payout Request Modal ────────────────────────────────────────── */}
      <Modal
        visible={isPayoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPayoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsPayoutModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text variant="h2" bold>
                Request Store Payout
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsPayoutModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Provider Selection */}
            <Text variant="caption" secondary bold style={{ marginTop: spacing.sm, marginBottom: spacing.xs }}>
              PAYOUT DESTINATION:
            </Text>
            <View style={styles.providerRow}>
              {/* MTN MoMo */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPayoutProvider('mtn')}
                style={[
                  styles.providerBtn,
                  {
                    borderColor: payoutProvider === 'mtn' ? colors.primary[500] : theme.border,
                    backgroundColor:
                      payoutProvider === 'mtn'
                        ? isDark
                          ? colors.neutral[800]
                          : '#FEF3C7'
                        : 'transparent',
                  },
                ]}
              >
                <Text variant="bodyMedium" bold>
                  🟡 MTN MoMo (*126#)
                </Text>
              </TouchableOpacity>

              {/* Orange Money */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPayoutProvider('orange')}
                style={[
                  styles.providerBtn,
                  {
                    borderColor: payoutProvider === 'orange' ? colors.primary[500] : theme.border,
                    backgroundColor:
                      payoutProvider === 'orange'
                        ? isDark
                          ? colors.neutral[800]
                          : '#FFEDD5'
                        : 'transparent',
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                <Text variant="bodyMedium" bold>
                  🟠 Orange Money (#150#)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Destination Phone */}
            <Text variant="caption" secondary bold style={{ marginTop: spacing.md, marginBottom: 4 }}>
              Mobile Money Phone Number:
            </Text>
            <TextInput
              value={payoutPhone}
              onChangeText={setPayoutPhone}
              placeholder="+237 6XX XXX XXX"
              placeholderTextColor={theme.textTertiary}
              keyboardType="phone-pad"
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />

            {/* Amount Input */}
            <Text variant="caption" secondary bold style={{ marginTop: spacing.md, marginBottom: 4 }}>
              Amount in XAF (Available: {formatXAF(availableBalance)}):
            </Text>
            <TextInput
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              placeholder="e.g. 50000"
              placeholderTextColor={theme.textTertiary}
              keyboardType="numeric"
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />

            {/* Preset Amount Chips */}
            <View style={styles.presetChipsRow}>
              {[
                { label: '25%', frac: 0.25 },
                { label: '50%', frac: 0.5 },
                { label: '75%', frac: 0.75 },
                { label: 'Max (100%)', frac: 1.0 },
              ].map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleSetAmountPreset(chip.frac)}
                  style={[styles.presetChip, { borderColor: theme.border }]}
                >
                  <Text variant="caption" bold color={colors.primary[600]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fee Breakdown Card */}
            {parsedAmount > 0 && (
              <View style={[styles.feeBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                <View style={styles.feeRow}>
                  <Text variant="caption" secondary>
                    Requested Amount:
                  </Text>
                  <Text variant="caption" bold>
                    {formatXAF(parsedAmount)}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text variant="caption" secondary>
                    Telecom Network Fee (1%):
                  </Text>
                  <Text variant="caption" color="#DC2626">
                    - {formatXAF(telecomFee)}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text variant="caption" secondary>
                    Wunabuy Payout Fee:
                  </Text>
                  <Text variant="caption" color={colors.semantic.success[500]} bold>
                    0 FCFA (Free)
                  </Text>
                </View>
                <View style={[styles.feeRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 4 }]}>
                  <Text variant="bodyMedium" bold>
                    Net Payout to Receive:
                  </Text>
                  <Text variant="bodyLarge" bold color={colors.primary[600]}>
                    {formatXAF(netPayout)}
                  </Text>
                </View>
              </View>
            )}

            <Button
              title={isSubmittingPayout ? 'Processing Payout...' : 'Confirm & Request Payout ➔'}
              variant="primary"
              onPress={handleConfirmPayout}
              loading={isSubmittingPayout}
              disabled={parsedAmount <= 0 || parsedAmount > availableBalance}
              style={{ marginTop: spacing.lg, backgroundColor: colors.primary[500] }}
            />
          </View>
        </View>
      </Modal>

      {toastMessage && <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />}

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: 40,
  },
  walletCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -20,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.09)',
    bottom: -20,
    left: 20,
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
  mainBalanceText: {
    marginBottom: spacing.md,
  },
  escrowLockedBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  escrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  payoutCtaBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ledgerHeader: {
    marginBottom: spacing.xs,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  txCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMeta: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadows.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerRow: {
    flexDirection: 'row',
  },
  providerBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  presetChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  feeBox: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: 4,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

