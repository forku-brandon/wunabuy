import React from 'react';
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

        {/* Drawer Panel */}
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
          {/* Top Brand & Close Button */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoRow}>
              <Image source={WUNABUY_LOGO} style={styles.logoImage} resizeMode="contain" />
              <View>
                <Text variant="h2" bold color={colors.primary[500]}>
                  Wunabuy
                </Text>
                <Text variant="caption" secondary style={styles.tagline}>
                  ESCROW MARKETPLACE
                </Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* User Profile Summary Card */}
            <View style={[styles.userProfileCard, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
              <Avatar url={user?.avatar_url} name={user?.full_name || 'User'} size={48} />
              <View style={styles.userInfo}>
                <Text variant="bodyLarge" bold numberOfLines={1}>
                  {user?.full_name || 'Jean Dupont'}
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  {user?.phone || '+237 670 123 456'}
                </Text>
                <View style={styles.roleBadgeWrapper}>
                  <Badge label="BUYER ACCOUNT" variant="primary" size="small" />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Menu Items */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              PARTNER OPPORTUNITIES
            </Text>

            {/* Become a Seller */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('StoreKYC')}
              style={[styles.menuItem, { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' }]}
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
              activeOpacity={0.8}
              onPress={() => handleNavigate('StoreKYC', { role: 'transporter' })}
              style={[styles.menuItem, { backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC' }]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: colors.accent[500] }]}>
                <Ionicons name="car" size={20} color={colors.neutral[0]} />
              </View>
              <View style={styles.menuTextCol}>
                <Text variant="bodyLarge" bold>
                  Become a Transporter
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  Earn money delivering packages with live GPS
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
              PREFERENCES &amp; ACCOUNT
            </Text>

            {/* Delivery Addresses */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('AddressManager')}
              style={styles.simpleMenuItem}
            >
              <Ionicons name="location-outline" size={20} color={colors.primary[500]} style={styles.simpleMenuIcon} />
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Delivery Addresses
              </Text>
            </TouchableOpacity>

            {/* Notification Settings */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigate('NotificationSettings')}
              style={styles.simpleMenuItem}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.primary[500]} style={styles.simpleMenuIcon} />
              <Text variant="bodyLarge" style={styles.simpleMenuText}>
                Notifications &amp; Alerts
              </Text>
            </TouchableOpacity>

            {/* Dark Mode Switch */}
            <View style={styles.switchMenuItem}>
              <View style={styles.switchLeftRow}>
                <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={colors.primary[500]} style={styles.simpleMenuIcon} />
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

          {/* Log Out Button */}
          <View style={styles.footer}>
            <Button
              title="Log Out"
              variant="outline"
              onPress={handleLogout}
              style={styles.logoutBtn}
            />
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
    gap: spacing.xs + 2,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 0.8,
    marginTop: -2,
  },
  closeBtn: {
    padding: spacing.xs,
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
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  roleBadgeWrapper: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs + 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
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
    paddingVertical: spacing.sm + 2,
  },
  simpleMenuIcon: {
    marginRight: spacing.md,
  },
  simpleMenuText: {
    flex: 1,
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
    borderColor: colors.semantic.error[500],
  },
});
