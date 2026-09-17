import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Input, Button, Card, Toast, Badge } from '../../components/ui';
import { StorePickupTable } from '../../components/order/StorePickupTable';
import { PaymentMethod } from '@wunabuy/types';
import { formatXAF, generateIdempotencyKey, formatPhone } from '@wunabuy/utils';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { OrdersService } from '../../services/api';
import { WalletService, calculateOrderBreakdown } from '../../services/api/walletService';

export const CheckoutPaymentScreen = ({ route, navigation }: any) => {
  const {
    subtotal = 185000,
    deliveryFee = 1500,
    deliveryMethod = 'wunabuy_transporter',
    pickupPin = '7842',
    storeData = null,
  } = route.params || {};

  const { theme, isDark } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.items);
  const cartStoreId = useCartStore((state) => state.storeId);

  // ── Financial breakdown (mirrors backend EscrowService math exactly) ──────
  const breakdown = calculateOrderBreakdown(subtotal, deliveryFee);
  const totalAmount = breakdown.total;

  // Live dynamic available wallet balance (lightweight poll)
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletEscrow, setWalletEscrow] = useState(0);
  const isWalletSufficient = walletBalance >= totalAmount;

  React.useEffect(() => {
    let isMounted = true;
    WalletService.getBalance()
      .then((b) => {
        if (isMounted) {
          setWalletBalance(b.balance_available ?? 0);
          setWalletEscrow(b.balance_escrow_locked ?? 0);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

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
      let createdOrderId = 'wb_order_' + Date.now();
      let orderCode = `WB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      if (!cartItems || cartItems.length === 0) {
        setError('Your cart is empty. Please add items before checkout.');
        setIsProcessing(false);
        return;
      }

      // Pre-flight balance check for wallet payments
      if (selectedMethod === PaymentMethod.WALLET && !isWalletSufficient) {
        const shortfall = totalAmount - walletBalance;
        setError(
          `Insufficient wallet balance. You need ${formatXAF(shortfall)} more. ` +
          `Please top up your wallet first.`
        );
        setIsProcessing(false);
        return;
      }

      const orderRes = await OrdersService.createOrder({
        store_id: cartStoreId || cartItems[0]?.store_id,
        items: cartItems.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
        delivery_address: deliveryMethod === 'self_pickup'
          ? {
              label: 'Store Pickup Counter',
              address_text: storeData?.address_text || 'Merchant Counter Hub',
              type: 'self_pickup',
            }
          : user?.default_address?.address_text || 'Bonanjo, Douala',
        delivery_fee: deliveryFee,
        delivery_method: deliveryMethod,
        pickup_pin: pickupPin,
        payment_method: selectedMethod === PaymentMethod.MOMO ? PaymentMethod.MOMO : PaymentMethod.WALLET,
        notes: `Delivery via ${deliveryMethod}`,
      });

      if (orderRes) {
        createdOrderId = orderRes.id;
        if (orderRes.order_code) {
          orderCode = orderRes.order_code;
        }
      }

      const effectiveStoreName = storeData?.store_name || cartItems[0]?.store_name || 'Official Verified Store';
      const effectiveStoreAddress = storeData?.address_text || 'Merchant Counter Hub';
      const effectiveStorePhone = storeData?.phone || '+237 670 123 456';

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

        await OrdersService.payCheckout({
          order_id: createdOrderId,
          method: 'momo',
          provider: provider === 'MTN' ? 'mtn' : 'orange',
          phone: accountPhone,
          amount: totalAmount,
        });

        setTimeout(() => {
          clearCart();
          setIsProcessing(false);
          navigation.navigate('OrderSuccess', {
            orderCode,
            totalAmount,
            provider,
            phone: accountPhone,
            paymentMethod: 'Mobile Money',
            deliveryMethod,
            pickupPin,
            storeName: effectiveStoreName,
            storeAddress: effectiveStoreAddress,
            storePhone: effectiveStorePhone,
          });
        }, 3000);
      } else if (selectedMethod === PaymentMethod.WALLET) {
        await OrdersService.payCheckout({
          order_id: createdOrderId,
          method: 'wallet',
          amount: totalAmount,
        });

        // Refresh balance after escrow lock
        WalletService.getBalance().then(b => setWalletBalance(b.balance_available)).catch(() => {});

        setTimeout(() => {
          clearCart();
          setIsProcessing(false);
          navigation.navigate('OrderSuccess', {
            orderCode,
            totalAmount,
            provider: 'Wunabuy Wallet',
            phone: user?.phone ?? accountPhone,
            paymentMethod: 'Wallet Balance',
            deliveryMethod,
            pickupPin,
            storeName: effectiveStoreName,
            storeAddress: effectiveStoreAddress,
            storePhone: effectiveStorePhone,
          });
        }, 1200);
      }
    } catch (err: any) {
      setIsProcessing(false);
      // Surface backend error messages (INSUFFICIENT_FUNDS, etc.) directly
      const msg = err?.response?.data?.message || err?.message || 'Payment processing failed. Please try again.';
      setError(msg);
      // If escrow lock failed due to insufficient funds, navigate user to wallet
      if (msg.includes('Insufficient wallet balance') || msg.includes('Shortfall')) {
        setTimeout(() => navigation.navigate('BuyerWallet'), 2500);
      }
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
          Escrow Payment
        </Text>
      </View>

      {/* Financial Breakdown Card */}
      <Card style={[styles.breakdownCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}>
        <Text variant="caption" bold color={theme.textSecondary} style={{ marginBottom: spacing.xs, letterSpacing: 0.5 }}>
          PAYMENT BREAKDOWN
        </Text>
        <View style={styles.breakdownRow}>
          <Text variant="bodyMedium" color={theme.textSecondary}>Products Subtotal</Text>
          <Text variant="bodyMedium" bold>{formatXAF(breakdown.subtotal)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text variant="bodyMedium" color={theme.textSecondary}>Delivery Fee</Text>
          <Text variant="bodyMedium" bold>{formatXAF(breakdown.deliveryFee)}</Text>
        </View>
        <View style={[styles.breakdownDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]} />
        <View style={styles.breakdownRow}>
          <Text variant="bodyLarge" bold>Total Payable</Text>
          <Text variant="bodyLarge" bold color={colors.primary[600]}>{formatXAF(breakdown.total)}</Text>
        </View>
        <View style={[styles.escrowInfoRow, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderColor: '#10B981' }]}>
          <Ionicons name="shield-checkmark" size={13} color="#10B981" style={{ marginRight: 5 }} />
          <Text variant="caption" color="#059669" style={{ flex: 1, lineHeight: 16 }}>
            Full amount held in escrow until you confirm delivery. Seller receives {formatXAF(breakdown.sellerNet)} after 3.5% platform fee.
          </Text>
        </View>
      </Card>

      {/* Payable Amount Summary */}
      <Card style={styles.amountCard}>
        <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
          TOTAL PAYABLE
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

      {/* If Self-Pickup Selected: Tabular Seller Store Address & Rider PIN Table */}
      {deliveryMethod === 'self_pickup' && (
        <StorePickupTable
          pickupPin={pickupPin}
          storeName={storeData?.store_name || cartItems[0]?.store_name || 'Official Verified Store'}
          addressText={storeData?.address_text || 'Merchant Counter Hub, Cameroon'}
          landmarkDirections={storeData?.landmark || storeData?.landmarkDirections || 'Designated Wunabuy Merchant Counter'}
          primaryPhone={storeData?.phone || storeData?.primaryPhone || '+237 670 123 456'}
          operatingHours={storeData?.counter_hours || storeData?.operatingHours || 'Mon - Sat: 8:00 AM - 6:30 PM'}
          riderInstructions={storeData?.rider_instructions || storeData?.riderInstructions || 'Present 4-digit PIN at merchant counter for parcel handover.'}
          latitude={storeData?.latitude ?? 4.0510}
          longitude={storeData?.longitude ?? 9.7679}
          style={{ marginTop: spacing.sm }}
        />
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
  breakdownCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  breakdownDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  escrowInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
});
