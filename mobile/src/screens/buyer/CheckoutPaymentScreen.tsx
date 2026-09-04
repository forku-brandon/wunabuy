import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Input, Button, Card, Toast, Badge } from '../../components/ui';
import { PaymentMethod } from '@wunabuy/types';
import { formatXAF, generateIdempotencyKey, formatPhone } from '@wunabuy/utils';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { OrdersService } from '../../services/api';

export const CheckoutPaymentScreen = ({ route, navigation }: any) => {
  const {
    subtotal = 185000,
    deliveryFee = 1500,
    deliveryMethod = 'wunabuy_transporter',
    pickupPin = '84920',
  } = route.params || {};

  const { theme, isDark } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const clearCart = useCartStore((state) => state.clearCart);

  const commission = Math.round(subtotal * 0.035);
  const totalAmount = subtotal + commission + deliveryFee;

  // Mock available wallet balance
  const walletBalance = 47500;
  const isWalletSufficient = walletBalance >= totalAmount;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.MOMO);
  const [provider, setProvider] = useState<'MTN' | 'ORANGE'>('MTN');
  const [accountPhone, setAccountPhone] = useState(user?.phone ?? '+237670000000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ussdPromptText, setUssdPromptText] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleChargePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      if (selectedMethod === PaymentMethod.MOMO) {
        if (!accountPhone.trim()) {
          setError('Please enter a valid Mobile Money account phone number.');
          setIsProcessing(false);
          return;
        }

        const ussdCode = provider === 'MTN' ? '*126#' : '#150*50#';
        setUssdPromptText(
          `USSD Push sent to ${formatPhone(accountPhone)}. Please dial ${ussdCode} or enter PIN to authorize ${formatXAF(totalAmount)}.`
        );

        const result = await OrdersService.payCheckout({
          order_id: 'wb_order_' + Date.now(),
          method: 'momo',
          provider: provider === 'MTN' ? 'mtn' : 'orange',
          phone: accountPhone,
          amount: totalAmount,
        });

        setTimeout(() => {
          clearCart();
          setIsProcessing(false);
          navigation.navigate('OrderSuccess', {
            orderCode: result.payment_ref || `WB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            totalAmount,
            provider,
            phone: accountPhone,
            paymentMethod: 'Mobile Money',
            deliveryMethod,
            pickupPin,
          });
        }, 3000);
      } else if (selectedMethod === PaymentMethod.WALLET) {
        if (!isWalletSufficient) {
          setError(`Insufficient wallet balance. Please top up your wallet.`);
          setIsProcessing(false);
          return;
        }

        const result = await OrdersService.payCheckout({
          order_id: 'wb_order_' + Date.now(),
          method: 'wallet',
          amount: totalAmount,
        });

        setTimeout(() => {
          clearCart();
          setIsProcessing(false);
          navigation.navigate('OrderSuccess', {
            orderCode: result.payment_ref || `WB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            totalAmount,
            provider: 'Wunabuy Wallet',
            phone: user?.phone ?? accountPhone,
            paymentMethod: 'Wallet Balance',
            deliveryMethod,
            pickupPin,
          });
        }, 1200);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation.getParent()?.canGoBack()) {
              navigation.getParent()?.goBack();
            }
          }}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.title}>
          Escrow Checkout Payment
        </Text>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          Funds stay safely locked in 48-hour escrow protection until delivery is verified.
        </Text>
      </View>

      {/* Payable Amount Summary */}
      <Card style={styles.amountCard}>
        <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
          TOTAL PAYABLE ESCROW AMOUNT
        </Text>
        <Text variant="display" bold color={colors.neutral[0]} style={styles.amountText}>
          {formatXAF(totalAmount)}
        </Text>
        <View style={styles.escrowBadgePill}>
          <Ionicons name="shield-checkmark" size={12} color="#10B981" style={{ marginRight: 4 }} />
          <Text variant="caption" bold color="#10B981" style={{ fontSize: 10 }}>
            48-HOUR ESCROW PROTECTED
          </Text>
        </View>
      </Card>

      {/* Self-Pickup Info Card */}
      {deliveryMethod === 'self_pickup' && (
        <View style={[styles.selfPickupCheckoutCard, { backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#F0FDFA', borderColor: colors.primary[400] }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="walk" size={18} color={colors.primary[600]} />
            <Text variant="bodyMedium" bold color={colors.primary[700]} style={{ marginLeft: 6 }}>
              Self-Pickup / Personal Courier Active
            </Text>
            <Badge label="0 FCFA FEE" variant="success" size="small" style={{ marginLeft: 'auto' }} />
          </View>
          <Text variant="caption" secondary style={{ lineHeight: 18 }}>
            Rider verification code <Text bold color={colors.primary[600]}>#{pickupPin}</Text> will be active upon payment. Platform transporter dispatch is bypassed.
          </Text>
        </View>
      )}

      {/* Payment Method Selector Tabs */}
      <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
        SELECT PAYMENT METHOD
      </Text>
      <View style={[styles.methodTabContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
        {/* Mobile Money Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setSelectedMethod(PaymentMethod.MOMO);
            setError('');
          }}
          style={[
            styles.methodTab,
            selectedMethod === PaymentMethod.MOMO && [
              styles.methodTabActive,
              { backgroundColor: theme.card },
            ],
          ]}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={18}
            color={selectedMethod === PaymentMethod.MOMO ? colors.primary[500] : theme.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            variant="bodyMedium"
            bold={selectedMethod === PaymentMethod.MOMO}
            color={selectedMethod === PaymentMethod.MOMO ? colors.primary[500] : theme.textSecondary}
          >
            Mobile Money
          </Text>
        </TouchableOpacity>

        {/* Wunabuy Wallet Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setSelectedMethod(PaymentMethod.WALLET);
            setError('');
          }}
          style={[
            styles.methodTab,
            selectedMethod === PaymentMethod.WALLET && [
              styles.methodTabActive,
              { backgroundColor: theme.card },
            ],
          ]}
        >
          <Ionicons
            name="wallet-outline"
            size={18}
            color={selectedMethod === PaymentMethod.WALLET ? colors.primary[500] : theme.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            variant="bodyMedium"
            bold={selectedMethod === PaymentMethod.WALLET}
            color={selectedMethod === PaymentMethod.WALLET ? colors.primary[500] : theme.textSecondary}
          >
            Wunabuy Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── OPTION 1: MOBILE MONEY PROVIDERS ───────────────────────── */}
      {selectedMethod === PaymentMethod.MOMO && (
        <View style={styles.sectionContainer}>
          <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
            SELECT MOBILE MONEY PROVIDER
          </Text>
          <View style={styles.providerRow}>
            {/* MTN MoMo */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setProvider('MTN');
                setError('');
              }}
              style={[
                styles.providerCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                provider === 'MTN' && styles.providerSelectedMTN,
              ]}
            >
              <View style={styles.providerIconRingMTN}>
                <Ionicons name="flash" size={20} color="#F59E0B" />
              </View>
              <Text variant="bodyLarge" bold color={provider === 'MTN' ? '#B45309' : theme.text}>
                MTN MoMo
              </Text>
              <Text variant="caption" secondary>
                *126# USSD
              </Text>
            </TouchableOpacity>

            {/* Orange Money */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setProvider('ORANGE');
                setError('');
              }}
              style={[
                styles.providerCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                provider === 'ORANGE' && styles.providerSelectedOrange,
              ]}
            >
              <View style={styles.providerIconRingOrange}>
                <Ionicons name="card" size={20} color="#EA580C" />
              </View>
              <Text variant="bodyLarge" bold color={provider === 'ORANGE' ? '#C2410C' : theme.text}>
                Orange Money
              </Text>
              <Text variant="caption" secondary>
                #150*50# USSD
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Phone Input */}
          <Input
            label="Mobile Money Account Phone Number *"
            placeholder="6XX XXX XXX or +237 6XX XXX XXX"
            keyboardType="phone-pad"
            value={accountPhone}
            onChangeText={(text) => {
              setError('');
              setAccountPhone(text);
            }}
            hint="Registered account that will receive the USSD PIN push authorization"
            error={error}
          />
        </View>
      )}

      {/* ─── OPTION 2: WUNABUY WALLET ─────────────────────────────── */}
      {selectedMethod === PaymentMethod.WALLET && (
        <View style={styles.sectionContainer}>
          <Card
            style={[
              styles.walletOverviewCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#F0FDFA',
                borderColor: isWalletSufficient ? colors.primary[500] : colors.semantic.warning[500],
              },
            ]}
          >
            <View style={styles.walletOverviewHeader}>
              <View style={styles.walletIconCircle}>
                <Ionicons name="wallet" size={22} color={colors.primary[500]} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="caption" secondary bold>
                  CURRENT WALLET BALANCE
                </Text>
                <Text variant="h2" bold color={colors.primary[600]}>
                  {formatXAF(walletBalance)}
                </Text>
              </View>
              <Badge
                label={isWalletSufficient ? 'SUFFICIENT' : 'LOW BALANCE'}
                variant={isWalletSufficient ? 'success' : 'warning'}
                size="small"
              />
            </View>

            <View style={styles.walletDivider} />

            {isWalletSufficient ? (
              <View style={styles.walletBenefitRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success[500]} style={{ marginRight: 6 }} />
                <Text variant="caption" color={colors.semantic.success[700]}>
                  Instant 1-tap escrow lock • Remaining balance: {formatXAF(walletBalance - totalAmount)}
                </Text>
              </View>
            ) : (
              <View style={styles.walletShortfallContainer}>
                <View style={styles.walletBenefitRow}>
                  <Ionicons name="alert-circle" size={16} color={colors.semantic.warning[500]} style={{ marginRight: 6 }} />
                  <Text variant="caption" color={colors.semantic.warning[700]}>
                    Shortfall: {formatXAF(totalAmount - walletBalance)} needed to complete checkout.
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('BuyerWallet')}
                  style={styles.topUpBtn}
                >
                  <Text variant="caption" bold color={colors.primary[500]}>
                    + Top Up Wallet Now ➔
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Processing Indicator / USSD Banner */}
      {isProcessing && (
        <Card style={[styles.processingCard, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
          <ActivityIndicator color={colors.primary[500]} size="large" style={{ marginBottom: spacing.sm }} />
          <Text variant="bodyMedium" bold align="center" color={colors.primary[700]}>
            {selectedMethod === PaymentMethod.WALLET
              ? 'Locking Escrow from Wallet Balance...'
              : 'Authorizing Mobile Money Escrow Charge...'}
          </Text>
          {ussdPromptText && (
            <Text variant="caption" align="center" secondary style={{ marginTop: spacing.xs, lineHeight: 18 }}>
              {ussdPromptText}
            </Text>
          )}
        </Card>
      )}

      {!isProcessing && (
        <Button
          title={
            selectedMethod === PaymentMethod.WALLET
              ? `Pay ${formatXAF(totalAmount)} from Wallet ➔`
              : `Pay ${formatXAF(totalAmount)} via Mobile Money ➔`
          }
          variant="primary"
          onPress={handleChargePayment}
          disabled={selectedMethod === PaymentMethod.WALLET && !isWalletSufficient}
          style={styles.payBtn}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  amountCard: {
    backgroundColor: '#0F766E',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  amountText: {
    marginVertical: spacing.xs,
  },
  escrowBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginTop: 2,
  },
  selfPickupCheckoutCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  methodTabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  methodTabActive: {
    ...shadows.sm,
  },
  sectionContainer: {
    marginBottom: spacing.md,
  },
  providerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  providerCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    ...shadows.sm,
  },
  providerIconRingMTN: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  providerIconRingOrange: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  providerSelectedMTN: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  providerSelectedOrange: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  walletOverviewCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  walletOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconCircle: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    marginVertical: spacing.sm,
  },
  walletBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletShortfallContainer: {
    marginTop: 2,
  },
  topUpBtn: {
    marginTop: spacing.xs,
    paddingVertical: 4,
  },
  processingCard: {
    borderRadius: borderRadius.xl,
    borderColor: colors.primary[500],
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  payBtn: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
});
