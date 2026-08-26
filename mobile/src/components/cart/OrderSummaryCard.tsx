import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text, Card, Badge } from '../ui';

export interface OrderSummaryCardProps {
  subtotal: number;
  commissionRate?: number; // Default 3.5% (Decision B-1)
  deliveryFee?: number; // Default 1500 XAF estimated local transport
  style?: ViewStyle;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  subtotal,
  commissionRate = 0.035, // 3.5%
  deliveryFee = 1500, // 1,500 FCFA estimated local Douala transport
  style,
}) => {
  const { theme } = useThemeStore();

  const commission = Math.round(subtotal * commissionRate);
  const total = subtotal + commission + deliveryFee;

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <Text variant="h3" bold>
          Payment Breakdown
        </Text>
        <Badge label="3.5% ESCROW FEE" variant="success" size="small" />
      </View>

      {/* Subtotal Row */}
      <View style={styles.row}>
        <Text variant="bodyMedium" secondary>
          Items Subtotal
        </Text>
        <Text variant="bodyMedium" bold>
          {formatXAF(subtotal)}
        </Text>
      </View>

      {/* Commission Row */}
      <View style={styles.row}>
        <Text variant="bodyMedium" secondary>
          Platform Escrow Fee (3.5%)
        </Text>
        <Text variant="bodyMedium" bold>
          {formatXAF(commission)}
        </Text>
      </View>

      {/* Delivery Fee Row */}
      <View style={styles.row}>
        <Text variant="bodyMedium" secondary>
          Estimated Transport Delivery Fee
        </Text>
        <Text variant="bodyMedium" bold>
          {formatXAF(deliveryFee)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Total Payable Row */}
      <View style={styles.totalRow}>
        <View>
          <Text variant="h3" bold>
            Total Escrow Amount
          </Text>
          <Text variant="caption" color={colors.semantic.success[700]}>
            🔒 Money held safely until delivery
          </Text>
        </View>

        <Text variant="display" bold color={colors.primary[500]}>
          {formatXAF(total)}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
