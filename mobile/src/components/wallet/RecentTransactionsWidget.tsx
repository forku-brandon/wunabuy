import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../ui';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { formatXAF } from '@wunabuy/utils';

export interface TransactionItem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  fullDateGroup?: string;
  amount: number;
  type: 'credit' | 'debit';
  status?: 'completed' | 'pending' | 'cancelled' | 'failed';
  reference?: string;
}

export const MOCK_APP_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx_1',
    title: 'Bronhilder njingun',
    date: 'May 28, 2026',
    fullDateGroup: 'Thursday, May 28, 2026',
    amount: -1518,
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'tx_2',
    title: 'Bronhilder njingun',
    date: 'May 24, 2026',
    fullDateGroup: 'Sunday, May 24, 2026',
    amount: 607.2,
    type: 'debit',
    status: 'cancelled',
  },
  {
    id: 'tx_3',
    title: 'Bronhilder njingun',
    date: 'May 24, 2026',
    fullDateGroup: 'Sunday, May 24, 2026',
    amount: 607.2,
    type: 'debit',
    status: 'cancelled',
  },
  {
    id: 'tx_4',
    title: 'Bronhilder njingun',
    date: 'May 23, 2026',
    fullDateGroup: 'Saturday, May 23, 2026',
    amount: 506,
    type: 'debit',
    status: 'cancelled',
  },
  {
    id: 'tx_5',
    title: 'Bronhilder njingun',
    date: 'May 10, 2026',
    fullDateGroup: 'Sunday, May 10, 2026',
    amount: -303.6,
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'tx_6',
    title: 'Bronhilder njingun',
    date: 'May 7, 2026',
    fullDateGroup: 'Thursday, May 7, 2026',
    amount: -1012,
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'tx_7',
    title: 'Forku Brandon',
    date: 'May 6, 2026',
    fullDateGroup: 'Wednesday, May 6, 2026',
    amount: 8000,
    type: 'credit',
    status: 'completed',
  },
  {
    id: 'tx_8',
    title: 'Bronhilder njingun',
    date: 'Apr 3, 2026',
    fullDateGroup: 'Friday, April 3, 2026',
    amount: -506,
    type: 'debit',
    status: 'completed',
  },
  {
    id: 'tx_9',
    title: 'Forku Brandon',
    date: 'Apr 2, 2026',
    fullDateGroup: 'Thursday, April 2, 2026',
    amount: 500,
    type: 'credit',
    status: 'completed',
  },
];

interface RecentTransactionsWidgetProps {
  transactions?: TransactionItem[];
  onViewAll?: () => void;
  limit?: number;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions = MOCK_APP_TRANSACTIONS,
  onViewAll,
  limit = 5,
}) => {
  const { theme, isDark } = useThemeStore();
  const displayItems = transactions.slice(0, limit);

  const formatAmountText = (item: TransactionItem) => {
    const absVal = Math.abs(item.amount);
    const formattedNum = absVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (item.amount < 0 || item.type === 'debit') {
      return `-${formattedNum} XAF`;
    } else if (item.amount > 0 && item.type === 'credit') {
      return `+${formattedNum} XAF`;
    }
    return `${formattedNum} XAF`;
  };

  return (
    <View style={styles.container}>
      {/* Widget Header Row */}
      <View style={styles.headerRow}>
        <Text variant="h2" bold color={theme.text}>
          Recent transactions
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onViewAll}>
          <Text variant="bodyMedium" bold color={colors.primary[500]}>
            View all
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clean White/Dark Single Card Container */}
      <View style={[styles.cardContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCancelled = item.status === 'cancelled';
          const isNegative = item.amount < 0 || (item.type === 'debit' && !isCancelled);
          const isPositive = item.amount > 0 && item.type === 'credit';

          const amountColor = isCancelled
            ? (isDark ? colors.neutral[300] : colors.neutral[700])
            : isNegative
            ? '#DC2626'
            : isPositive
            ? '#16A34A'
            : theme.text;

          return (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                !isLast && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
            >
              {/* Left Column: Title + Cancelled Badge + Date */}
              <View style={styles.leftCol}>
                <Text variant="bodyLarge" bold color={theme.text} numberOfLines={1}>
                  {item.title}
                </Text>

                <View style={styles.subRow}>
                  {isCancelled && (
                    <View style={styles.cancelledBadge}>
                      <Text variant="caption" bold color="#DC2626" style={{ fontSize: 10 }}>
                        Cancelled
                      </Text>
                    </View>
                  )}
                  <Text variant="caption" secondary style={{ fontSize: 12 }}>
                    {item.date}
                  </Text>
                </View>
              </View>

              {/* Right Column: Amount */}
              <Text variant="bodyLarge" bold color={amountColor} align="right">
                {formatAmountText(item)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  cardContainer: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  leftCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cancelledBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});

