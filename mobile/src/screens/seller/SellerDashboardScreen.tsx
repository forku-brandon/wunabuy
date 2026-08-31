import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Badge, Avatar } from '../../components/ui';
import { KYCStatusBanner } from '../../components/seller/KYCStatusBanner';
import { KYCStatus, UserRole } from '@wunabuy/types';
import { formatXAF, formatRelativeTime } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useSellerStore } from '../../stores/seller.store';
import { useAuthStore } from '../../stores/auth.store';
import { SellerService, KYCService, AuthService } from '../../services/api';

interface QuickBeneficiary {
  id: string;
  name: string;
  role: string;
  badgeIcon: keyof typeof Ionicons.glyphMap;
  badgeBg: string;
  avatarUrl: string;
  phone: string;
}

export const SellerDashboardScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const {
    storeName,
    availableBalance,
    escrowLockedBalance,
    orders,
    transactions,
  } = useSellerStore();

  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.APPROVED);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Mock Store/Account identifier formatted with spacing as in reference design
  const storeAccountNumber = '2 1 4 5 4 5 5 3 6';

  const loadDashboardData = useCallback(async () => {
    try {
      const [kycData] = await Promise.all([
        KYCService.getStoreKYCStatus(),
        SellerService.getStoreDashboard(),
      ]);

      if (kycData?.status) {
        setKycStatus(kycData.status as any);
      }
    } catch {
      // Handled gracefully with offline fallback
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartKYC = () => {
    navigation.navigate('StoreKYC');
  };

  const handleCopyAccount = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleBeneficiaryPress = (beneficiary: QuickBeneficiary) => {
    Alert.alert(
      beneficiary.name,
      `Direct action with ${beneficiary.role} (${beneficiary.phone}):`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Fulfill Order',
          onPress: () => navigation.navigate('SellerOrders'),
        },
        {
          text: 'Send Payout',
          onPress: () => navigation.navigate('SellerWallet'),
        },
      ]
    );
  };

  const pendingAcceptanceCount = orders.filter((o) => o.status === 'pending_acceptance').length;

  // Recent Beneficiaries / Transporters / Key Buyers matching reference avatar carousel
  const QUICK_BENEFICIARIES: QuickBeneficiary[] = [
    {
      id: 'b1',
      name: 'Shulamite N.',
      role: 'Regular Buyer',
      badgeIcon: 'cart',
      badgeBg: '#F97316',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      phone: '+237 671 234 567',
    },
    {
      id: 'b2',
      name: 'Jean-Pierre K.',
      role: 'Bike Transporter',
      badgeIcon: 'bicycle',
      badgeBg: '#10B981',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      phone: '+237 670 998 877',
    },
    {
      id: 'b3',
      name: 'Moussa B.',
      role: 'Taxi Transporter',
      badgeIcon: 'car',
      badgeBg: '#F59E0B',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      phone: '+237 694 556 677',
    },
    {
      id: 'b4',
      name: 'Mama Chantal',
      role: 'VIP Customer',
      badgeIcon: 'star',
      badgeBg: '#8B5CF6',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      phone: '+237 677 345 678',
    },
  ];

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary[500]}
          colors={[colors.primary[500]]}
        />
      }
    >
      {/* 1. Top Header Row: User Avatar + Greetings + Right Actions */}
      <View style={styles.topHeaderRow}>
        <View style={styles.userInfoStack}>
          <Avatar
            url={user?.avatar_url}
            size={46}
            showBorder={true}
          />
          <View style={styles.greetingTextContainer}>
            <Text variant="caption" secondary bold style={styles.greetingSubtitle}>
              Hello,
            </Text>
            <Text variant="h3" bold numberOfLines={1} style={styles.greetingName}>
              {user?.full_name || storeName || 'Sanusi Olamide'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActionIcons}>
          {/* Notification Bell */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            onPress={() => navigation.navigate('SellerOrders')}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={theme.text}
            />
            {pendingAcceptanceCount > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>

          {/* QR Code / Scan Action */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            onPress={() => {
              Alert.alert('Store QR Scanner', 'Scan customer or transporter fulfillment QR codes.');
            }}
          >
            <Ionicons
              name="scan-outline"
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>

          {/* 1-Tap Buyer Mode Switcher Pill */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              useAuthStore.getState().setActiveRole(UserRole.BUYER);
              AuthService.switchRole(UserRole.BUYER);
            }}
            style={[
              styles.buyerModeBadge,
              {
                backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : colors.primary[50],
                borderColor: isDark ? 'rgba(13,148,136,0.3)' : colors.primary[200],
              },
            ]}
          >
            <Ionicons name="cart" size={14} color={colors.primary[500]} />
            <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 3 }}>
              Buyer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KYC Status Verification Banner */}
      <KYCStatusBanner
        status={kycStatus}
        onStartKYC={handleStartKYC}
      />

      {/* 2. Main Feature Hero Balance Card (Emerald Teal Gradient with Image overlay & ID copy) */}
      <View
        style={[
          styles.heroBalanceCard,
          {
            backgroundColor: isDark ? '#064E3B' : '#0F766E',
          },
        ]}
      >
        {/* Background Decorative Curves & Stylized Silhouette */}
        <View style={styles.cardBgGlow} />
        <View style={styles.cardDecorativeCircle} />

        {/* Top Row: Store Account ID + Copy Icon + Top-Right Floating Fast Action Arrow */}
        <View style={styles.heroCardTopRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCopyAccount}
            style={styles.accountIdPill}
          >
            <Text variant="caption" color="rgba(255,255,255,0.95)" bold style={styles.accountIdText}>
              {storeAccountNumber}
            </Text>
            <Ionicons
              name="copy-outline"
              size={13}
              color="rgba(255,255,255,0.9)"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SellerWallet')}
            style={styles.floatingActionArrowBtn}
          >
            <Ionicons name="arrow-up-outline" size={18} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Copy Feedback Toast */}
        {copiedNotification && (
          <View style={styles.copiedPill}>
            <Text variant="caption" color="#10B981" bold>
              ✓ Store Account Number Copied!
            </Text>
          </View>
        )}

        {/* Middle: Account Label + Privacy Eye Toggle */}
        <View style={styles.heroCardLabelRow}>
          <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
            Store Account
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            style={styles.eyeToggleBtn}
          >
            <Ionicons
              name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={16}
              color="rgba(255,255,255,0.85)"
            />
          </TouchableOpacity>
        </View>

        {/* Main Large Balance Display */}
        <View style={styles.heroBalanceAmountRow}>
          <Text variant="bodyLarge" color="rgba(255,255,255,0.9)" bold style={styles.currencyPrefix}>
            XAF
          </Text>
          <Text variant="display" bold color="#FFFFFF" style={styles.balanceMainText}>
            {isBalanceVisible
              ? availableBalance.toLocaleString('fr-FR')
              : '••••••••'}
          </Text>
        </View>

        {/* Bottom Escrow / Protection Badge */}
        <View style={styles.escrowSubBadgeRow}>
          <View style={styles.escrowPill}>
            <Text variant="caption" color="#FDE68A" bold>
              🔒 {formatXAF(escrowLockedBalance)} in Escrow (48H Protected)
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Top Services Grid (4-Column x 2-Row Icon Tiles) */}
      <View style={styles.sectionHeaderRow}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          Top services
        </Text>
      </View>

      <View style={styles.servicesGrid}>
        {/* 1. Send Money / Payout */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerWallet')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="arrow-up-circle-outline" size={26} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Send money
          </Text>
        </TouchableOpacity>

        {/* 2. Add Product */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('AddEditProduct')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="cube-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            + Product
          </Text>
        </TouchableOpacity>

        {/* 3. Orders Queue */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerOrders')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="receipt-outline" size={24} color={colors.primary[500]} />
            {pendingAcceptanceCount > 0 && (
              <View style={styles.tileBadgeCount}>
                <Text variant="caption" color="#FFFFFF" bold style={{ fontSize: 9 }}>
                  {pendingAcceptanceCount}
                </Text>
              </View>
            )}
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Orders ({orders.length})
          </Text>
        </TouchableOpacity>

        {/* 4. Stock & Catalog */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerProducts')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="pricetags-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Inventory
          </Text>
        </TouchableOpacity>

        {/* 5. Live Dispatch */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerOrders')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="bicycle-outline" size={25} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Dispatch
          </Text>
        </TouchableOpacity>

        {/* 6. Store KYC */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('StoreKYC')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Store KYC
          </Text>
        </TouchableOpacity>

        {/* 7. Store Profile */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="storefront-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Settings
          </Text>
        </TouchableOpacity>

        {/* 8. More Options */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => {
            Alert.alert('Store Tools', 'Quick access to analytics, marketing campaigns, and customer messaging.');
          }}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="grid-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            More
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Quick transfer - Beneficiary (Horizontal Avatar List) */}
      <View style={styles.sectionHeaderRow}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          Quick transfer <Text variant="bodyMedium" secondary bold>- Beneficiary</Text>
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.beneficiaryScrollList}
      >
        {QUICK_BENEFICIARIES.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => handleBeneficiaryPress(item)}
            style={styles.beneficiaryCard}
          >
            <View style={styles.beneficiaryAvatarWrapper}>
              <Image
                source={{ uri: item.avatarUrl }}
                style={styles.beneficiaryAvatarImage}
              />
              <View style={[styles.beneficiaryBadge, { backgroundColor: item.badgeBg }]}>
                <Ionicons name={item.badgeIcon} size={11} color="#FFFFFF" />
              </View>
            </View>
            <Text variant="caption" bold numberOfLines={1} style={styles.beneficiaryName}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 5. Recent Transactions & Fulfillment Orders Feed */}
      <View style={styles.sectionHeaderRow}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          Recent transactions
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SellerWallet')}
        >
          <Text variant="caption" bold color={colors.primary[500]}>
            See all ›
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentTransactionsList}>
        {transactions.slice(0, 4).map((tx) => (
          <Card key={tx.id} style={styles.transactionCard}>
            <View style={styles.txRow}>
              <View
                style={[
                  styles.txIconCircle,
                  {
                    backgroundColor:
                      tx.type === 'payout'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : tx.type === 'escrow_release'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={
                    tx.type === 'payout'
                      ? 'arrow-up-circle'
                      : tx.type === 'escrow_release'
                      ? 'checkmark-circle'
                      : 'card'
                  }
                  size={22}
                  color={
                    tx.type === 'payout'
                      ? colors.semantic.error[500]
                      : tx.type === 'escrow_release'
                      ? colors.semantic.success[500]
                      : colors.accent[500]
                  }
                />
              </View>

              <View style={styles.txInfoStack}>
                <Text variant="bodyLarge" bold numberOfLines={1}>
                  {tx.description}
                </Text>
                <Text variant="caption" secondary>
                  {formatRelativeTime(tx.created_at)} • {tx.reference}
                </Text>
              </View>

              <View style={styles.txAmountStack}>
                <Text
                  variant="bodyLarge"
                  bold
                  color={tx.type === 'payout' ? colors.semantic.error[500] : colors.semantic.success[500]}
                >
                  {tx.type === 'payout' ? '-' : '+'}
                  {formatXAF(tx.amount)}
                </Text>
                <Badge
                  label={tx.status.toUpperCase()}
                  variant={tx.status === 'completed' ? 'success' : 'warning'}
                  size="small"
                />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  // 1. Top Header
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  userInfoStack: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingTextContainer: {
    marginLeft: spacing.sm + 2,
    flex: 1,
  },
  greetingSubtitle: {
    fontSize: 12,
    lineHeight: 14,
    opacity: 0.7,
  },
  greetingName: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: 1,
  },
  headerRightActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  buyerModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },

  // 2. Hero Balance Card
  heroBalanceCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardBgGlow: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardDecorativeCircle: {
    position: 'absolute',
    bottom: -60,
    left: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  accountIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  accountIdText: {
    letterSpacing: 2,
    fontSize: 13,
  },
  floatingActionArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  heroCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  eyeToggleBtn: {
    padding: 2,
  },
  heroBalanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  currencyPrefix: {
    fontSize: 16,
    marginRight: 6,
    opacity: 0.9,
  },
  balanceMainText: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  escrowSubBadgeRow: {
    marginTop: spacing.xs,
  },
  escrowPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },

  // 3. Top Services Grid
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginBottom: spacing.xl,
  },
  serviceItemWrapper: {
    width: '22.5%',
    alignItems: 'center',
  },
  serviceIconTile: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    position: 'relative',
  },
  tileBadgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
  },

  // 4. Beneficiaries / Quick Handover List
  beneficiaryScrollList: {
    paddingRight: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  beneficiaryCard: {
    alignItems: 'center',
    width: 68,
  },
  beneficiaryAvatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  beneficiaryAvatarImage: {
    width: '100%',
    height: '100%',
  },
  beneficiaryBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  beneficiaryName: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
  },

  // 5. Recent Transactions Feed
  recentTransactionsList: {
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  transactionCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  txInfoStack: {
    flex: 1,
    marginRight: spacing.sm,
  },
  txAmountStack: {
    alignItems: 'flex-end',
    gap: 4,
  },
});

