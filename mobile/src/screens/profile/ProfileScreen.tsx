import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ScreenContainer, Text, Card, Avatar, Badge, Button } from '../../components/ui';
import { RoleSwitcherCard } from '../../components/profile/RoleSwitcherCard';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { formatPhone } from '@wunabuy/utils';
import { spacing, colors } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';

export const ProfileScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, theme } = useThemeStore();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <ScreenContainer>
      {/* Profile Header */}
      <Card style={styles.profileHeaderCard}>
        <View style={styles.profileRow}>
          <Avatar
            url={user?.avatar_url}
            name={user?.full_name ?? 'User'}
            size={60}
          />

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text variant="h2" bold>
                {user?.full_name ?? 'Wunabuy User'}
              </Text>
              {user?.is_phone_verified && (
                <Badge label="VERIFIED" variant="success" size="small" />
              )}
            </View>

            <Text variant="bodyMedium" secondary>
              {formatPhone(user?.phone ?? '+237670000000')}
            </Text>
          </View>
        </View>
      </Card>

      {/* Dynamic Role Switcher Card */}
      <RoleSwitcherCard />

      {/* Settings Options Group */}
      <Card style={styles.menuCard}>
        {/* Saved Addresses */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AddressManager')}
        >
          <Text variant="bodyLarge">📍 Saved Delivery Addresses</Text>
          <Text variant="bodyMedium" secondary>
            ›
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={[styles.menuItem, styles.borderTop, { borderColor: theme.border }]}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Text variant="bodyLarge">🔔 Notification Preferences</Text>
          <Text variant="bodyMedium" secondary>
            ›
          </Text>
        </TouchableOpacity>

        {/* Language Picker */}
        <TouchableOpacity
          style={[styles.menuItem, styles.borderTop, { borderColor: theme.border }]}
          onPress={() => setIsLangModalOpen(true)}
        >
          <Text variant="bodyLarge">🌐 Language ({i18n.language.toUpperCase()})</Text>
          <Text variant="bodyMedium" secondary>
            ›
          </Text>
        </TouchableOpacity>

        {/* Dark Mode Toggle */}
        <View style={[styles.menuItem, styles.borderTop, { borderColor: theme.border }]}>
          <Text variant="bodyLarge">🌙 Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: colors.primary[500] }}
          />
        </View>
      </Card>

      {/* Logout Action */}
      <Button
        title="Logout Account"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutButton}
      />

      <LanguageSelectorModal
        visible={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  profileHeaderCard: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  menuCard: {
    paddingVertical: 0,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  borderTop: {
    borderTopWidth: 1,
  },
  logoutButton: {
    marginBottom: spacing.xl,
  },
});
