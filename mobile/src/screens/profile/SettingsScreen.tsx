import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, RefreshControl, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Toast } from '../../components/ui';
import { RoleSwitcherCard } from '../../components/profile/RoleSwitcherCard';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { EditProfileModal } from './EditProfileModal';
import { LegalTermsModal, LegalDocType } from '../../components/legal/LegalTermsModal';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { UserRole } from '@wunabuy/types';
import { spacing, colors, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../../services/api/authService';

export const SettingsScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const { isDark, toggleTheme, theme } = useThemeStore();

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalDocType>('terms');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await AuthService.deleteAccount('User requested deletion in Settings');
      if (res.success) {
        setIsDeleteModalOpen(false);
        logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'BuyerApp' }],
        });
      } else {
        Alert.alert('Account Deletion', res.error || 'Failed to delete account. Please try again.');
      }
    } catch {
      Alert.alert('Account Deletion', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const openLegalModal = (tab: LegalDocType) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

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
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              const role = useAuthStore.getState().activeRole;
              if (role === UserRole.SELLER) {
                navigation.navigate('SellerApp');
              } else if (role === UserRole.TRANSPORTER) {
                navigation.navigate('TransporterApp');
              } else {
                navigation.navigate('BuyerApp');
              }
            }
          }}
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
          {/* Edit Profile Details */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => setIsEditProfileModalOpen(true)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="person-circle-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Edit Profile Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

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

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Delete Account & Personal Data (Google Play Compliance) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => setIsDeleteModalOpen(true)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="trash-outline" size={20} color={colors.semantic.error[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge" color={colors.semantic.error[500]}>Delete Account &amp; Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>
        </Card>

        {/* Section 4: Legal, Terms & Policies (Google Play Store Compliance) */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionHeader}>
          LEGAL &amp; POLICIES
        </Text>
        <Card style={styles.groupedCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => openLegalModal('terms')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => openLegalModal('privacy')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuRow}
            onPress={() => openLegalModal('privacy')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="shield-outline" size={20} color={colors.primary[500]} style={styles.menuIcon} />
              <Text variant="bodyLarge">Data Safety &amp; Eradication Protocol</Text>
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

      <EditProfileModal
        visible={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      <LegalTermsModal
        visible={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Account Deletion Confirmation Modal (Google Play Compliance) */}
      <Modal
        visible={isDeleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.deleteModalHeader}>
              <View style={[styles.deleteIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="warning" size={28} color={colors.semantic.error[500]} />
              </View>
              <Text variant="h2" bold color={colors.semantic.error[500]} style={{ marginTop: spacing.sm }}>
                Delete Account &amp; Data
              </Text>
              <Text variant="caption" secondary align="center" style={{ marginTop: spacing.xs, lineHeight: 18 }}>
                This action is permanent and irreversible. Please review the consequences below:
              </Text>
            </View>

            <View style={[styles.deleteInfoBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
              <View style={styles.deleteBulletRow}>
                <Ionicons name="close-circle" size={16} color={colors.semantic.error[500]} style={{ marginRight: 8, marginTop: 2 }} />
                <Text variant="caption" style={{ flex: 1, lineHeight: 18 }}>
                  Your login credentials, active sessions, and access tokens will be permanently revoked.
                </Text>
              </View>
              <View style={styles.deleteBulletRow}>
                <Ionicons name="close-circle" size={16} color={colors.semantic.error[500]} style={{ marginRight: 8, marginTop: 2 }} />
                <Text variant="caption" style={{ flex: 1, lineHeight: 18 }}>
                  Your personal identifiers, phone number, email, and saved delivery addresses will be scrubbed and anonymized.
                </Text>
              </View>
              <View style={styles.deleteBulletRow}>
                <Ionicons name="information-circle" size={16} color={colors.primary[500]} style={{ marginRight: 8, marginTop: 2 }} />
                <Text variant="caption" style={{ flex: 1, lineHeight: 18 }}>
                  Completed transaction receipts are archived strictly for statutory tax compliance under CEMAC commercial law.
                </Text>
              </View>
            </View>

            <View style={styles.deleteModalActions}>
              <Button
                title="Cancel, Keep Account"
                variant="outline"
                disabled={isDeletingAccount}
                onPress={() => setIsDeleteModalOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isDeletingAccount ? "Deleting..." : "Permanently Delete"}
                variant="primary"
                disabled={isDeletingAccount}
                onPress={handleDeleteAccount}
                style={{ flex: 1.2, backgroundColor: colors.semantic.error[500], borderColor: colors.semantic.error[500] }}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadows.lg,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteInfoBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  deleteBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});

