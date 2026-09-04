import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge } from '../../components/ui';
import { formatXAF, formatPhone } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const OrderSuccessScreen = ({ route, navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const {
    orderCode = 'WB-2026-9842',
    totalAmount = 188000,
    provider = 'MTN',
    phone = '+237670000000',
    deliveryMethod = 'wunabuy_transporter',
    pickupPin = '84920',
  } = route.params || {};

  const isSelfPickup = deliveryMethod === 'self_pickup';

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.centerContent}>
      <View style={styles.successIconBox}>
        <Text variant="display">🎉</Text>
      </View>

      <Text variant="h1" bold align="center" style={styles.title}>
        Payment Locked in Escrow!
      </Text>

      <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
        Your payment of <Text bold color={colors.primary[500]}>{formatXAF(totalAmount)}</Text> via {provider} ({formatPhone(phone)}) has been received and locked securely in Wunabuy Escrow.
      </Text>

      {/* Main Order Card */}
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
            DELIVERY METHOD
          </Text>
          <Badge
            label={isSelfPickup ? 'SELF-PICKUP / COURIER' : 'WUNABUY EXPRESS'}
            variant={isSelfPickup ? 'warning' : 'primary'}
            size="small"
          />
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

      {/* Self Pickup 5-Digit Verification PIN Card (User Request #10) */}
      {isSelfPickup && (
        <Card style={[styles.selfPickupCard, { backgroundColor: isDark ? colors.neutral[800] : '#ECFDF5', borderColor: colors.primary[400] }]}>
          <View style={styles.selfPickupHeader}>
            <Ionicons name="key" size={20} color={colors.primary[600]} />
            <Text variant="h2" bold color={colors.primary[700]} style={{ marginLeft: 6 }}>
              Personal Rider PIN: #{pickupPin}
            </Text>
          </View>
          <Text variant="caption" secondary style={{ marginVertical: spacing.xs, lineHeight: 18 }}>
            Give this 5-digit PIN to your personal rider/courier. The merchant seller will verify this PIN before releasing your order parcel.
          </Text>

          <View style={[styles.storeAddressBox, { backgroundColor: isDark ? colors.neutral[900] : '#F0FDFA' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Ionicons name="location" size={14} color={colors.primary[600]} style={{ marginRight: 4 }} />
              <Text variant="caption" bold color={theme.text}>
                PICKUP STORE LOCATION:
              </Text>
            </View>
            <Text variant="bodyMedium" bold color={colors.primary[600]}>
              Douala Tech Hub — Rue Joss, Akwa, Douala
            </Text>
            <Text variant="caption" secondary style={{ marginTop: 2 }}>
              Store Phone: +237 670 123 456
            </Text>
          </View>
        </Card>
      )}

      <Button
        title="Track Order & Delivery Status →"
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
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  orderCard: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selfPickupCard: {
    marginBottom: spacing.md,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  selfPickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAddressBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
  },
  trackBtn: {
    marginBottom: spacing.xs,
  },
});

