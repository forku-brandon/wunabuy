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
import { useThemeStore } from '../../stores/theme.store';
import { UserRole } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { AuthService, TransporterService } from '../../services/api';

const WUNABUY_LOGO = require('../../../assets/icon.png');

export interface TransporterSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
}

export const TransporterSidebarDrawer: React.FC<TransporterSidebarDrawerProps> = ({
  isOpen,
  onClose,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { theme, isDark, toggleTheme } = useThemeStore();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  if (!isOpen) return null;

  const handleToggleDuty = async (val: boolean) => {
    setIsOnDuty(val);
    await TransporterService.updateDutyStatus(val);
  };


  const handleNavigate = (screenName: string, params?: any) => {
    onClose();
    navigation.navigate(screenName, params);
  };

  const handleSwitchToBuyer = () => {
    onClose();
    useAuthStore.getState().setActiveRole(UserRole.BUYER);
    AuthService.switchRole(UserRole.BUYER);
  };

  const handleSwitchToSeller = () => {
    onClose();
    const isGranted = user?.role === UserRole.SELLER || user?.available_roles?.includes(UserRole.SELLER) || true;
    if (isGranted) {
      useAuthStore.getState().setActiveRole(UserRole.SELLER);
      AuthService.switchRole(UserRole.SELLER);
    } else {
      navigation.navigate('SellerWelcome');
    }
  };


  const handleLogout = () => {
    onClose();
    logout();
  };

  const driverName = user?.full_name || 'Jean-Paul Kamga';
  const driverId = 'DRV-2026-884';
  const vehiclePlate = 'LT-214-AA';
  const availableEarnings = 48500;
  const pendingEscrow = 12500;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        {/* Slide-out Drawer Panel (Anchored to Left Side) */}
        <View
          style={[
            styles.drawerPanel,
            {
              backgroundColor: theme.card,
              paddingTop: Math.max(insets.top + spacing.sm, spacing.lg),
              paddingBottom: Math.max(insets.bottom + spacing.sm, spacing.lg),
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerScrollContent}>
            {/* Header: Brand & Close */}
            <View style={styles.drawerHeaderRow}>
              <View style={styles.brandBadgeRow}>
                <Image source={WUNABUY_LOGO} style={styles.brandLogo} resizeMode="contain" />
                <View>
                  <Text variant="bodyLarge" bold color={colors.primary[600]}>
                    WUNABUY EXPRESS
                  </Text>
                  <Text variant="caption" secondary style={{ fontSize: 10 }}>
                    FLEET DISPATCH HUB
                  </Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={[styles.closeIconBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Driver Profile Card */}
            <View style={[styles.driverProfileCard, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50], borderColor: colors.primary[500] }]}>
              <View style={styles.driverAvatarRow}>
                <Avatar
                  url={user?.avatar_url}
                  name={driverName}
                  size={54}
                />
                <View style={styles.driverMetaCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text variant="bodyLarge" bold numberOfLines={1} style={{ maxWidth: 140 }}>
                      {driverName}
                    </Text>
                    <Badge label="VERIFIED" variant="primary" size="small" />
                  </View>
                  <Text variant="caption" secondary style={{ marginTop: 1 }}>
                    ID: {driverId} • {vehiclePlate}
                  </Text>
                  <View style={styles.ratingBadgeRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 3 }}>
                      4.95 ★ (248 Trips)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Duty Toggle Switch */}
              <View style={[styles.dutyToggleRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,148,136,0.15)' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.dutyDot, { backgroundColor: isOnDuty ? colors.primary[500] : colors.neutral[400] }]} />
                  <Text variant="caption" bold color={isOnDuty ? colors.primary[600] : theme.textSecondary}>
                    {isOnDuty ? 'ONLINE • RECEIVING JOBS' : 'OFFLINE • SHIFT PAUSED'}
                  </Text>
                </View>
                <Switch
                  value={isOnDuty}
                  onValueChange={handleToggleDuty}
                  trackColor={{ false: theme.border, true: colors.primary[500] }}
                  thumbColor="#FFFFFF"
                />

              </View>
            </View>

            {/* Driver Wallet Overview Banner */}
            <View style={[styles.walletOverviewCard, { backgroundColor: isDark ? '#1E293B' : colors.primary[50], borderColor: isDark ? 'rgba(13,148,136,0.3)' : colors.primary[200] }]}>
              <View style={styles.walletHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="wallet-outline" size={16} color={colors.primary[600]} />
                  <Text variant="caption" bold color={colors.primary[600]}>
                    DRIVER EARNINGS
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                  <Ionicons
                    name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={16}
                    color={colors.primary[600]}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.walletAmountsRow}>
                <View>
                  <Text variant="caption" secondary style={{ fontSize: 10 }}>
                    Available Cashout
                  </Text>
                  <Text variant="h2" bold color={colors.primary[600]}>
                    {isBalanceVisible ? formatXAF(availableEarnings) : '•••••• FCFA'}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="caption" secondary style={{ fontSize: 10 }}>
                    In Escrow
                  </Text>
                  <Text variant="bodyLarge" bold color={theme.text}>
                    {isBalanceVisible ? formatXAF(pendingEscrow) : '••••••'}
                  </Text>
                </View>
              </View>
            </View>


            {/* Workspace Switcher Cards */}
            <Text variant="caption" bold secondary style={styles.sectionEyebrow}>
              SWITCH WORKSPACE ROLE
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSwitchToBuyer}
              style={[styles.roleSwitchCard, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50], borderColor: isDark ? 'rgba(13,148,136,0.3)' : colors.primary[200] }]}
            >
              <View style={[styles.roleIconCircle, { backgroundColor: colors.primary[500] }]}>
                <Ionicons name="cart" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" bold color={colors.primary[700]}>
                  Shop as Buyer 🛒
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  Browse products, order delivery &amp; use buyer wallet
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSwitchToSeller}
              style={[styles.roleSwitchCard, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF', borderColor: isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE' }]}
            >
              <View style={[styles.roleIconCircle, { backgroundColor: '#2563EB' }]}>
                <Ionicons name="storefront" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" bold color="#1E40AF">
                  Store Owner (Sell) 🏪
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  Manage merchant store catalog, orders &amp; payouts
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </TouchableOpacity>

            {/* Fleet Operations Links */}
            <Text variant="caption" bold secondary style={styles.sectionEyebrow}>
              FLEET OPERATIONS &amp; TOOLS
            </Text>

            <View style={styles.linksContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('TransporterJobs')}
                style={[styles.linkRow, { borderBottomColor: theme.border }]}
              >
                <View style={styles.linkLeftGroup}>
                  <View style={[styles.linkIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                    <Ionicons name="briefcase-outline" size={18} color={colors.primary[600]} />
                  </View>
                  <Text variant="bodyMedium" bold style={styles.linkLabel}>
                    Available Job Offers
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('TransporterActiveTrip')}
                style={[styles.linkRow, { borderBottomColor: theme.border }]}
              >
                <View style={styles.linkLeftGroup}>
                  <View style={[styles.linkIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                    <Ionicons name="navigate-outline" size={18} color={colors.primary[600]} />
                  </View>
                  <Text variant="bodyMedium" bold style={styles.linkLabel}>
                    Active Dispatch Trip
                  </Text>
                </View>
                <Badge label="LIVE" variant="primary" size="small" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('TransporterEarnings')}
                style={[styles.linkRow, { borderBottomColor: theme.border }]}
              >
                <View style={styles.linkLeftGroup}>
                  <View style={[styles.linkIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                    <Ionicons name="cash-outline" size={18} color={colors.primary[600]} />
                  </View>

                  <Text variant="bodyMedium" bold style={styles.linkLabel}>
                    Earnings &amp; MoMo Cashout
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('TransporterKYC')}
                style={[styles.linkRow, { borderBottomColor: theme.border }]}
              >
                <View style={styles.linkLeftGroup}>
                  <View style={[styles.linkIconBox, { backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#EEF2FF' }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#6366F1" />
                  </View>
                  <Text variant="bodyMedium" bold style={styles.linkLabel}>
                    Vehicle &amp; Driver KYC
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('AddressManager')}
                style={[styles.linkRow, { borderBottomColor: theme.border }]}
              >
                <View style={styles.linkLeftGroup}>
                  <View style={[styles.linkIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                    <Ionicons name="map-outline" size={18} color={colors.primary[500]} />
                  </View>
                  <Text variant="bodyMedium" bold style={styles.linkLabel}>
                    GPS Route Preferences
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('NotificationSettings')}
                style={[styles.linkRow, { borderBottomColor: theme.border }]}
              >
                <View style={styles.linkLeftGroup}>
                  <View style={[styles.linkIconBox, { backgroundColor: isDark ? 'rgba(100,116,139,0.2)' : colors.neutral[100] }]}>
                    <Ionicons name="notifications-outline" size={18} color={theme.text} />
                  </View>
                  <Text variant="bodyMedium" bold style={styles.linkLabel}>
                    Dispatch Alerts
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert('Transporter SOS Support', 'Emergency hotline: 800-WUNABUY-SOS\n24/7 Rider Safety Response Team is active.');
                }}
                style={styles.linkRow}
              >
                <View style={styles.linkLeftGroup}>
                  <View style={[styles.linkIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                  </View>
                  <Text variant="bodyMedium" bold color="#EF4444" style={styles.linkLabel}>
                    Driver SOS &amp; Safety Help
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Footer Actions */}
            <View style={styles.drawerFooterStack}>
              {/* Dark Mode Toggle */}
              <View style={[styles.themeRow, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primary[600]} />
                  <Text variant="bodyMedium" bold>
                    {isDark ? 'Dark Theme' : 'Light Theme'}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.border, true: colors.primary[500] }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Logout Button */}
              <Button
                title="Log Out of Transporter Fleet"
                variant="outline"
                size="medium"
                onPress={handleLogout}
                style={styles.logoutBtn}
              />

              <Text variant="caption" secondary align="center" style={styles.versionText}>
                Wunabuy Express v2.0.0 • Douala Fleet
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Backdrop overlay (Right Side) */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  drawerPanel: {
    width: '84%',
    maxWidth: 340,
    height: '100%',
    paddingHorizontal: spacing.base,
    ...shadows.xl,
  },
  drawerScrollContent: {
    paddingBottom: spacing.xl,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  closeIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverProfileCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  driverAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverMetaCol: {
    flex: 1,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dutyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walletOverviewCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  walletAmountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionEyebrow: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  roleSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xs + 2,
    gap: spacing.md,
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linksContainer: {
    marginBottom: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 2,
    borderBottomWidth: 1,
  },
  linkLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    fontSize: 14,
  },
  drawerFooterStack: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  logoutBtn: {
    borderColor: colors.semantic.error[500],
  },
  versionText: {
    fontSize: 10,
    marginTop: spacing.xs,
  },
});

