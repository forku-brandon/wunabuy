import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer, Text, Input, Button, Card, Toast, Badge } from '../../components/ui';
import { PaymentMethod, PaymentProvider } from '@wunabuy/types';
import { formatXAF, generateIdempotencyKey, formatPhone } from '@wunabuy/utils';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const CheckoutPaymentScreen = ({ route, navigation }: any) => {
  const { subtotal = 185000 } = route.params || {};
  const { theme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const clearCart = useCartStore((state) => state.clearCart);

  const commission = Math.round(subtotal * 0.035);
  const deliveryFee = 1500;
  const totalAmount = subtotal + commission + deliveryFee;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.MOMO);
  const [provider, setProvider] = useState<'MTN' | 'ORANGE'>('MTN');
  const [accountPhone, setAccountPhone] = useState(user?.phone ?? '+237670000000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ussdPromptText, setUssdPromptText] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleChargePayment = async () => {
    if (!accountPhone.trim()) {
      setError('Please enter a valid Mobile Money account phone number.');
      return;
    }

    setIsProcessing(true);
    setError('');
    const idempotencyKey = generateIdempotencyKey();

    const ussdCode = provider === 'MTN' ? '*126#' : '#150#';
    setUssdPromptText(`USSD Push sent to ${formatPhone(accountPhone)}. Please dial ${ussdCode} or enter PIN to authorize ${formatXAF(totalAmount)}.`);

    // Simulate 3-second gateway authorization polling
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      navigation.navigate('OrderSuccess', {
        orderCode: `WB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        totalAmount,
        provider,
        phone: accountPhone,
      });
    }, 3500);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="h2">←</Text>
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.title}>
          Mobile Money Escrow Payment
        </Text>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          Single escrow payment. Your funds stay locked until delivery is verified.
        </Text>
      </View>

      {/* Payable Amount Summary */}
      <Card style={styles.amountCard}>
        <Text variant="caption" color="rgba(255,255,255,0.8)" bold>
          TOTAL PAYABLE ESCROW AMOUNT
        </Text>
        <Text variant="display" bold color={colors.neutral[0]} style={styles.amountText}>
          {formatXAF(totalAmount)}
        </Text>
        <Badge label="PROTECTED BY WUNABUY ESCROW" variant="success" size="small" />
      </Card>

      {/* Provider Selector */}
      <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
        SELECT CAMEROON MOBILE MONEY PROVIDER
      </Text>
      <View style={styles.providerRow}>
        {/* MTN MoMo */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setProvider('MTN');
            setSelectedMethod(PaymentMethod.MOMO);
          }}
          style={[
            styles.providerCard,
            provider === 'MTN' && styles.providerSelectedMTN,
          ]}
        >
          <Text variant="h2">💛</Text>
          <Text variant="bodyLarge" bold color={provider === 'MTN' ? colors.neutral[900] : theme.text}>
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
            setSelectedMethod(PaymentMethod.MOMO);
          }}
          style={[
            styles.providerCard,
            provider === 'ORANGE' && styles.providerSelectedOrange,
          ]}
        >
          <Text variant="h2">🧡</Text>
          <Text variant="bodyLarge" bold color={provider === 'ORANGE' ? colors.neutral[0] : theme.text}>
            Orange Money
          </Text>
          <Text variant="caption" secondary>
            #150# USSD
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Phone Input */}
      <Input
        label="Mobile Money Account Phone Number *"
        placeholder="+237 6XX XXX XXX"
        keyboardType="phone-pad"
        value={accountPhone}
        onChangeText={(text) => {
          setError('');
          setAccountPhone(text);
        }}
        hint="Registered MoMo account that will receive the USSD PIN prompt"
        error={error}
      />

      {/* Processing Indicator / USSD Banner */}
      {isProcessing && (
        <Card style={styles.processingCard}>
          <ActivityIndicator color={colors.primary[500]} size="large" style={{ marginBottom: spacing.sm }} />
          <Text variant="bodyMedium" bold align="center" color={colors.primary[700]}>
            Authorizing Escrow Charge...
          </Text>
          {ussdPromptText && (
            <Text variant="caption" align="center" secondary style={{ marginTop: spacing.xs }}>
              {ussdPromptText}
            </Text>
          )}
        </Card>
      )}

      {!isProcessing && (
        <Button
          title={`Pay ${formatXAF(totalAmount)} into Escrow`}
          variant="primary"
          onPress={handleChargePayment}
          style={styles.payBtn}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backBtn: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  amountCard: {
    backgroundColor: colors.primary[700],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  amountText: {
    marginVertical: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  providerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  providerCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    alignItems: 'center',
  },
  providerSelectedMTN: {
    borderColor: '#EAB308',
    backgroundColor: '#FEF08A',
  },
  providerSelectedOrange: {
    borderColor: '#EA580C',
    backgroundColor: '#C2410C',
  },
  processingCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  payBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
