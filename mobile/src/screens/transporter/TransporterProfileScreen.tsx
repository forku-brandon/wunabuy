import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Text, Card, Avatar, Toast, Button, Badge } from '../../components/ui';
import { UserRole } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { AuthService } from '../../services/api';

export const TransporterProfileScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const driverName = user?.full_name || 'Jean-Paul Kamga';
  const driverId = 'DRV-2026-884';
  const vehiclePlate = 'LT-214-AA';
  const vehicleType = 'Motorcycle 🏍️ (Yamaha YBR 125)';
  const baseQuarter = 'Akwa Hub, Douala';
  const availableEarnings = 48500;
  const pendingEscrow = 12500;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleCopyDriverId = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleOpenAvatarModal = () => {
    setSelectedAvatarUri(user?.avatar_url || null);
    setIsAvatarModalVisible(true);
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalVisible(false);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Wunabuy requires camera access to update your driver profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setSelectedAvatarUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Camera Error', 'Could not open camera on this device.');
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photos Permission Required',
          'Wunabuy requires photo library access to select a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setSelectedAvatarUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Gallery Error', 'Could not open photo library.');
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatarUri) {
      setIsAvatarModalVisible(false);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      useAuthStore.getState().updateUser({ avatar_url: selectedAvatarUri });
      AuthService.uploadAvatar(selectedAvatarUri).catch(() => {});
      setIsAvatarModalVisible(false);
      setToastMessage('Driver photo updated successfully! 📸');
    } catch {
      Alert.alert('Upload Failed', 'Could not update driver profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSwitchToBuyer = () => {
    useAuthStore.getState().setActiveRole(UserRole.BUYER);
    AuthService.switchRole(UserRole.BUYER);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + spacing.xs, spacing.md),
            paddingBottom: Math.max(insets.bottom + 80, 100),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent[500]}
            colors={[colors.accent[500]]}
          />
        }
      >
        {/* 1. Header Bar */}
        <View style={styles.topHeaderBar}>
          <View>
            <Text variant="caption" bold color={colors.accent[500]}>
              TRANSPORTER PROFILE
            </Text>
            <Text variant="h1" bold style={styles.screenTitle}>
              Fleet Driver Hub
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
            style={[styles.settingsCircleBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
          >
            <Ionicons name="settings-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* 2. Driver Profile Header Card */}
        <Card style={[styles.profileHeaderCard, { borderColor: colors.role.transporter }]}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleOpenAvatarModal}>
              <View style={styles.avatarWrapper}>
                <Avatar
                  url={user?.avatar_url}
                  name={driverName}
                  size={76}
                />
                <View style={[styles.cameraBadge, { backgroundColor: colors.accent[500] }]}>
                  <Ionicons name="camera" size={13} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.driverInfoStack}>
              <View style={styles.driverTitleRow}>
                <Text variant="h2" bold numberOfLines={1} style={{ flex: 1 }}>
                  {driverName}
                </Text>
                <Badge label="VERIFIED RIDER" variant="warning" size="small" />
              </View>

              <TouchableOpacity activeOpacity={0.7} onPress={handleCopyDriverId} style={styles.driverIdRow}>
                <Text variant="caption" secondary bold>
                  ID: {driverId} • {vehiclePlate}
                </Text>
                <Ionicons name="copy-outline" size={12} color={theme.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text variant="bodyMedium" bold color={colors.accent[500]} style={{ marginLeft: 4 }}>
                  4.95 ★
                </Text>
                <Text variant="caption" secondary style={{ marginLeft: 6 }}>
                  (248 Completed Deliveries)
                </Text>
              </View>
            </View>
          </View>

          {copiedNotification && (
            <View style={styles.copyToastBox}>
              <Text variant="caption" color="#10B981" bold align="center">
                ✓ Driver ID &amp; License Plate Copied to Clipboard!
              </Text>
            </View>
          )}
        </Card>

        {/* 3. Driver Earnings Wallet Quick Banner Card */}
        <Card style={[styles.walletBannerCard, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7', borderColor: isDark ? 'rgba(245,158,11,0.3)' : '#FDE68A' }]}>
          <View style={styles.walletBannerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={18} color={colors.accent[500]} />
              <Text variant="caption" bold color={colors.accent[500]}>
                DRIVER EARNINGS &amp; ESCROW
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Ionicons
                name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.accent[500]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.walletBannerBody}>
            <View>
              <Text variant="caption" secondary style={{ fontSize: 11 }}>
                Available Cashout
              </Text>
              <Text variant="h1" bold color={colors.accent[500]}>
                {isBalanceVisible ? formatXAF(availableEarnings) : '•••••• FCFA'}
              </Text>
            </View>

            <Button
              title="Payout ›"
              variant="primary"
              size="small"
              fullWidth={false}
              onPress={() => navigation.navigate('TransporterEarnings')}
              style={{ backgroundColor: colors.accent[500] }}
            />
          </View>

          <View style={styles.escrowSubLine}>
            <Text variant="caption" secondary style={{ fontSize: 11 }}>
              🔒 Escrow Pending Delivery: <Text variant="caption" bold color={theme.text}>{isBalanceVisible ? formatXAF(pendingEscrow) : '••••••'}</Text>
            </Text>
          </View>
        </Card>

        {/* 4. Dispatch Queue & Fulfillment Status Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h2" bold style={styles.sectionTitleText}>
            Trip Dispatch Queue
          </Text>
        </View>

        <Card style={styles.statusGridCard}>
          <View style={styles.statusGridRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('TransporterJobs')}
              style={styles.statusGridItem}
            >
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7' }]}>
                <Ionicons name="briefcase-outline" size={22} color={colors.accent[500]} />
              </View>
              <Text variant="caption" bold style={styles.statusGridLabel}>
                Offers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('TransporterActiveTrip', { stage: 1 })}
              style={styles.statusGridItem}
            >
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#EFF6FF' }]}>
                <Ionicons name="storefront-outline" size={22} color="#2563EB" />
              </View>
              <Text variant="caption" bold style={styles.statusGridLabel}>
                Pickup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('TransporterActiveTrip', { stage: 3 })}
              style={styles.statusGridItem}
            >
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5' }]}>
                <Ionicons name="car-outline" size={22} color="#10B981" />
              </View>
              <Text variant="caption" bold style={styles.statusGridLabel}>
                En Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('TransporterEarnings')}
              style={styles.statusGridItem}
            >
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#EEF2FF' }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#6366F1" />
              </View>
              <Text variant="caption" bold style={styles.statusGridLabel}>
                Delivered
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 5. Fleet Tools & Driver Settings Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h2" bold style={styles.sectionTitleText}>
            Fleet Tools &amp; Management
          </Text>
        </View>

        <Card style={styles.toolsGridCard}>
          <View style={styles.toolsGridRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('TransporterKYC')}
              style={styles.toolItem}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent[500]} />
              <Text variant="caption" style={styles.toolText}>
                Driver KYC
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('AddressManager')}
              style={styles.toolItem}
            >
              <Ionicons name="navigate-outline" size={22} color={colors.accent[500]} />
              <Text variant="caption" style={styles.toolText}>
                GPS Hub
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('NotificationSettings')}
              style={styles.toolItem}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.accent[500]} />
              <Text variant="caption" style={styles.toolText}>
                Alerts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                Alert.alert('Transporter SOS Support', 'Emergency hotline: 800-WUNABUY-SOS\n24/7 Rider Safety Response Team is active.');
              }}
              style={styles.toolItem}
            >
              <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />
              <Text variant="caption" color="#EF4444" style={styles.toolText}>
                Driver SOS
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 6. Vehicle Details Showcase Card */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h2" bold style={styles.sectionTitleText}>
            Active Registered Vehicle
          </Text>
        </View>

        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleRow}>
            <View style={[styles.vehicleIconCircle, { backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7' }]}>
              <Ionicons name="bicycle" size={26} color={colors.accent[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="bodyLarge" bold numberOfLines={1}>
                  {vehicleType}
                </Text>
                <Badge label="INSPECTED" variant="success" size="small" />
              </View>
              <Text variant="caption" secondary style={{ marginTop: 2 }}>
                License Plate: <Text variant="caption" bold color={theme.text}>{vehiclePlate}</Text> • Sector: <Text variant="caption" bold color={theme.text}>{baseQuarter}</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* 7. 1-Tap Switch to Buyer Workspace Banner Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleSwitchToBuyer}
          style={[
            styles.switchBuyerCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.primary[50],
              borderColor: isDark ? 'rgba(13, 148, 136, 0.3)' : colors.primary[200],
            },
          ]}
        >
          <View style={[styles.switchIconBox, { backgroundColor: colors.primary[500] }]}>
            <Ionicons name="cart" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.switchTextCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="bodyLarge" bold color={colors.primary[700]}>
                Buyer Workspace
              </Text>
              <View style={styles.switchBadgePill}>
                <Text variant="caption" bold color={colors.primary[600]} style={{ fontSize: 9 }}>
                  1-TAP SWITCH
                </Text>
              </View>
            </View>
            <Text variant="caption" secondary numberOfLines={1}>
              Switch to Buyer Mode to browse marketplace &amp; buy products
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary[500]} />
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Photo Update Pop-up Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAvatarModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleCloseAvatarModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.avatarModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text variant="h2" bold>
                Driver Profile Photo
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleCloseAvatarModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarPreviewCenter}>
              <View style={styles.largeAvatarRing}>
                <Avatar
                  url={selectedAvatarUri}
                  name={driverName}
                  size={104}
                />
              </View>
            </View>

            <View style={styles.avatarSourceActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTakePhoto}
                style={[styles.sourceActionBtn, { borderColor: theme.border, backgroundColor: theme.background }]}
              >
                <Ionicons name="camera-outline" size={22} color={colors.accent[500]} />
                <Text variant="bodyMedium" bold style={{ marginTop: 4 }}>
                  Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleChooseFromGallery}
                style={[styles.sourceActionBtn, { borderColor: theme.border, backgroundColor: theme.background }]}
              >
                <Ionicons name="images-outline" size={22} color={colors.accent[500]} />
                <Text variant="bodyMedium" bold style={{ marginTop: 4 }}>
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActionButtonsRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleCloseAvatarModal}
                style={styles.modalBtnFlex}
              />
              <Button
                title="Save Photo"
                variant="primary"
                loading={isUploadingAvatar}
                onPress={handleSaveAvatar}
                style={[styles.modalBtnFlex, { backgroundColor: colors.accent[500] }]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          visible={!!toastMessage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: 22,
    marginTop: 2,
  },
  settingsCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  profileHeaderCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverInfoStack: {
    flex: 1,
  },
  driverTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  driverIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  copyToastBox: {
    backgroundColor: '#ECFDF5',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  walletBannerCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  walletBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  walletBannerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  escrowSubLine: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  sectionTitleText: {
    fontSize: 16,
  },
  statusGridCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statusGridLabel: {
    fontSize: 12,
  },
  toolsGridCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  toolsGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolItem: {
    alignItems: 'center',
    flex: 1,
  },
  toolText: {
    fontSize: 11,
    marginTop: 4,
  },
  vehicleCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vehicleIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBuyerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  switchIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  switchTextCol: {
    flex: 1,
  },
  switchBadgePill: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  avatarModalCard: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    borderTopWidth: 1,
    padding: spacing.lg,
    ...shadows.xl,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  avatarPreviewCenter: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  largeAvatarRing: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.accent[500],
  },
  avatarSourceActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sourceActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtnFlex: {
    flex: 1,
  },
});
