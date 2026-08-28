import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Toast } from '../../components/ui';
import { RoleSwitcherCard } from '../../components/profile/RoleSwitcherCard';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';

export const SettingsScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const { isDark, toggleTheme, theme } = useThemeStore();

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const showNotice = (msg: string) => {
    setToastMessage(`${msg} settings are active and up to date.`);
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.headerTitle}>
          Settings &amp; Preferences
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section 1: Saved Addresses & Notifications */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionHeader}>
          ACCOUNT &amp; DELIVERY
        </Text>
        <Card style={styles.groupedCard}>
          {/* Saved Delivery Addresses */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => navigation.navigate('AddressManager')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="location-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Saved Delivery Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Notification Preferences */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Notification Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>
        </Card>

        {/* Section 2: Regional Preferences */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionHeader}>
          REGIONAL PREFERENCES
        </Text>
        <Card style={styles.groupedCard}>
          {/* Language Selection */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => setIsLangModalOpen(true)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="language-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Language</Text>
            </View>
            <View style={styles.menuRight}>
              <Text variant="bodyMedium" secondary style={{ marginRight: 4 }}>
                {i18n.language === 'fr' ? 'Français' : 'English'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Currencies */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => showNotice('Currency (FCFA / XAF)')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="cash-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Currencies</Text>
            </View>
            <View style={styles.menuRight}>
              <Text variant="bodyMedium" secondary style={{ marginRight: 4 }}>
                FCFA (XAF)
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Dark Mode Switch */}
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Appearance</Text>
            </View>
            <View style={styles.menuRight}>
              <Text variant="bodyMedium" secondary style={{ marginRight: 8 }}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </Card>

        {/* Section 3: Security & Devices */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionHeader}>
          SECURITY &amp; PRIVACY
        </Text>
        <Card style={styles.groupedCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => showNotice('Application Security')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Application Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => showNotice('Manage Devices')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Manage Devices</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => showNotice('Change Password / PIN')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="key-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Change Password / PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>
        </Card>

        {/* Dynamic Role Switcher (Transporter & Seller hidden until approved by Staff API) */}
        <RoleSwitcherCard navigation={navigation} />

        {/* Logout Button */}
        <Button
          title="Logout Account"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>

      <LanguageSelectorModal
        visible={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: 22,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  sectionHeader: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  groupedCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  divider: {
    height: 1,
  },
  logoutButton: {
    borderColor: colors.semantic.error[500],
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

