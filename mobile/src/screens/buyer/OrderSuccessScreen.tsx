import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge } from '../../components/ui';
import { formatXAF, formatPhone } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';

export const OrderSuccessScreen = ({ route, navigation }: any) => {
  const {
    orderCode = 'WB-2026-9842',
    totalAmount = 188000,
    provider = 'MTN',
    phone = '+237670000000',
  } = route.params || {};

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.centerContent}>
      <View style={styles.successIconBox}>
        <Text variant="display">🎉</Text>
      </View>

      <Text variant="h1" bold align="center" style={styles.title}>
        Payment Locked in Escrow!
      </Text>

      <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
        Your payment of <Text bold color={colors.primary[500]}>{formatXAF(totalAmount)}</Text> via {provider} MoMo ({formatPhone(phone)}) has been received and locked securely in Wunabuy Escrow.
      </Text>

      <Card style={styles.orderCard}>
        <View style={styles.cardRow}>
          <Text variant="caption" secondary>
            ORDER CODE
          </Text>
          <Text variant="bodyLarge" bold color={colors.primary[500]}>
            {orderCode}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="caption" secondary>
            ESCROW STATUS
          </Text>
          <Badge label="PAID (LOCKED IN ESCROW)" variant="success" size="small" />
        </View>

        <View style={styles.cardRow}>
          <Text variant="caption" secondary>
            DELIVERY DESTINATION
          </Text>
          <Text variant="bodyMedium" bold>
            Rue Joss, Akwa, Douala
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text variant="caption" secondary>
            MERCHANT STORE
          </Text>
          <Text variant="bodyMedium" bold>
            Douala Tech Hub (Akwa)
          </Text>
        </View>
      </Card>

      <Button
        title="Track Delivery Status Live →"
        variant="primary"
        onPress={() => navigation.navigate('OrderTracking', { orderId: orderCode })}
        style={styles.trackBtn}
      />

      <Button
        title="Back to Home"
        variant="ghost"
        onPress={() => navigation.navigate('BuyerHome')}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  orderCard: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackBtn: {
    marginBottom: spacing.sm,
  },
});

