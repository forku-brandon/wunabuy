import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Avatar, Toast } from '../../components/ui';
import { ProductCard } from '../../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { Product } from '@wunabuy/types';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { formatPhone } from '@wunabuy/utils';
import { spacing, colors, borderRadius, shadows } from '@wunabuy/design-tokens';

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { theme, isDark } = useThemeStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const showNotice = (title: string) => {
    setToastMessage(`${title} feature accessed.`);
  };

  const ListHeader = (
    <>
      {/* Top Header Row with Settings Gear Icon (Matching media_1787828841561.png) */}
      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Settings')}
          style={styles.userHeaderLeft}
        >
          <View style={styles.avatarWrapper}>
            <Avatar
              url={user?.avatar_url}
              name={user?.full_name ?? 'Jean Dupont'}
              size={52}
              showBorder
            />
            <View style={styles.avatarCameraBadge}>
              <Ionicons name="camera" size={10} color={colors.neutral[0]} />
            </View>
          </View>
          <View style={styles.userHeaderTextCol}>
            <Text variant="h2" bold numberOfLines={1}>
              {user?.full_name ?? 'Jean Dupont'}
            </Text>
            <View style={styles.userPhoneRow}>
              <Ionicons name="call-outline" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text variant="caption" secondary numberOfLines={1}>
                {formatPhone(user?.phone ?? '+237670123456')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Settings Gear Icon Button (Navigates to Settings page) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Settings')}
          style={[styles.settingsBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ─── Wallet Quick-Access Card ─────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.87}
        onPress={() => navigation.navigate('BuyerWallet')}
        style={[
          styles.walletBannerCard,
          { backgroundColor: colors.primary[500] },
        ]}
      >
        {/* Decorative circles */}
        <View style={styles.walletCircle1} />
        <View style={styles.walletCircle2} />

        <View style={styles.walletBannerLeft}>
          <Text variant="caption" color="rgba(255,255,255,0.8)" style={{ marginBottom: 2 }}>
            Wunabuy Wallet
          </Text>
          <Text variant="h2" bold color={colors.neutral[0]} style={styles.walletBalanceText}>
            47,500 XAF
          </Text>
          <View style={styles.walletEscrowBadge}>
            <Ionicons name="shield-checkmark" size={10} color="rgba(255,255,255,0.9)" style={{ marginRight: 3 }} />
            <Text variant="caption" color="rgba(255,255,255,0.9)" style={{ fontSize: 9 }}>
              48H ESCROW
            </Text>
          </View>
        </View>

        <View style={styles.walletBannerRight}>
          <View style={styles.walletIconCircle}>
            <Ionicons name="wallet" size={26} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold color={colors.neutral[0]} style={{ marginTop: 6 }}>
            Open Wallet ›
          </Text>
        </View>
      </TouchableOpacity>

      {/* "My Orders" Status Grid Section (Matching media_1787828841561.png) */}
      <Card style={styles.ordersCard}>
        <View style={styles.cardHeaderRow}>
          <Text variant="h2" bold style={styles.cardTitle}>
            My Orders
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('BuyerOrders')}>
            <Text variant="bodyMedium" secondary>
              All ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderStatusGrid}>
          {/* To Pay */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'pending_payment' })}
            style={styles.statusItem}
          >
            <Ionicons name="card-outline" size={26} color={theme.text} />
            <Text variant="caption" style={styles.statusText}>
              To Pay
            </Text>
          </TouchableOpacity>

          {/* To Ship */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'preparing' })}
            style={styles.statusItem}
          >
            <View style={styles.iconBadgeWrapper}>
              <Ionicons name="archive-outline" size={26} color={theme.text} />
              <View style={styles.statusBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                  3
                </Text>
              </View>
            </View>
            <Text variant="caption" style={styles.statusText}>
              To Ship
            </Text>
          </TouchableOpacity>

          {/* To Receive */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'in_transit' })}
            style={styles.statusItem}
          >
            <View style={styles.iconBadgeWrapper}>
              <Ionicons name="bus-outline" size={26} color={theme.text} />
              <View style={styles.statusBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                  15
                </Text>
              </View>
            </View>
            <Text variant="caption" style={styles.statusText}>
              To Receive
            </Text>
          </TouchableOpacity>

          {/* To Review */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'delivered' })}
            style={styles.statusItem}
          >
            <View style={styles.iconBadgeWrapper}>
              <Ionicons name="chatbox-ellipses-outline" size={26} color={theme.text} />
              <View style={styles.statusBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                  1
                </Text>
              </View>
            </View>
            <Text variant="caption" style={styles.statusText}>
              To Review
            </Text>
          </TouchableOpacity>

          {/* Refund */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'disputed' })}
            style={styles.statusItem}
          >
            <Ionicons name="cash-outline" size={26} color={theme.text} />
            <Text variant="caption" style={styles.statusText}>
              Refund
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Services / Tools Grid (Matching media_1787828841561.png) */}
      <Card style={styles.toolsCard}>
        {/* Row 1 */}
        <View style={styles.toolsRow}>
          <TouchableOpacity onPress={() => showNotice('Overseas Ship')} style={styles.toolItem}>
            <Ionicons name="airplane-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Overseas Ship
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('AddressManager')} style={styles.toolItem}>
            <Ionicons name="location-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Shipping Address
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('Followed Stores')} style={styles.toolItem}>
            <Ionicons name="storefront-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Followed Stores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('BuyerCart')} style={styles.toolItem}>
            <Ionicons name="star-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('Footprints')} style={styles.toolItem}>
            <Ionicons name="footsteps-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Footprints
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={[styles.toolsRow, { marginTop: spacing.md }]}>
          <TouchableOpacity onPress={() => showNotice('Help Center')} style={styles.toolItem}>
            <Ionicons name="help-buoy-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Help Center
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('BuyerWallet')} style={styles.toolItem}>
            <Ionicons name="wallet" size={22} color={colors.semantic.success[500]} />
            <Text variant="caption" style={styles.toolText}>
              My Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('PLUS Member')} style={styles.toolItem}>
            <Ionicons name="diamond-outline" size={22} color={colors.accent[500]} />
            <Text variant="caption" style={styles.toolText}>
              PLUS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('Vouchers')} style={styles.toolItem}>
            <Ionicons name="ticket-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Vouchers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('Escrow 88 Solution')} style={styles.toolItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              88 Solution
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Partner Opportunities Dual Banner Cards */}
      <View style={styles.partnerCardsRow}>
        {/* Become a Seller */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('SellerWelcome')}
          style={[
            styles.partnerBannerCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF',
              borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : '#BFDBFE',
            },
          ]}
        >
          <View style={[styles.partnerBannerIcon, { backgroundColor: colors.role.seller }]}>
            <Ionicons name="storefront" size={18} color={colors.neutral[0]} />
          </View>
          <View style={styles.partnerBannerTextCol}>
            <Text variant="bodyMedium" bold color={colors.role.seller}>
              Open a Store
            </Text>
            <Text variant="caption" secondary numberOfLines={1}>
              Sell on Wunabuy
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.role.seller} />
        </TouchableOpacity>

        {/* Become a Transporter */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('TransporterWelcome')}
          style={[
            styles.partnerBannerCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#FEF3C7',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
            },
          ]}
        >
          <View style={[styles.partnerBannerIcon, { backgroundColor: colors.role.transporter }]}>
            <Ionicons name="bicycle" size={18} color={colors.neutral[0]} />
          </View>
          <View style={styles.partnerBannerTextCol}>
            <Text variant="bodyMedium" bold color={colors.role.transporter}>
              Deliver &amp; Earn
            </Text>
            <Text variant="caption" secondary numberOfLines={1}>
              Rider onboarding
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.role.transporter} />
        </TouchableOpacity>
      </View>

      {/* Recommended For You Section Header */}
      <View style={styles.gridHeader}>
        <Text variant="h2" bold style={styles.gridTitle}>
          Recommended For You
        </Text>
        <Text variant="caption" secondary>
          Curated items from verified stores in Douala
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={MOCK_PRODUCTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} onPress={handleSelectProduct} />
          </View>
        )}
      />

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    borderWidth: 2,
    borderColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  userHeaderTextCol: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  ordersCard: {
    marginHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
  },
  orderStatusGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#E07A5F',
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  statusBadgeText: {
    fontSize: 9,
  },
  statusText: {
    fontSize: 11,
    marginTop: 4,
  },
  toolsCard: {
    marginHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolItem: {
    alignItems: 'center',
    width: '18%',
  },
  toolText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  gridHeader: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  gridTitle: {
    fontSize: 18,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },
  cardWrapper: {
    width: '48%',
  },
  walletBannerCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  walletCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -30,
    right: 60,
  },
  walletCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.09)',
    bottom: -20,
    left: 20,
  },
  walletBannerLeft: {
    flex: 1,
  },
  walletBalanceText: {
    fontSize: 22,
    marginBottom: 4,
  },
  walletEscrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    marginTop: 2,
  },
  walletBannerRight: {
    alignItems: 'center',
  },
  walletIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  partnerCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  partnerBannerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  partnerBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  partnerBannerTextCol: {
    flex: 1,
  },
});

