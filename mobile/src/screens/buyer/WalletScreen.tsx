/**
 * WalletScreen.tsx
 *
 * Wunabuy Buyer Wallet — Full-featured mobile wallet screen.
 * Supports balance display, fund/withdraw via MTN MoMo & Orange Money,
 * USSD dial-code flow, transaction history, and escrow-pay awareness.
 *
 * @author   Wunabuy Engineering Team
 * @version  1.0.0
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Input, Toast } from '../../components/ui';
import { useThemeStore } from '../../stores/theme.store';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PaymentProvider = 'mtn' | 'orange';
type SheetMode = 'fund' | 'withdraw' | null;
type SheetStep = 'form' | 'dial' | 'loading' | 'success' | 'failed';

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  provider: PaymentProvider;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Configuration
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_BALANCE = 47_500;

/** Provider display configuration — colours, labels, USSD codes. */
const PROVIDER_CONFIG: Record<
  PaymentProvider,
  { label: string; shortLabel: string; color: string; bgLight: string; bgDark: string; dialCode: string }
> = {
  mtn: {
    label: 'MTN Mobile Money',
    shortLabel: 'MTN MoMo',
    color: '#F59E0B',
    bgLight: '#FFF8E1',
    bgDark: '#2D2508',
    dialCode: '*126#',
  },
  orange: {
    label: 'Orange Money',
    shortLabel: 'Orange Money',
    color: '#F97316',
    bgLight: '#FFF3E0',
    bgDark: '#2D1A08',
    dialCode: '#150*50#',
  },
};

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx001',
    type: 'credit',
    amount: 20_000,
    description: 'Wallet Top-Up via MTN MoMo',
    provider: 'mtn',
    date: '27 Aug 2026, 14:02',
    status: 'completed',
  },
  {
    id: 'tx002',
    type: 'debit',
    amount: 8_500,
    description: 'Escrow Payment — Order #WNB-00412',
    provider: 'mtn',
    date: '26 Aug 2026, 09:18',
    status: 'completed',
  },
  {
    id: 'tx003',
    type: 'credit',
    amount: 50_000,
    description: 'Wallet Top-Up via Orange Money',
    provider: 'orange',
    date: '24 Aug 2026, 17:44',
    status: 'completed',
  },
  {
    id: 'tx004',
    type: 'debit',
    amount: 14_000,
    description: 'Escrow Payment — Order #WNB-00398',
    provider: 'mtn',
    date: '22 Aug 2026, 11:30',
    status: 'completed',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatCurrency = (val: number): string =>
  `${val.toLocaleString('fr-CM')} XAF`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Single payment provider selection card. */
const ProviderCard: React.FC<{
  id: PaymentProvider;
  selected: boolean;
  isDark: boolean;
  onSelect: (id: PaymentProvider) => void;
}> = ({ id, selected, isDark, onSelect }) => {
  const cfg = PROVIDER_CONFIG[id];
  const bgColor = isDark ? cfg.bgDark : cfg.bgLight;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => onSelect(id)}
      style={[
        styles.providerCard,
        {
          backgroundColor: selected ? cfg.color + '1A' : (isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'),
          borderColor: selected ? cfg.color : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {/* Icon container */}
      <View style={[styles.providerIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name="phone-portrait" size={22} color={cfg.color} />
      </View>

      {/* Label */}
      <Text
        variant="bodyMedium"
        bold
        color={selected ? cfg.color : undefined}
        style={styles.providerLabel}
        numberOfLines={1}
      >
        {cfg.shortLabel}
      </Text>

      {/* USSD preview */}
      <Text variant="caption" secondary style={styles.providerDial} numberOfLines={1}>
        {cfg.dialCode}
      </Text>

      {/* Selected checkmark badge */}
      {selected && (
        <View style={[styles.providerCheck, { backgroundColor: cfg.color }]}>
          <Ionicons name="checkmark" size={10} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

/** Single transaction row. */
const TransactionRow: React.FC<{
  tx: WalletTransaction;
  theme: any;
  isDark: boolean;
}> = ({ tx, theme, isDark }) => {
  const isCredit = tx.type === 'credit';
  const cfg = PROVIDER_CONFIG[tx.provider];
  const amountColor = isCredit ? colors.semantic.success[500] : colors.semantic.error[500];

  return (
    <View
      style={[
        styles.txRow,
        {
          backgroundColor: theme.card,
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#F1F5F9',
        },
        !isDark && shadows.sm,
      ]}
    >
      {/* Direction icon */}
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
          size={16}
          color={amountColor}
        />
      </View>

      {/* Description & meta */}
      <View style={styles.txInfo}>
        <Text variant="bodyMedium" bold numberOfLines={1} style={styles.txDescription}>
          {tx.description}
        </Text>
        <View style={styles.txMeta}>
          <View style={[styles.txProviderDot, { backgroundColor: cfg.color }]} />
          <Text variant="caption" secondary numberOfLines={1}>
            {tx.date}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <Text variant="bodyMedium" bold color={amountColor} style={styles.txAmount}>
        {isCredit ? '+' : '−'}&nbsp;{tx.amount.toLocaleString()}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export const WalletScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();

  // ── State ──────────────────────────────────────────────────────────────────

  const [balance] = useState(MOCK_BALANCE);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [sheetStep, setSheetStep] = useState<SheetStep>('form');

  const [provider, setProvider] = useState<PaymentProvider>('mtn');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openSheet = (mode: SheetMode) => {
    setSheetMode(mode);
    setSheetStep('form');
    setProvider('mtn');
    setPhone('');
    setAmount('');
    setFormError('');
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
      setFormError('Please enter a valid 9-digit mobile phone number.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 100) {
      setFormError('Minimum amount is XAF 100.');
      return;
    }

    if (sheetMode === 'withdraw' && numAmount > balance) {
      setFormError('Insufficient wallet balance for this withdrawal.');
      return;
    }

    setSheetStep('dial');
  };

  const handleConfirmDial = () => {
    setSheetStep('loading');
    // Simulate async MoMo gateway callback (~3s)
    setTimeout(() => {
      const success = Math.random() > 0.15; // 85% simulated success rate
      setSheetStep(success ? 'success' : 'failed');
    }, 3000);
  };

  const handleDone = () => {
    const wasSuccess = sheetStep === 'success';
    const verb = sheetMode === 'fund' ? 'topped up' : 'withdrawn';
    const numAmount = parseInt(amount, 10);
    closeSheet();
    if (wasSuccess) {
      setToast({
        msg: `XAF ${numAmount.toLocaleString()} successfully ${verb}!`,
        type: 'success',
      });
    } else {
      setToast({ msg: 'Transaction failed. Please try again.', type: 'error' });
    }
  };

  // ── Computed values ────────────────────────────────────────────────────────

  const activeCfg = PROVIDER_CONFIG[provider];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer scrollable={false} padded={false}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'BuyerApp' }],
              });
            }
          }}
          style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <Text variant="h1" bold style={styles.headerTitle}>
          My Wallet
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable body ────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + spacing['2xl'], spacing['3xl']) },
        ]}
      >

        {/* ── Balance card ───────────────────────────────────────────────── */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary[500] }]}>
          {/* Decorative circles */}
          <View style={styles.decoCircle1} pointerEvents="none" />
          <View style={styles.decoCircle2} pointerEvents="none" />

          {/* Top row: label + eye toggle */}
          <View style={styles.balanceTopRow}>
            <View>
              <Text variant="caption" color="rgba(255,255,255,0.72)" style={styles.balanceLabel}>
                Available Balance
              </Text>
              <Text variant="h1" bold color={colors.neutral[0]} style={styles.balanceAmount}>
                {balanceVisible ? formatCurrency(balance) : '••••••• XAF'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBalanceVisible((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
          </View>

          {/* Escrow pill + label */}
          <View style={styles.balanceMetaRow}>
            <View style={styles.escrowPill}>
              <Ionicons
                name="shield-checkmark"
                size={11}
                color="rgba(255,255,255,0.9)"
                style={{ marginRight: 4 }}
              />
              <Text variant="caption" color="rgba(255,255,255,0.9)" style={styles.escrowPillText}>
                48H ESCROW PROTECTED
              </Text>
            </View>
            <Text variant="caption" color="rgba(255,255,255,0.55)">
              Wunabuy Wallet
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.balanceActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openSheet('fund')}
              style={styles.balanceActionBtn}
            >
              <View style={styles.balanceActionIcon}>
                <Ionicons name="add" size={18} color={colors.neutral[0]} />
              </View>
              <Text variant="bodyMedium" bold color={colors.neutral[0]}>
                Fund Account
              </Text>
            </TouchableOpacity>

            <View style={styles.balanceActionSeparator} />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openSheet('withdraw')}
              style={styles.balanceActionBtn}
            >
              <View style={styles.balanceActionIcon}>
                <Ionicons name="arrow-up" size={18} color={colors.neutral[0]} />
              </View>
              <Text variant="bodyMedium" bold color={colors.neutral[0]}>
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Supported payment methods row ──────────────────────────────── */}
        <View style={styles.methodsRow}>
          {(['mtn', 'orange'] as PaymentProvider[]).map((prov) => {
            const cfg = PROVIDER_CONFIG[prov];
            const bgColor = isDark ? cfg.bgDark : cfg.bgLight;

            return (
              <View
                key={prov}
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E8EDF2',
                  },
                  !isDark && shadows.sm,
                ]}
              >
                <View style={[styles.methodIconBox, { backgroundColor: bgColor }]}>
                  <Ionicons name="phone-portrait" size={18} color={cfg.color} />
                </View>
                <View style={styles.methodTextCol}>
                  <Text variant="bodyMedium" bold numberOfLines={1}>
                    {cfg.shortLabel}
                  </Text>
                  <Text variant="caption" color={cfg.color} numberOfLines={1} style={styles.methodDial}>
                    Dial {cfg.dialCode}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Escrow notice ──────────────────────────────────────────────── */}
        <View
          style={[
            styles.escrowNotice,
            { backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : colors.primary[50] },
          ]}
        >
          <View style={[styles.escrowNoticeIcon, { backgroundColor: isDark ? 'rgba(13,148,136,0.25)' : '#CCFBF1' }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary[500]} />
          </View>
          <View style={styles.escrowNoticeText}>
            <Text variant="bodyMedium" bold color={colors.primary[600]}>
              Wallet Escrow Payments
            </Text>
            <Text variant="caption" secondary style={{ marginTop: 2, lineHeight: 16 }}>
              Pay for orders directly from your wallet. Funds are held in 48H secure escrow
              until delivery is confirmed by you.
            </Text>
          </View>
        </View>

        {/* ── Transaction history ────────────────────────────────────────── */}
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

        {MOCK_TRANSACTIONS.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} theme={theme} isDark={isDark} />
        ))}

      </ScrollView>

      {/* ── Bottom sheet modal ─────────────────────────────────────────────── */}
      <Modal
        visible={sheetMode !== null}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        {/* Backdrop — tap to dismiss */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.sheetBackdrop} />
        </TouchableWithoutFeedback>

        {/* Sheet panel */}
        <View
          style={[
            styles.sheetPanel,
            {
              backgroundColor: theme.card,
              paddingBottom: Math.max(insets.bottom + spacing.lg, spacing['2xl']),
            },
          ]}
        >
          {/* Drag handle */}
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }]} />

          {/* ── Form step ──────────────────────────────────────────────────── */}
          {sheetStep === 'form' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetScrollContent}
            >
              {/* Sheet header */}
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderText}>
                  <Text variant="h2" bold>
                    {sheetMode === 'fund' ? '💰 Fund Account' : '📤 Withdraw Funds'}
                  </Text>
                  <Text variant="caption" secondary style={styles.sheetSubtitle}>
                    {sheetMode === 'fund'
                      ? 'Top up your Wunabuy wallet via Mobile Money'
                      : 'Withdraw funds to your Mobile Money account'}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={closeSheet}
                  style={[styles.sheetCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Payment method label */}
              <Text variant="caption" bold color={theme.textSecondary} style={styles.fieldLabel}>
                CHOOSE PAYMENT METHOD
              </Text>

              {/* Provider cards — equal-width two-column grid */}
              <View style={styles.providerGrid}>
                {(['mtn', 'orange'] as PaymentProvider[]).map((prov) => (
                  <ProviderCard
                    key={prov}
                    id={prov}
                    selected={provider === prov}
                    isDark={isDark}
                    onSelect={(id) => { setFormError(''); setProvider(id); }}
                  />
                ))}
              </View>

              {/* Phone number */}
              <Input
                label="Mobile Money Number *"
                placeholder="e.g. 670 123 456"
                value={phone}
                onChangeText={(t) => { setFormError(''); setPhone(t); }}
                keyboardType="phone-pad"
                containerStyle={styles.fieldSpacing}
                leftIcon={<Ionicons name="call-outline" size={18} color={theme.placeholder} />}
              />

              {/* Amount */}
              <Input
                label={sheetMode === 'fund' ? 'Amount to Fund (XAF) *' : 'Amount to Withdraw (XAF) *'}
                placeholder="Minimum XAF 100"
                value={amount}
                onChangeText={(t) => { setFormError(''); setAmount(t.replace(/[^0-9]/g, '')); }}
                keyboardType="numeric"
                containerStyle={styles.fieldSpacing}
                leftIcon={<Ionicons name="cash-outline" size={18} color={theme.placeholder} />}
              />

              {/* Available balance hint (withdraw only) */}
              {sheetMode === 'withdraw' && (
                <View
                  style={[
                    styles.availableBalanceRow,
                    { backgroundColor: isDark ? 'rgba(13,148,136,0.12)' : colors.primary[50] },
                  ]}
                >
                  <Text variant="caption" secondary>
                    Available Balance
                  </Text>
                  <Text variant="bodyMedium" bold color={colors.primary[500]}>
                    {formatCurrency(balance)}
                  </Text>
                </View>
              )}

              {/* Validation error banner */}
              {!!formError && (
                <View style={styles.errorBanner}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={colors.semantic.error[500]}
                    style={{ marginRight: 8, flexShrink: 0 }}
                  />
                  <Text variant="caption" color={colors.semantic.error[500]} style={{ flex: 1 }}>
                    {formError}
                  </Text>
                </View>
              )}

              {/* Submit CTA */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSubmitForm}
                style={[styles.submitBtn, { backgroundColor: activeCfg.color }]}
              >
                <Text variant="bodyLarge" bold color="#FFF">
                  {sheetMode === 'fund' ? 'Continue to Fund →' : 'Continue to Withdraw →'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── Dial-code step ─────────────────────────────────────────────── */}
          {sheetStep === 'dial' && (
            <View style={styles.dialContainer}>
              <View
                style={[
                  styles.dialIconCircle,
                  { backgroundColor: isDark ? activeCfg.bgDark : activeCfg.bgLight },
                ]}
              >
                <Ionicons name="call" size={34} color={activeCfg.color} />
              </View>

              <Text variant="h2" bold align="center" style={styles.dialTitle}>
                Dial the USSD Code
              </Text>

              <Text variant="bodyMedium" secondary align="center" style={styles.dialInstruction}>
                To {sheetMode === 'fund' ? 'top up' : 'withdraw'}{' '}
                <Text variant="bodyMedium" bold color={activeCfg.color}>
                  {formatCurrency(parseInt(amount, 10) || 0)}
                </Text>{' '}
                via{' '}
                <Text variant="bodyMedium" bold color={activeCfg.color}>
                  {activeCfg.label}
                </Text>
                , dial the code below on your phone:
              </Text>

              <View
                style={[
                  styles.dialCodeBox,
                  { backgroundColor: isDark ? activeCfg.bgDark : activeCfg.bgLight, borderColor: activeCfg.color + '50' },
                ]}
              >
                <Text variant="h1" bold color={activeCfg.color} align="center" style={styles.dialCodeText}>
                  {activeCfg.dialCode}
                </Text>
              </View>

              <Text variant="caption" secondary align="center" style={styles.dialHint}>
                Follow the on-screen prompts to authorise the payment to{' '}
                <Text variant="caption" bold>Wunabuy</Text>.
                Then tap the button below once done.
              </Text>

              <View style={styles.dialActions}>
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
                  activeOpacity={0.88}
                  onPress={handleConfirmDial}
                  style={[styles.dialConfirmBtn, { backgroundColor: activeCfg.color }]}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text variant="bodyLarge" bold color="#FFF">
                    I've Dialed the Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Loading step ───────────────────────────────────────────────── */}
          {sheetStep === 'loading' && (
            <View style={styles.centeredStep}>
              <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginBottom: spacing.lg }} />
              <Text variant="h2" bold align="center">
                Confirming Transaction...
              </Text>
              <Text variant="bodyMedium" secondary align="center" style={styles.stepSubtitle}>
                Please wait while we verify your {activeCfg.label} payment.
              </Text>
              <View style={styles.secureChip}>
                <Ionicons name="lock-closed" size={11} color={colors.primary[500]} style={{ marginRight: 4 }} />
                <Text variant="caption" color={colors.primary[500]}>
                  Encrypted &amp; Secure
                </Text>
              </View>
            </View>
          )}

          {/* ── Success step ───────────────────────────────────────────────── */}
          {sheetStep === 'success' && (
            <View style={styles.centeredStep}>
              <View style={[styles.resultIconCircle, { backgroundColor: colors.semantic.success[50] }]}>
                <Ionicons name="checkmark-circle" size={54} color={colors.semantic.success[500]} />
              </View>
              <Text variant="h2" bold align="center" style={styles.resultTitle}>
                {sheetMode === 'fund' ? 'Wallet Funded! 🎉' : 'Withdrawal Successful! ✅'}
              </Text>
              <Text variant="bodyMedium" secondary align="center" style={styles.stepSubtitle}>
                {sheetMode === 'fund'
                  ? `XAF ${parseInt(amount, 10).toLocaleString()} has been credited to your Wunabuy wallet.`
                  : `XAF ${parseInt(amount, 10).toLocaleString()} has been sent to your ${activeCfg.label} number.`}
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleDone}
                style={[styles.resultBtn, { backgroundColor: colors.semantic.success[500] }]}
              >
                <Text variant="bodyLarge" bold color="#FFF">
                  Done — View Balance
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Failed step ────────────────────────────────────────────────── */}
          {sheetStep === 'failed' && (
            <View style={styles.centeredStep}>
              <View style={[styles.resultIconCircle, { backgroundColor: colors.semantic.error[50] }]}>
                <Ionicons name="close-circle" size={54} color={colors.semantic.error[500]} />
              </View>
              <Text variant="h2" bold align="center" style={styles.resultTitle}>
                Transaction Failed ❌
              </Text>
              <Text variant="bodyMedium" secondary align="center" style={styles.stepSubtitle}>
                We could not confirm your {activeCfg.label} payment.
                Please check your balance and try again.
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setSheetStep('form')}
                style={[styles.resultBtn, { backgroundColor: colors.semantic.error[500] }]}
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

      {/* Toast notification */}
      {toast && <Toast message={toast.msg} type={toast.type} visible />}
    </ScreenContainer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerIconBtn: {
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

  // ── Scroll content ───────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.base,
  },

  // ── Balance card ─────────────────────────────────────────────────────────────
  balanceCard: {
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  decoCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -50,
    right: -50,
  },
  decoCircle2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    left: 10,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  balanceLabel: {
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: 28,
    lineHeight: 34,
  },
  eyeBtn: {
    marginTop: 2,
  },
  balanceMetaRow: {
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
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  escrowPillText: {
    fontSize: 9,
    letterSpacing: 0.4,
  },
  balanceActions: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  balanceActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  balanceActionIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceActionSeparator: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: spacing.sm,
  },

  // ── Payment method cards row ──────────────────────────────────────────────────
  methodsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    minHeight: 64,
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  methodTextCol: {
    flex: 1,
    minWidth: 0, // allow text to shrink on narrow screens
  },
  methodDial: {
    marginTop: 2,
  },

  // ── Escrow notice ─────────────────────────────────────────────────────────────
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  escrowNoticeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  escrowNoticeText: {
    flex: 1,
  },

  // ── Transaction list ──────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  txInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  txDescription: {
    lineHeight: 18,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 5,
  },
  txProviderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  txAmount: {
    flexShrink: 0,
    fontSize: 13,
  },

  // ── Bottom sheet ──────────────────────────────────────────────────────────────
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  sheetPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    ...shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetScrollContent: {
    paddingBottom: spacing.xs,
  },

  // Sheet header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetHeaderText: {
    flex: 1,
    marginRight: spacing.md,
  },
  sheetSubtitle: {
    marginTop: 3,
  },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Field label
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  fieldSpacing: {
    marginBottom: spacing.sm,
  },

  // Provider grid — equal-width two columns
  providerGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  providerCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.xl,
    position: 'relative',
    minHeight: 110,
    justifyContent: 'center',
  },
  providerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  providerLabel: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  providerDial: {
    textAlign: 'center',
    fontSize: 10,
  },
  providerCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Available balance hint
  availableBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },

  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.error[50],
    borderWidth: 1,
    borderColor: colors.semantic.error[500],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },

  // Submit button
  submitBtn: {
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    ...shadows.sm,
  },

  // ── Dial step ─────────────────────────────────────────────────────────────────
  dialContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dialIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dialTitle: {
    marginBottom: spacing.xs,
  },
  dialInstruction: {
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  dialCodeBox: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  dialCodeText: {
    fontSize: 30,
    letterSpacing: 3,
  },
  dialHint: {
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.lg,
  },
  dialActions: {
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

  // ── Shared centred steps (loading / success / failed) ─────────────────────────
  centeredStep: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  stepSubtitle: {
    marginTop: spacing.xs,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  secureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  resultIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resultTitle: {
    marginBottom: spacing.xs,
  },
  resultBtn: {
    width: '100%',
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});
