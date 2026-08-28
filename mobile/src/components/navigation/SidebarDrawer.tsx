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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Avatar, Badge, Button } from '../ui';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';

const WUNABUY_LOGO = require('../../../assets/icon.png');

export interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { theme, isDark, toggleTheme } = useThemeStore();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  if (!isOpen) return null;

  const handleNavigate = (screenName: string, params?: any) => {
    onClose();
    navigation.navigate(screenName, params);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

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
                <View style={styles.escrowPillBadge}>
                  <Ionicons name="shield-checkmark" size={10} color={colors.primary[600]} style={{ marginRight: 3 }} />
                  <Text variant="caption" bold color={colors.primary[600]} style={styles.escrowBadgeText}>
                    48H ESCROW
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
            {/* User Profile & Wallet Summary Card */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => handleNavigate('BuyerWallet')}
              style={[
                styles.userProfileCard,
                { backgroundColor: isDark ? '#1E293B' : colors.primary[50] },
                !isDark && shadows.sm,
              ]}
            >
              <View style={styles.avatarWrapper}>
                <Avatar url={user?.avatar_url} name={user?.full_name || 'Jean Dupont'} size={48} />
                <View style={styles.onlinePulseDot} />
              </View>

              <View style={styles.userInfo}>
                <Text variant="bodyLarge" bold numberOfLines={1}>
                  {user?.full_name || 'Jean Dupont'}
                </Text>
                <Text variant="caption" secondary numberOfLines={1} style={{ marginTop: 1 }}>
                  {user?.phone || '+237 670 123 456'}
                </Text>

                {/* Wallet Balance Display with Eye Privacy Toggle */}
                <View style={[styles.walletBalanceBadge, { backgroundColor: isDark ? 'rgba(13,148,136,0.25)' : '#CCFBF1' }]}>
                  <Ionicons name="wallet-outline" size={13} color={colors.primary[600]} style={{ marginRight: 4 }} />
                  <Text variant="caption" bold color={colors.primary[600]} style={styles.walletBalanceText}>
                    {isBalanceVisible ? '47,500 XAF' : '••••••• XAF'}
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

            {/* Section 1: Partner Opportunities */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              PARTNER OPPORTUNITIES
            </Text>

            {/* Become a Seller */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => handleNavigate('SellerWelcome')}
              style={[
                styles.partnerMenuCard,
                { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' },
              ]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: colors.role.seller }]}>
                <Ionicons name="storefront" size={20} color={colors.neutral[0]} />
              </View>
              <View style={styles.menuTextCol}>
                <Text variant="bodyLarge" bold>
                  Become a Seller
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  Register store &amp; sell products across Cameroon
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </TouchableOpacity>

            {/* Become a Transporter */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => handleNavigate('TransporterWelcome')}
              style={[
                styles.partnerMenuCard,
                { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' },
              ]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: colors.role.transporter }]}>
                <Ionicons name="bicycle" size={20} color={colors.neutral[0]} />
              </View>
              <View style={styles.menuTextCol}>
                <Text variant="bodyLarge" bold>
                  Become a Transporter
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  Deliver packages &amp; earn instant daily MoMo cashouts
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />

            {/* Section 2: Account & Quick Navigation */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              NAVIGATION &amp; ORDERS
            </Text>

            {/* My Wallet */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('BuyerWallet')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? '#1C3A2E' : '#ECFDF5' }]}>
                <Ionicons name="wallet-outline" size={18} color={colors.semantic.success[500]} />
              </View>
              <View style={styles.simpleMenuTextCol}>
                <Text variant="bodyLarge" style={styles.simpleMenuText}>
                  My Wallet
                </Text>
                <Text variant="caption" secondary>
                  Balance, Fund &amp; Withdraw
                </Text>
              </View>
              <View style={styles.walletBadgePill}>
                <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 9 }}>
                  MoMo
                </Text>
              </View>
            </TouchableOpacity>

            {/* My Orders & Escrow */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('BuyerOrders')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="bag-handle-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                My Orders &amp; Escrow
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            {/* Delivery Addresses */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('AddressManager')}
              style={styles.simpleMenuItem}
            >
              <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <Ionicons name="location-outline" size={18} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Delivery Addresses
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
                Notifications &amp; Alerts
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
                Settings &amp; Preferences
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />

            {/* Section 3: App Controls */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              APP CONTROLS
            </Text>

            {/* Dark Mode Switch */}
            <View style={styles.switchMenuItem}>
              <View style={styles.switchLeftRow}>
                <View style={[styles.simpleIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                  <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={18} color={colors.primary[500]} />
                </View>
                <Text variant="bodyLarge">Dark Appearance</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Bottom Log Out Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={styles.logoutBtn}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.semantic.error[500]} style={{ marginRight: 6 }} />
              <Text variant="bodyLarge" bold color={colors.semantic.error[500]}>
                Log Out Account
              </Text>
            </TouchableOpacity>
          </View>
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
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  drawerPanel: {
    width: '84%',
    height: '100%',
    paddingHorizontal: spacing.base,
    zIndex: 20,
    ...shadows.xl,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 4,
  },
  logoBorderRing: {
    padding: 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  logoImage: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
  },
  logoTextStack: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    lineHeight: 22,
  },
  escrowPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    marginTop: 1,
  },
  escrowBadgeText: {
    fontSize: 8,
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
    paddingBottom: spacing.lg,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  onlinePulseDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.semantic.success[500],
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  walletBalanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginTop: 4,
  },
  walletBalanceText: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginRight: 6,
  },
  eyeToggleBtn: {
    padding: 2,
  },
  dividerLine: {
    height: 1,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs + 2,
  },
  partnerMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xs + 2,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  simpleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    marginBottom: 2,
  },
  simpleIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  simpleMenuText: {
    flex: 1,
  },
  simpleMenuTextCol: {
    flex: 1,
  },
  walletBadgePill: {
    backgroundColor: colors.semantic.success[500],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  switchMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  switchLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  logoutBtn: {
    width: '100%',
    height: 46,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.semantic.error[500],
    backgroundColor: colors.semantic.error[50],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
