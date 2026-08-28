import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Input, Toast } from '../../components/ui';
import { useThemeStore } from '../../stores/theme.store';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentProvider = 'mtn' | 'orange';
type SheetMode = 'fund' | 'withdraw' | null;
type SheetStep = 'form' | 'dial' | 'loading' | 'success' | 'failed';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  provider: PaymentProvider;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BALANCE = 47500;

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx001',
    type: 'credit',
    amount: 20000,
    description: 'Wallet Top-Up via MTN MoMo',
    provider: 'mtn',
    date: '27 Aug 2026, 14:02',
    status: 'completed',
  },
  {
    id: 'tx002',
    type: 'debit',
    amount: 8500,
    description: 'Escrow Payment — Order #WNB-00412',
    provider: 'mtn',
    date: '26 Aug 2026, 09:18',
    status: 'completed',
  },
  {
    id: 'tx003',
    type: 'credit',
    amount: 50000,
    description: 'Wallet Top-Up via Orange Money',
    provider: 'orange',
    date: '24 Aug 2026, 17:44',
    status: 'completed',
  },
  {
    id: 'tx004',
    type: 'debit',
    amount: 14000,
    description: 'Escrow Payment — Order #WNB-00398',
    provider: 'mtn',
    date: '22 Aug 2026, 11:30',
    status: 'completed',
  },
];

