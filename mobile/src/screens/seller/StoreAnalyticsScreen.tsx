import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Badge, Toast } from '../../components/ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useSellerStore } from '../../stores/seller.store';
import { formatXAF } from '@wunabuy/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartBarData {
  day: string;
  amount: number;
  heightPercent: number;
  isPeak?: boolean;
}

const WEEKLY_SALES_DATA: ChartBarData[] = [
  { day: 'Mon', amount: 85000, heightPercent: 45 },
  { day: 'Tue', amount: 120000, heightPercent: 65 },
  { day: 'Wed', amount: 95000, heightPercent: 50 },
  { day: 'Thu', amount: 160000, heightPercent: 85 },
  { day: 'Fri', amount: 195000, heightPercent: 100, isPeak: true },
  { day: 'Sat', amount: 140000, heightPercent: 75 },
  { day: 'Sun', amount: 110000, heightPercent: 60 },
];

const TOP_PRODUCTS_ANALYTICS = [
  { id: 'p1', name: 'Samsung Galaxy A55 5G (8GB RAM, 256GB)', salesCount: 42, revenue: 945000 },
  { id: 'p2', name: 'Nike Air Max 270 Sneakers (Size 42)', salesCount: 38, revenue: 570000 },
  { id: 'p3', name: 'Wireless Bluetooth Earbuds Pro', salesCount: 29, revenue: 261000 },
  { id: 'p4', name: 'Natural Organic Cameroon Palm Oil (5L)', salesCount: 24, revenue: 156000 },
];

