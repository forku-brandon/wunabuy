import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge } from '../../components/ui';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

const MOCK_TRIP_HISTORY = [
  { id: 't1', code: 'WB-2026-9842', distance: '2.4 km', fee: 1500, date: 'Today, 14:20' },
  { id: 't2', code: 'WB-2026-7731', distance: '3.8 km', fee: 2000, date: 'Today, 11:45' },
  { id: 't3', code: 'WB-2026-3390', distance: '1.9 km', fee: 1500, date: 'Yesterday, 16:10' },
];

export const TransporterEarningsScreen = () => {
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const totalEarned = 18500;
  const availablePayout = 14000;

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
                12 Trips
              </Text>
            </View>
          </View>

          <Button
            title="Withdraw Earnings to MoMo"
            variant="secondary"
            size="medium"
            style={styles.payoutBtn}
            onPress={() => {}}
          />
        </Card>

        {/* Trip History Header */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
          COMPLETED TRIP HISTORY
        </Text>

        <FlatList
          data={MOCK_TRIP_HISTORY}
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

                <Text variant="h3" bold color={colors.role.transporter}>
                  +{formatXAF(item.fee)}
                </Text>
              </View>
            </Card>
          )}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  content: {
    padding: spacing.base,
    flex: 1,
  },
  walletCard: {
    backgroundColor: colors.neutral[900],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  balanceText: {
    marginVertical: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  payoutBtn: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  listContent: {
    gap: spacing.sm,
  },
  tripCard: {
    marginBottom: 0,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