const PROVIDER_CONFIG = {
  mtn: {
    label: 'MTN Mobile Money',
    color: '#FFC107',
    dialCode: '*126#',
    icon: 'phone-portrait-outline' as const,
    bg: '#FFF8E1',
  },
  orange: {
    label: 'Orange Money',
    color: '#FF6D00',
    dialCode: '#150*50#',
    icon: 'phone-portrait-outline' as const,
    bg: '#FFF3E0',
  },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export const WalletScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();

  const [balance] = useState(MOCK_BALANCE);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Bottom sheet state
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [sheetStep, setSheetStep] = useState<SheetStep>('form');

  // Form state
  const [provider, setProvider] = useState<PaymentProvider>('mtn');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showSheet = (mode: SheetMode) => {
    setSheetMode(mode);
    setSheetStep('form');
    setPhone('');
    setAmount('');
    setFormError('');
    setProvider('mtn');
  };

  const closeSheet = () => {
    setSheetMode(null);
    setSheetStep('form');
    setFormError('');
  };

  const handleSubmitForm = () => {
    setFormError('');
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 9) {
      setFormError('Please enter a valid 9-digit Cameroon phone number.');
      return;
    }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < 100) {
      setFormError('Minimum amount is XAF 100.');
      return;
    }
    if (sheetMode === 'withdraw' && amt > balance) {
      setFormError('Insufficient wallet balance for this withdrawal.');
      return;
    }
    setSheetStep('dial');
  };

  const handleContinueFromDial = () => {
    setSheetStep('loading');
    // Simulate async MoMo confirmation (3s)
    setTimeout(() => {
      const success = Math.random() > 0.15; // 85% success simulation
      setSheetStep(success ? 'success' : 'failed');
    }, 3000);
  };

  const handleDone = () => {
    const success = sheetStep === 'success';
    closeSheet();
    if (success) {
      const amt = parseInt(amount, 10);
      const verb = sheetMode === 'fund' ? 'topped up' : 'withdrawn';
      setToast({ msg: `XAF ${amt.toLocaleString()} successfully ${verb}!`, type: 'success' });
    } else {
      setToast({ msg: 'Transaction failed. Please try again.', type: 'error' });
    }
  };

  const formatBalance = (val: number) =>
    val.toLocaleString('fr-CM') + ' XAF';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.headerTitle}>
          My Wallet
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.historyBtn, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary[500] }]}>
          {/* Card decoration circles */}
          <View style={styles.balanceCircle1} />
          <View style={styles.balanceCircle2} />

          <View style={styles.balanceTopRow}>
            <View>
              <Text variant="caption" color="rgba(255,255,255,0.75)" style={{ marginBottom: 4 }}>
                Available Balance
              </Text>
              <Text
                variant="h1"
                bold
                color={colors.neutral[0]}
                style={styles.balanceAmount}
              >
                {balanceVisible ? formatBalance(balance) : '••••••• XAF'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBalanceVisible(!balanceVisible)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.neutral[0]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceEscrowRow}>
            <View style={styles.escrowPill}>
              <Ionicons name="shield-checkmark" size={11} color={colors.primary[300]} style={{ marginRight: 3 }} />
              <Text variant="caption" color={colors.neutral[0]} style={{ fontSize: 10 }}>
                48H ESCROW PROTECTED
              </Text>
            </View>
            <Text variant="caption" color="rgba(255,255,255,0.65)">
              Wunabuy Wallet
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.balanceActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => showSheet('fund')}
              style={[styles.walletActionBtn, { backgroundColor: 'rgba(255,255,255,0.22)' }]}
            >
              <View style={styles.walletActionIcon}>
                <Ionicons name="add" size={18} color={colors.neutral[0]} />
              </View>
              <Text variant="bodyMedium" bold color={colors.neutral[0]}>
                Fund Account
              </Text>
            </TouchableOpacity>

            <View style={styles.walletActionDivider} />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => showSheet('withdraw')}
              style={[styles.walletActionBtn, { backgroundColor: 'rgba(255,255,255,0.22)' }]}
            >
              <View style={styles.walletActionIcon}>
                <Ionicons name="arrow-up" size={18} color={colors.neutral[0]} />
              </View>
              <Text variant="bodyMedium" bold color={colors.neutral[0]}>
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Payment Methods */}
        <View style={styles.quickMethodsRow}>
          {(['mtn', 'orange'] as PaymentProvider[]).map((prov) => {
            const cfg = PROVIDER_CONFIG[prov];
            return (
              <View
                key={prov}
                style={[
                  styles.quickMethodCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  !isDark && shadows.sm,
                ]}
              >
                <View style={[styles.quickMethodIcon, { backgroundColor: cfg.bg }]}>
                  <Ionicons name="phone-portrait-outline" size={18} color={cfg.color} />
                </View>
                <View>
                  <Text variant="bodyMedium" bold numberOfLines={1}>
                    {cfg.label}
                  </Text>
                  <Text variant="caption" color={cfg.color} style={{ marginTop: 1 }}>
                    Dial: {cfg.dialCode}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Escrow Pay Notice */}
        <View
          style={[
            styles.escrowNoticeCard,
            { backgroundColor: isDark ? colors.primary[900] ?? colors.primary[700] : colors.primary[50] },
          ]}
        >
          <Ionicons name="shield-checkmark" size={22} color={colors.primary[500]} style={{ marginRight: spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" bold color={colors.primary[600]}>
              Wallet Escrow Payments
            </Text>
            <Text variant="caption" secondary style={{ marginTop: 2 }}>
              Pay for orders directly from your wallet. Funds are held in 48H secure escrow until delivery is confirmed.
            </Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
          <Text variant="h2" bold>
            Transaction History
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text variant="bodyMedium" color={colors.primary[500]}>
              See All ›
            </Text>
          </TouchableOpacity>
        </View>

        {MOCK_TRANSACTIONS.map((tx) => {
          const isCredit = tx.type === 'credit';
          const cfg = PROVIDER_CONFIG[tx.provider];
          return (
            <View
              key={tx.id}
              style={[
                styles.txRow,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                !isDark && shadows.sm,
              ]}
            >
              {/* Left Icon */}
              <View
                style={[
                  styles.txIconCircle,
                  {
                    backgroundColor: isCredit
                      ? colors.semantic.success[50]
                      : colors.semantic.error[50],
                  },
                ]}
              >
                <Ionicons
                  name={isCredit ? 'arrow-down' : 'arrow-up'}
                  size={18}
                  color={isCredit ? colors.semantic.success[500] : colors.semantic.error[500]}
                />
              </View>

              {/* Description */}
              <View style={styles.txInfo}>
                <Text variant="bodyMedium" bold numberOfLines={1}>
                  {tx.description}
                </Text>
                <View style={styles.txMetaRow}>
                  <View style={[styles.txProviderDot, { backgroundColor: cfg.color }]} />
                  <Text variant="caption" secondary>
                    {tx.date}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <Text
                variant="bodyLarge"
                bold
                color={isCredit ? colors.semantic.success[500] : colors.semantic.error[500]}
              >
                {isCredit ? '+' : '-'} {tx.amount.toLocaleString()}
              </Text>
            </View>
          );
        })}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>

      {/* ─── Bottom Sheet Overlay ─────────────────────────────────────── */}
      <Modal visible={sheetMode !== null} transparent animationType="slide" onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.sheetBackdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheetContainer, { backgroundColor: theme.card }]}>
          {/* Sheet Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />

          {/* ── STEP: Form ── */}
          {sheetStep === 'form' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHeaderRow}>
                <View>
                  <Text variant="h2" bold>
                    {sheetMode === 'fund' ? '💰 Fund Account' : '📤 Withdraw Funds'}
                  </Text>
                  <Text variant="caption" secondary style={{ marginTop: 2 }}>
                    {sheetMode === 'fund'
                      ? 'Top up your Wunabuy wallet via Mobile Money'
                      : 'Withdraw funds to your Mobile Money account'}
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={closeSheet} style={styles.sheetCloseBtn}>
                  <Ionicons name="close" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Payment Method Selection */}
              <Text variant="caption" bold color={theme.textSecondary} style={styles.sheetLabel}>
                PAYMENT METHOD
              </Text>
              <View style={styles.providerRow}>
                {(['mtn', 'orange'] as PaymentProvider[]).map((prov) => {
                  const cfg = PROVIDER_CONFIG[prov];
                  const selected = provider === prov;
                  return (
                    <TouchableOpacity
                      key={prov}
                      activeOpacity={0.82}
                      onPress={() => setProvider(prov)}
                      style={[
                        styles.providerCard,
                        {
                          backgroundColor: selected ? cfg.color + '18' : theme.input,
                          borderColor: selected ? cfg.color : theme.border,
                          borderWidth: selected ? 2 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.providerIconCircle, { backgroundColor: cfg.bg }]}>
                        <Ionicons name="phone-portrait-outline" size={20} color={cfg.color} />
                      </View>
                      <Text variant="bodyMedium" bold color={selected ? cfg.color : theme.text} style={{ marginTop: 6 }}>
                        {prov === 'mtn' ? 'MTN MoMo' : 'Orange Money'}
                      </Text>
                      {selected && (
                        <View style={[styles.providerCheckBadge, { backgroundColor: cfg.color }]}>
                          <Ionicons name="checkmark" size={10} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Phone Number */}
              <Input
                label="Mobile Money Number *"
                placeholder="e.g. 670 123 456"
                value={phone}
                onChangeText={(t) => { setFormError(''); setPhone(t); }}
                keyboardType="phone-pad"
                containerStyle={styles.sheetInput}
                leftIcon={<Ionicons name="call-outline" size={18} color={theme.placeholder} />}
              />

              {/* Amount */}
              <Input
                label={sheetMode === 'fund' ? 'Amount to Fund (XAF) *' : 'Amount to Withdraw (XAF) *'}
                placeholder="e.g. 5000"
                value={amount}
                onChangeText={(t) => { setFormError(''); setAmount(t.replace(/[^0-9]/g, '')); }}
                keyboardType="numeric"
                containerStyle={styles.sheetInput}
                leftIcon={<Ionicons name="cash-outline" size={18} color={theme.placeholder} />}
              />

              {sheetMode === 'withdraw' && (
                <View style={[styles.availableRow, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                  <Text variant="caption" secondary>
                    Available Balance:
                  </Text>
                  <Text variant="bodyMedium" bold color={colors.primary[500]}>
                    {formatBalance(balance)}
                  </Text>
                </View>
              )}

              {/* Error callout */}
              {formError ? (
                <View style={styles.errorCallout}>
                  <Ionicons name="alert-circle" size={16} color={colors.semantic.error[500]} style={{ marginRight: 6 }} />
                  <Text variant="caption" color={colors.semantic.error[500]} style={{ flex: 1 }}>
                    {formError}
                  </Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.87}
                onPress={handleSubmitForm}
                style={[
                  styles.sheetSubmitBtn,
                  { backgroundColor: PROVIDER_CONFIG[provider].color },
                ]}
              >
                <Text variant="bodyLarge" bold color="#FFF">
                  {sheetMode === 'fund' ? 'Continue to Fund →' : 'Continue to Withdraw →'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── STEP: Dial Code ── */}
          {sheetStep === 'dial' && (
            <View style={styles.dialContainer}>
              <View style={[styles.dialIconCircle, { backgroundColor: PROVIDER_CONFIG[provider].bg }]}>
                <Ionicons name="call" size={32} color={PROVIDER_CONFIG[provider].color} />
              </View>

              <Text variant="h2" bold align="center" style={styles.dialTitle}>
                Dial the USSD Code
              </Text>

              <Text variant="bodyMedium" secondary align="center" style={styles.dialSub}>
                {sheetMode === 'fund' ? 'To top up' : 'To withdraw'}{' '}
                <Text variant="bodyMedium" bold color={PROVIDER_CONFIG[provider].color}>
                  XAF {parseInt(amount).toLocaleString()}
                </Text>
                {' '}via{' '}
                <Text variant="bodyMedium" bold color={PROVIDER_CONFIG[provider].color}>
                  {PROVIDER_CONFIG[provider].label}
                </Text>
                {', dial the code below on your phone:'}
              </Text>

              <View
                style={[
                  styles.dialCodeBox,
                  {
                    backgroundColor: PROVIDER_CONFIG[provider].bg,
                    borderColor: PROVIDER_CONFIG[provider].color + '50',
                  },
                ]}
              >
                <Text
                  variant="h1"
                  bold
                  color={PROVIDER_CONFIG[provider].color}
                  align="center"
                  style={styles.dialCodeText}
                >
                  {PROVIDER_CONFIG[provider].dialCode}
                </Text>
              </View>

              <Text variant="caption" secondary align="center" style={styles.dialHint}>
                After dialing, follow the on-screen prompts to authorize the payment to{' '}
                <Text variant="caption" bold>
                  Wunabuy
                </Text>
                . Then tap "I've Dialed the Code" below.
              </Text>

              <View style={styles.dialActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSheetStep('form')}
                  style={[styles.dialBackBtn, { borderColor: theme.border }]}
                >
                  <Text variant="bodyMedium" color={theme.text}>
                    ← Back
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.87}
                  onPress={handleContinueFromDial}
                  style={[styles.dialConfirmBtn, { backgroundColor: PROVIDER_CONFIG[provider].color }]}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text variant="bodyLarge" bold color="#FFF">
                    I've Dialed the Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── STEP: Loading ── */}
          {sheetStep === 'loading' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginBottom: spacing.lg }} />
              <Text variant="h2" bold align="center">
                Confirming Transaction...
              </Text>
              <Text variant="bodyMedium" secondary align="center" style={{ marginTop: spacing.xs }}>
                Please wait while we verify your {PROVIDER_CONFIG[provider].label} payment.
              </Text>
              <View style={styles.loadingProviderBadge}>
                <Ionicons name="lock-closed" size={12} color={colors.primary[500]} style={{ marginRight: 4 }} />
                <Text variant="caption" color={colors.primary[500]}>
                  Encrypted & Secure
                </Text>
              </View>
            </View>
          )}

          {/* ── STEP: Success ── */}
          {sheetStep === 'success' && (
            <View style={styles.resultContainer}>
              <View style={[styles.resultIconCircle, { backgroundColor: colors.semantic.success[50] }]}>
                <Ionicons name="checkmark-circle" size={52} color={colors.semantic.success[500]} />
              </View>
              <Text variant="h2" bold align="center" style={styles.resultTitle}>
                {sheetMode === 'fund' ? 'Wallet Funded! 🎉' : 'Withdrawal Successful! ✅'}
              </Text>
              <Text variant="bodyMedium" secondary align="center" style={styles.resultSub}>
                {sheetMode === 'fund'
                  ? `XAF ${parseInt(amount).toLocaleString()} has been successfully credited to your Wunabuy wallet.`
                  : `XAF ${parseInt(amount).toLocaleString()} has been sent to your ${PROVIDER_CONFIG[provider].label} number ending in ${phone.slice(-4)}.`}
              </Text>
              <TouchableOpacity
                activeOpacity={0.87}
                onPress={handleDone}
                style={[styles.doneBtn, { backgroundColor: colors.semantic.success[500] }]}
              >
                <Text variant="bodyLarge" bold color="#FFF">
                  Done — View Balance
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP: Failed ── */}
          {sheetStep === 'failed' && (
            <View style={styles.resultContainer}>
              <View style={[styles.resultIconCircle, { backgroundColor: colors.semantic.error[50] }]}>
                <Ionicons name="close-circle" size={52} color={colors.semantic.error[500]} />
              </View>
              <Text variant="h2" bold align="center" style={styles.resultTitle}>
                Transaction Failed ❌
              </Text>
              <Text variant="bodyMedium" secondary align="center" style={styles.resultSub}>
                We could not confirm your {PROVIDER_CONFIG[provider].label} payment. Please check your balance and try again.
              </Text>
              <TouchableOpacity
                activeOpacity={0.87}
                onPress={() => setSheetStep('form')}
                style={[styles.doneBtn, { backgroundColor: colors.semantic.error[500] }]}
              >
                <Text variant="bodyLarge" bold color="#FFF">
                  Try Again
                </Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={handleDone} style={{ marginTop: spacing.md }}>
                <Text variant="bodyMedium" color={theme.textSecondary} align="center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          visible
        />
      )}
    </ScreenContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['4xl'],
  },

  // Balance Card
  balanceCard: {
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.lg,
  },
  balanceCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -40,
  },
  balanceCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -20,
    left: 20,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 30,
    lineHeight: 36,
  },
  eyeBtn: {
    padding: spacing.xs,
    marginTop: -4,
  },
  balanceEscrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  balanceActionsRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  walletActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderRadius: borderRadius.xl,
  },
  walletActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletActionDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.xs,
  },

  // Quick Methods
  quickMethodsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickMethodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  quickMethodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Escrow Notice
  escrowNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  // Transaction Row
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  txIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  txInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 5,
  },
  txProviderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // Bottom Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    ...shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  providerCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    position: 'relative',
  },
  providerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetInput: {
    marginBottom: spacing.sm,
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  errorCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.error[50],
    borderWidth: 1,
    borderColor: colors.semantic.error[500],
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sheetSubmitBtn: {
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    ...shadows.md,
  },

  // Dial Step
  dialContainer: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  dialIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dialTitle: {
    marginBottom: spacing.xs,
  },
  dialSub: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    lineHeight: 20,
  },
  dialCodeBox: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  dialCodeText: {
    fontSize: 28,
    letterSpacing: 2,
  },
  dialHint: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  dialActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  dialBackBtn: {
    flex: 1,
    height: 50,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialConfirmBtn: {
    flex: 2,
    height: 50,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  // Loading Step
  loadingContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  loadingProviderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },

  // Result Step
  resultContainer: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  resultIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resultTitle: {
    marginBottom: spacing.xs,
  },
  resultSub: {
    paddingHorizontal: spacing.sm,
    lineHeight: 20,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  doneBtn: {
    width: '100%',
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
});