export const StoreAnalyticsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();
  const { storeName, availableBalance, escrowLockedBalance } = useSellerStore();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('7d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalWeeklyRevenue = WEEKLY_SALES_DATA.reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportReport = () => {
    setToastMessage('📊 Store Analytics PDF statement downloaded!');
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* AppBar Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top + spacing.xs, spacing.md),
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('SellerDashboard');
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text variant="h1" bold color={theme.text} style={{ fontSize: 19 }}>
            Store Analytics
          </Text>
          <Text variant="caption" secondary numberOfLines={1}>
            {storeName || 'Merchant Store'} • Real-time Telemetry
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handleExportReport} style={styles.exportBtn}>
          <Ionicons name="download-outline" size={22} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) },
        ]}
      >
        {/* Time Period Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTimeRange('7d')}
            style={[
              styles.filterPill,
              timeRange === '7d'
                ? { backgroundColor: colors.primary[500] }
                : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            <Text
              variant="caption"
              bold
              color={timeRange === '7d' ? colors.neutral[0] : theme.textSecondary}
            >
              7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTimeRange('30d')}
            style={[
              styles.filterPill,
              timeRange === '30d'
                ? { backgroundColor: colors.primary[500] }
                : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            <Text
              variant="caption"
              bold
              color={timeRange === '30d' ? colors.neutral[0] : theme.textSecondary}
            >
              30 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTimeRange('1y')}
            style={[
              styles.filterPill,
              timeRange === '1y'
                ? { backgroundColor: colors.primary[500] }
                : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            <Text
              variant="caption"
              bold
              color={timeRange === '1y' ? colors.neutral[0] : theme.textSecondary}
            >
              This Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Revenue Card */}
        <View style={[styles.heroRevenueCard, { backgroundColor: colors.primary[600] }]}>
          <View style={styles.decoCircle1} pointerEvents="none" />
          <View style={styles.decoCircle2} pointerEvents="none" />

          <View style={styles.heroHeaderRow}>
            <View>
              <Text variant="caption" color="rgba(255,255,255,0.78)">
                TOTAL REVENUE (7 DAYS)
              </Text>
              <Text variant="h1" bold color="#FFFFFF" style={styles.heroAmountText}>
                {formatXAF(totalWeeklyRevenue)}
              </Text>
            </View>

            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color="#10B981" style={{ marginRight: 3 }} />
              <Text variant="caption" bold color="#10B981">
                +18.4%
              </Text>
            </View>
          </View>

          <View style={styles.heroFooterRow}>
            <View style={styles.heroStatCol}>
              <Text variant="caption" color="rgba(255,255,255,0.7)">
                Available Wallet
              </Text>
              <Text variant="bodyLarge" bold color="#FFFFFF">
                {formatXAF(availableBalance)}
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStatCol}>
              <Text variant="caption" color="rgba(255,255,255,0.7)">
                Escrow Locked (48H)
              </Text>
              <Text variant="bodyLarge" bold color="#FFFFFF">
                {formatXAF(escrowLockedBalance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Weekly Sales Bar Graph */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Text variant="h3" bold color={theme.text}>
                Sales Velocity Graph
              </Text>
              <Text variant="caption" secondary>
                Daily revenue breakdown for current week
              </Text>
            </View>
            <Badge label="PEAK FRI" variant="primary" size="small" />
          </View>

          {/* Bar Chart Bars Container */}
          <View style={styles.barsContainer}>
            {WEEKLY_SALES_DATA.map((item) => (
              <View key={item.day} style={styles.singleBarCol}>
                <Text variant="caption" color={theme.textSecondary} style={{ fontSize: 9, marginBottom: 4 }}>
                  {(item.amount / 1000).toFixed(0)}k
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${item.heightPercent}%`,
                        backgroundColor: item.isPeak ? colors.primary[500] : colors.primary[200],
                      },
                    ]}
                  />
                </View>
                <Text variant="caption" bold color={item.isPeak ? colors.primary[600] : theme.text} style={{ marginTop: 6 }}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Key Store KPIs Grid */}
        <Text variant="h3" bold style={styles.sectionHeaderTitle}>
          Store Performance KPIs
        </Text>

        <View style={styles.kpiGrid}>
          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="bag-check" size={20} color="#16A34A" />
            </View>
            <Text variant="h2" bold style={{ marginTop: spacing.xs }}>
              148
            </Text>
            <Text variant="caption" secondary>
              Completed Orders
            </Text>
            <Text variant="caption" bold color="#16A34A" style={{ marginTop: 2, fontSize: 10 }}>
              96.2% Success Rate
            </Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="star" size={20} color="#D97706" />
            </View>
            <Text variant="h2" bold style={{ marginTop: spacing.xs }}>
              4.9 / 5.0
            </Text>
            <Text variant="caption" secondary>
              Customer Rating
            </Text>
            <Text variant="caption" bold color="#D97706" style={{ marginTop: 2, fontSize: 10 }}>
              86 Verified Reviews
            </Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="repeat" size={20} color="#2563EB" />
            </View>
            <Text variant="h2" bold style={{ marginTop: spacing.xs }}>
              34.8%
            </Text>
            <Text variant="caption" secondary>
              Repeat Buyers
            </Text>
            <Text variant="caption" bold color="#2563EB" style={{ marginTop: 2, fontSize: 10 }}>
              +5.4% YoY Growth
            </Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="time" size={20} color="#6366F1" />
            </View>
            <Text variant="h2" bold style={{ marginTop: spacing.xs }}>
              42 min
            </Text>
            <Text variant="caption" secondary>
              Avg. Dispatch Speed
            </Text>
            <Text variant="caption" bold color="#6366F1" style={{ marginTop: 2, fontSize: 10 }}>
              Top 5% in Douala
            </Text>
          </Card>
        </View>

        {/* Top Best-Selling Products Table */}
        <Card style={styles.topProductsCard}>
          <View style={styles.topProductsHeader}>
            <Text variant="h3" bold color={theme.text}>
              Top Selling Products
            </Text>
            <Text variant="caption" color={colors.primary[500]} bold>
              By Revenue
            </Text>
          </View>

          {TOP_PRODUCTS_ANALYTICS.map((item, idx) => (
            <View key={item.id} style={[styles.productRow, idx !== TOP_PRODUCTS_ANALYTICS.length - 1 && styles.borderBottom]}>
              <View style={styles.rankBadge}>
                <Text variant="caption" bold color={colors.primary[600]}>
                  #{idx + 1}
                </Text>
              </View>

              <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                <Text variant="bodyMedium" bold numberOfLines={1}>
                  {item.name}
                </Text>
                <Text variant="caption" secondary>
                  {item.salesCount} Units Sold
                </Text>
              </View>

              <Text variant="bodyMedium" bold color={colors.primary[600]}>
                {formatXAF(item.revenue)}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      {toastMessage && <Toast message={toastMessage} type="success" onDismiss={() => setToastMessage(null)} />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm + 2,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.base,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  heroRevenueCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',

  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroAmountText: {
    fontSize: 26,
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: spacing.md,
  },
  heroStatCol: {
    flex: 1,
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.md,
  },
  chartCard: {
    marginBottom: spacing.md,
    padding: spacing.base,
    borderRadius: borderRadius.xl,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: spacing.sm,
  },
  singleBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 110,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - spacing.base * 2 - spacing.sm) / 2,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  kpiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topProductsCard: {
    padding: spacing.base,
    borderRadius: borderRadius.xl,
  },
  topProductsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

