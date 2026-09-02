import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Toast, Badge } from '../../components/ui';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { MOCK_APP_TRANSACTIONS, TransactionItem } from '../../components/wallet/RecentTransactionsWidget';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TransactionHistoryScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'7d' | '15d' | '1m' | 'custom'>('1m');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExportStatement = () => {
    setToastMessage('📥 Statement PDF exported & saved to downloads!');
  };

  const filteredTransactions = MOCK_APP_TRANSACTIONS.filter((tx) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.date.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q)
      );
    }
    return true;
  });

  // Group transactions by fullDateGroup
  const groupedTransactions = filteredTransactions.reduce<Record<string, TransactionItem[]>>((acc, tx) => {
    const groupKey = tx.fullDateGroup || tx.date;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(tx);
    return acc;
  }, {});

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
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header AppBar matching Image 1 */}
      <View style={[styles.headerBar, { backgroundColor: isDark ? theme.card : '#E0F2FE', borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('BuyerHome');
            }
          }}
          style={styles.closeHeaderBtn}
        >
          <Ionicons name="close" size={24} color={colors.primary[900]} />
        </TouchableOpacity>

        <Text variant="h1" bold color={colors.primary[900]} style={styles.headerTitle}>
          Transactions
        </Text>

        <TouchableOpacity activeOpacity={0.8} onPress={handleExportStatement} style={styles.exportHeaderBtn}>
          <Ionicons name="download-outline" size={24} color={colors.primary[900]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) }]}
      >
        {/* Search Bar Input */}
        <View style={[styles.searchBox, { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
          <Ionicons name="search-outline" size={20} color={colors.primary[500]} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Time Filter Chips Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('7d')}
            style={[
              styles.filterChip,
              activeFilter === '7d'
                ? { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1.5 }
                : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
            ]}
          >
            <Text variant="bodyMedium" bold={activeFilter === '7d'} color={theme.text}>
              7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('15d')}
            style={[
              styles.filterChip,
              activeFilter === '15d'
                ? { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1.5 }
                : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
            ]}
          >
            <Text variant="bodyMedium" bold={activeFilter === '15d'} color={theme.text}>
              15 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('1m')}
            style={[
              styles.filterChip,
              activeFilter === '1m'
                ? { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1.5 }
                : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
            ]}
          >
            <Text variant="bodyMedium" bold={activeFilter === '1m'} color={theme.text}>
              1 Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('custom')}
            style={[
              styles.filterChip,
              activeFilter === 'custom'
                ? { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1.5 }
                : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
            ]}
          >
            <Text variant="bodyMedium" bold={activeFilter === 'custom'} color={theme.text}>
              Custom Date
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Grouped Date List Items matching Image 1 */}
        {Object.entries(groupedTransactions).map(([dateGroup, items]) => (
          <View key={dateGroup} style={styles.dateGroupSection}>
            <Text variant="caption" bold color={theme.text} style={styles.dateGroupHeader}>
              {dateGroup}
            </Text>

            {items.map((item) => {
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
                <Card key={item.id} style={styles.itemCard}>
                  <View style={styles.itemCardRow}>
                    <View style={styles.itemLeft}>
                      <Text variant="bodyLarge" bold color={theme.text}>
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

                    <Text variant="bodyLarge" bold color={amountColor} align="right">
                      {formatAmountText(item)}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {toastMessage && <Toast message={toastMessage} type="success" onDismiss={() => setToastMessage(null)} />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  closeHeaderBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 19,
  },
  exportHeaderBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.base,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.xs,
    fontSize: 15,
  },
  filterChipScroll: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  dateGroupSection: {
    marginBottom: spacing.md,
  },
  dateGroupHeader: {
    fontSize: 14,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  itemCard: {
    marginBottom: spacing.xs + 2,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  itemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
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

