import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Avatar, Badge, Button } from '../ui';
import { useAuthStore } from '../../stores/auth.store';
import { useSellerStore } from '../../stores/seller.store';
import { useThemeStore } from '../../stores/theme.store';
import { UserRole } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { AuthService } from '../../services/api';

const WUNABUY_LOGO = require('../../../assets/icon.png');

export interface SellerSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
}

export const SellerSidebarDrawer: React.FC<SellerSidebarDrawerProps> = ({
  isOpen,
  onClose,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { storeName, availableBalance, escrowLockedBalance, orders } = useSellerStore();
  const { theme, isDark, toggleTheme } = useThemeStore();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  if (!isOpen) return null;

  const handleNavigate = (screenName: string, params?: any) => {
    onClose();
    navigation.navigate(screenName, params);
  };

  const handleSwitchToBuyer = () => {
    onClose();
    useAuthStore.getState().setActiveRole(UserRole.BUYER);
    AuthService.switchRole(UserRole.BUYER);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const pendingCount = orders.filter((o) => o.status === 'pending_acceptance').length;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        {/* Backdrop overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Slide-out Drawer Panel */}
        <View
          style={[
            styles.drawerPanel,
            {
              backgroundColor: theme.card,
              paddingTop: Math.max(insets.top + spacing.xs, spacing.md),
              paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl),
            },
          ]}
        >
          {/* Top Brand & Close Button Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoRow}>
              <View style={styles.logoBorderRing}>
                <Image source={WUNABUY_LOGO} style={styles.logoImage} resizeMode="contain" />
              </View>
              <View style={styles.logoTextStack}>
                <Text variant="h2" bold color={colors.primary[500]} style={styles.brandTitle}>
                  Wunabuy
                </Text>
                <View style={styles.merchantPillBadge}>
                  <Ionicons name="storefront" size={10} color={colors.primary[600]} style={{ marginRight: 3 }} />
                  <Text variant="caption" bold color={colors.primary[600]} style={styles.merchantBadgeText}>
                    MERCHANT HUB
                  </Text>
                </View>
              </View>
            </View>

            {/* Circular Close Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={[styles.closeBtnCircle, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Merchant Store Profile & Wallet Summary Card */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => handleNavigate('SellerWallet')}
              style={[
                styles.merchantProfileCard,
                { backgroundColor: isDark ? '#1E293B' : colors.primary[50] },
                !isDark && shadows.sm,
              ]}
            >
              <View style={styles.avatarWrapper}>
                <Avatar url={user?.avatar_url} name={user?.full_name || storeName} size={48} />
                <View style={styles.onlinePulseDot} />
              </View>

              <View style={styles.userInfo}>
                <Text variant="bodyLarge" bold numberOfLines={1}>
                  {storeName || user?.full_name || 'My Store'}
                </Text>
                <Text variant="caption" secondary numberOfLines={1} style={{ marginTop: 1 }}>
                  {user?.phone || '+237 670 123 456'}
                </Text>

                {/* Wallet Balance Display with Eye Privacy Toggle */}
                <View style={[styles.walletBalanceBadge, { backgroundColor: isDark ? 'rgba(13,148,136,0.25)' : '#CCFBF1' }]}>
                  <Ionicons name="wallet-outline" size={13} color={colors.primary[600]} style={{ marginRight: 4 }} />
                  <Text variant="caption" bold color={colors.primary[600]} style={styles.walletBalanceText}>
                    {isBalanceVisible ? formatXAF(availableBalance) : '••••••• FCFA'}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={(e) => {
                      e.stopPropagation();
                      setIsBalanceVisible(!isBalanceVisible);
                    }}
                    style={styles.eyeToggleBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                      size={14}
                      color={colors.primary[600]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={colors.primary[500]} />
            </TouchableOpacity>

            {/* Section 1: Merchant Workspace Operations (Replaces Become Seller / Transporter) */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              WORKSPACE &amp; LOGISTICS
            </Text>

            {/* 1. Switch to Buyer Workspace */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={handleSwitchToBuyer}
              style={[
                styles.partnerMenuCard,
                { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' },
              ]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: colors.primary[500] }]}>
                <Ionicons name="cart" size={20} color={colors.neutral[0]} />
              </View>
              <View style={styles.menuTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="bodyLarge" bold>
                    Shop as Buyer
                  </Text>
                  <View style={[styles.activePillTag, { backgroundColor: 'rgba(13,148,136,0.15)' }]}>
                    <Text variant="caption" bold color={colors.primary[600]} style={{ fontSize: 9 }}>
                      1-TAP SWITCH
                    </Text>
                  </View>
                </View>
                <Text variant="caption" secondary numberOfLines={1}>
                  Browse products, escrow cart &amp; buy items
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </TouchableOpacity>

            {/* 2. On-Demand Logistics & Transporters */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => handleNavigate('SellerOrders')}
              style={[
                styles.partnerMenuCard,
                { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' },
              ]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: colors.accent[500] }]}>
                <Ionicons name="bicycle" size={20} color={colors.neutral[0]} />
              </View>
              <View style={styles.menuTextCol}>
                <Text variant="bodyLarge" bold>
                  Express Transporters
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  Dispatch orders to verified bike &amp; taxi riders
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </TouchableOpacity>

            {/* 3. Business Telemetry & Analytics */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => {
                Alert.alert(
                  'Store Analytics',
                  `Store: ${storeName}\nAvailable: ${formatXAF(availableBalance)}\nEscrow: ${formatXAF(escrowLockedBalance)}\nTotal Orders: ${orders.length}`
                );
              }}
              style={[
                styles.partnerMenuCard,
                { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' },
              ]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#6366F1' }]}>
                <Ionicons name="stats-chart" size={18} color={colors.neutral[0]} />
              </View>
              <View style={styles.menuTextCol}>
                <Text variant="bodyLarge" bold>
                  Store Analytics
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  Sales conversion, revenue &amp; fulfillment rates
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />

            {/* Section 2: Store Management Navigation */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              STORE MANAGEMENT
            </Text>

            {/* Add Product */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('AddEditProduct')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="cube-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                List New Product
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            {/* Catalog & Inventory */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('SellerProducts')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="pricetags-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Catalog &amp; Stock Levels
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            {/* Fulfillment Queue */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('SellerOrders')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="receipt-outline" size={18} color={colors.primary[500]} />
              </View>
              <View style={styles.simpleMenuTextCol}>
                <Text variant="bodyLarge" style={styles.simpleMenuText}>
                  Order Fulfillment Queue
                </Text>
                <Text variant="caption" secondary>
                  Accept, Pack &amp; Handover
                </Text>
              </View>
              {pendingCount > 0 && (
                <View style={styles.orderBadgePill}>
                  <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 9 }}>
                    {pendingCount} NEW
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Store Wallet */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('SellerWallet')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? '#1C3A2E' : '#ECFDF5' }]}>
                <Ionicons name="wallet-outline" size={18} color={colors.semantic.success[500]} />
              </View>
              <View style={styles.simpleMenuTextCol}>
                <Text variant="bodyLarge" style={styles.simpleMenuText}>
                  Store Wallet &amp; Payouts
                </Text>
                <Text variant="caption" secondary>
                  Instant MTN &amp; Orange MoMo
                </Text>
              </View>
              <View style={styles.walletBadgePill}>
                <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 9 }}>
                  MoMo
                </Text>
              </View>
            </TouchableOpacity>

            {/* Store KYC Verification */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('StoreKYC')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Store KYC &amp; Verification
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            {/* Store Address & Base Coordinates */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('AddressManager')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="location-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Store Address &amp; GPS Hub
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            {/* Notification Settings */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('NotificationSettings')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="notifications-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Order Alerts &amp; Sound
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            {/* Settings & Preferences */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('Settings')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="settings-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Settings &amp; Store Profile
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />

            {/* Section 3: App Controls */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              APP CONTROLS
            </Text>

            {/* Dark Mode Switcher */}
            <View style={[styles.themeToggleRow, { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' }]}>
              <View style={styles.themeToggleLeft}>
                <View style={[styles.simpleIconBox, { backgroundColor: isDark ? '#334155' : '#EDE9FE' }]}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={isDark ? '#A78BFA' : '#7C3AED'} />
                </View>
                <View>
                  <Text variant="bodyLarge" bold>
                    Dark Appearance
                  </Text>
                  <Text variant="caption" secondary>
                    {isDark ? 'High-contrast OLED dark' : 'Bright emerald light'}
                  </Text>
                </View>
              </View>

              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                thumbColor={colors.neutral[0]}
              />
            </View>

            {/* Logout Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={[
                styles.logoutBtn,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
                },
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.semantic.error[500]} style={{ marginRight: 8 }} />
              <Text variant="bodyLarge" bold color={colors.semantic.error[500]}>
                Log Out Account
              </Text>
            </TouchableOpacity>

            {/* Footer Build Info */}
            <View style={styles.drawerFooter}>
              <Text variant="caption" secondary style={styles.footerText}>
                Wunabuy Merchant App v1.8 • Cameroon
              </Text>
              <Text variant="caption" secondary style={styles.footerSubText}>
                Escrow Protected • Real-Time Reverb Logistics
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  drawerPanel: {
    width: '84%',
    maxWidth: 360,
    height: '100%',
    paddingHorizontal: spacing.base,
    borderTopRightRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
    ...shadows.xl,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBorderRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    overflow: 'hidden',
  },
  logoImage: {
    width: 26,
    height: 26,
  },
  logoTextStack: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  merchantPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    marginTop: 2,
  },
  merchantBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  closeBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: spacing.sm,
  },
  merchantProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.md,
  },
  onlinePulseDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  walletBalanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  walletBalanceText: {
    fontSize: 11,
    marginRight: 4,
  },
  eyeToggleBtn: {
    padding: 2,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  partnerMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  menuTextCol: {
    flex: 1,
  },
  activePillTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  dividerLine: {
    height: 1,
    marginVertical: spacing.md,
    opacity: 0.7,
  },
  simpleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
  },
  simpleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  simpleMenuTextCol: {
    flex: 1,
  },
  simpleMenuText: {
    flex: 1,
    fontSize: 14,
  },
  orderBadgePill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  walletBadgePill: {
    backgroundColor: colors.semantic.success[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  drawerFooter: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.7,
  },
});

