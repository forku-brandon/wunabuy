import React, { useState, useCallback, useEffect } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
import { AuthService, TransporterService, DriverProfileData } from '../../services/api';

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
  const [profileData, setProfileData] = useState<DriverProfileData | null>(null);

  // Vehicle update modal states
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('Motorcycle');
  const [editPlateNumber, setEditPlateNumber] = useState('');
  const [editLicenseNumber, setEditLicenseNumber] = useState('');
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await TransporterService.getDriverProfile();
      setProfileData(data);
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const driverName = profileData?.full_name || user?.full_name || 'Fleet Driver';
  const driverId = profileData?.driver_id || (user?.id ? `DRV-${user.id.substring(0, 8).toUpperCase()}` : '');
  const vehiclePlate = profileData?.vehicle?.plate_number || '';
  const vehicleType = profileData?.vehicle?.type || '';
  const driverLicense = profileData?.vehicle?.license_number || '';
  const isVehicleRegistered = !!(vehiclePlate || vehicleType);
  const baseQuarter = profileData?.vehicle?.operating_quarter || '';
  const availableEarnings = profileData?.earnings?.available_cashout ?? 0;
  const pendingEscrow = profileData?.earnings?.pending_escrow ?? 0;


  const handleOpenVehicleModal = () => {
    setEditFullName(profileData?.full_name || user?.full_name || '');
    setEditVehicleType(profileData?.vehicle?.type || 'Motorcycle');
    setEditPlateNumber(profileData?.vehicle?.plate_number || '');
    setEditLicenseNumber(profileData?.vehicle?.license_number || '');
    setIsVehicleModalVisible(true);
  };

  const handleCloseVehicleModal = () => {
    setIsVehicleModalVisible(false);
  };

  const handleSaveVehicle = async () => {
    setIsSavingVehicle(true);
    try {
      const updated = await TransporterService.updateDriverProfile({
        full_name: editFullName.trim(),
        vehicle_type: editVehicleType.trim(),
        vehicle_plate: editPlateNumber.trim(),
        plate_number: editPlateNumber.trim(),
        license_number: editLicenseNumber.trim(),
      });
      if (editFullName.trim()) {
        useAuthStore.getState().updateUser({ full_name: editFullName.trim() });
      }
      if (updated) {
        setProfileData(updated);
      } else {
        await loadProfile();
      }
      setIsVehicleModalVisible(false);
      setToastMessage('Vehicle information saved! 🛵');
    } catch {
      Alert.alert('Save Failed', 'Could not save vehicle information. Please try again.');
    } finally {
      setIsSavingVehicle(false);
    }
  };

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
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }

      >
        {/* 1. Header Bar */}
        <View style={styles.topHeaderBar}>
          <View>
            <Text variant="caption" bold color={colors.primary[600]}>
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
        <Card style={[styles.profileHeaderCard, { borderColor: colors.primary[500] }]}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleOpenAvatarModal}>
              <View style={styles.avatarWrapper}>
                <Avatar
                  url={user?.avatar_url}
                  name={driverName}
                  size={76}
                />
                <View style={[styles.cameraBadge, { backgroundColor: colors.primary[500] }]}>
                  <Ionicons name="camera" size={13} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.driverInfoStack}>
              <View style={styles.driverTitleRow}>
                <Text variant="h2" bold numberOfLines={1} style={{ flex: 1 }}>
                  {driverName}
                </Text>
                <Badge label={profileData?.is_verified ? 'VERIFIED RIDER' : 'FLEET DRIVER'} variant={profileData?.is_verified ? 'success' : 'primary'} size="small" />
              </View>

              <TouchableOpacity activeOpacity={0.7} onPress={handleCopyDriverId} style={styles.driverIdRow}>
                <Text variant="caption" secondary bold>
                  ID: {driverId}{vehiclePlate ? ` • ${vehiclePlate}` : ''}
                </Text>
                <Ionicons name="copy-outline" size={12} color={theme.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text variant="bodyMedium" bold color={colors.primary[600]} style={{ marginLeft: 4 }}>
                  {(profileData?.rating_avg ?? 5.0).toFixed(1)} ★
                </Text>
                <Text variant="caption" secondary style={{ marginLeft: 6 }}>
                  ({profileData?.completed_deliveries ?? 0} Completed Deliveries)
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
        <Card style={[styles.walletBannerCard, { backgroundColor: isDark ? '#1E293B' : colors.primary[50], borderColor: isDark ? 'rgba(13,148,136,0.3)' : colors.primary[200] }]}>
          <View style={styles.walletBannerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary[600]} />
              <Text variant="caption" bold color={colors.primary[600]}>
                DRIVER EARNINGS &amp; ESCROW
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Ionicons
                name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.primary[600]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.walletBannerBody}>
            <View>
              <Text variant="caption" secondary style={{ fontSize: 11 }}>
                Available Cashout
              </Text>
              <Text variant="h1" bold color={colors.primary[600]}>
                {isBalanceVisible ? formatXAF(availableEarnings) : '•••••• FCFA'}
              </Text>
            </View>

            <Button
              title="Payout ›"
              variant="primary"
              size="small"
              fullWidth={false}
              onPress={() => navigation.navigate('TransporterEarnings')}
              style={{ backgroundColor: colors.primary[500] }}
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
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                <Ionicons name="briefcase-outline" size={22} color={colors.primary[500]} />
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
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                <Ionicons name="storefront-outline" size={22} color={colors.primary[600]} />
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
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                <Ionicons name="car-outline" size={22} color={colors.primary[500]} />
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
              <View style={[styles.statusIconBox, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary[600]} />
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
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary[500]} />
              <Text variant="caption" style={styles.toolText}>
                Driver KYC
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('AddressManager')}
              style={styles.toolItem}
            >
              <Ionicons name="navigate-outline" size={22} color={colors.primary[500]} />
              <Text variant="caption" style={styles.toolText}>
                GPS Hub
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('NotificationSettings')}
              style={styles.toolItem}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.primary[500]} />
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

        {/* 6. Vehicle Details Showcase Card (Structured Specs Grid) */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h2" bold style={styles.sectionTitleText}>
            Active Registered Vehicle
          </Text>
          {isVehicleRegistered && (
            <TouchableOpacity onPress={handleOpenVehicleModal}>
              <Text variant="caption" bold color={colors.primary[600]}>
                Edit Details ›
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isVehicleRegistered ? (
          <Card style={styles.vehicleCard}>
            <View style={styles.vehicleRow}>
              <View style={[styles.vehicleIconCircle, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
                <Ionicons
                  name={
                    vehicleType.toLowerCase().includes('car') ||
                    vehicleType.toLowerCase().includes('van') ||
                    vehicleType.toLowerCase().includes('truck')
                      ? 'car'
                      : 'bicycle'
                  }
                  size={26}
                  color={colors.primary[500]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant="bodyLarge" bold numberOfLines={1} style={{ flex: 1, marginRight: 6 }}>
                    {vehicleType || 'Registered Vehicle'}
                  </Text>
                  <Badge label="ACTIVE FLEET" variant="primary" size="small" />
                </View>
                <Text variant="caption" secondary style={{ marginTop: 2 }}>
                  {vehiclePlate ? `Plate: ${vehiclePlate}` : 'Commercial Delivery Transport'}
                </Text>
              </View>
            </View>

            {/* 2-Column Specs Grid */}
            <View style={[styles.vehicleSpecsGrid, { borderTopColor: theme.border }]}>
              <View style={styles.specGridItem}>
                <Text variant="caption" secondary bold style={{ fontSize: 10 }}>
                  LICENSE PLATE
                </Text>
                <Text variant="bodyMedium" bold color={colors.primary[600]}>
                  {vehiclePlate || 'Not registered'}
                </Text>
              </View>

              <View style={styles.specGridItem}>
                <Text variant="caption" secondary bold style={{ fontSize: 10 }}>
                  DRIVER LICENSE
                </Text>
                <Text variant="bodyMedium" bold style={{ marginTop: 1 }}>
                  {driverLicense || 'Verified on file'}
                </Text>
              </View>

              <View style={styles.specGridItem}>
                <Text variant="caption" secondary bold style={{ fontSize: 10 }}>
                  VEHICLE TYPE
                </Text>
                <Text variant="bodyMedium" bold style={{ marginTop: 1 }}>
                  {vehicleType || 'Motorcycle'}
                </Text>
              </View>

              <View style={styles.specGridItem}>
                <Text variant="caption" secondary bold style={{ fontSize: 10 }}>
                  DISPATCH STATUS
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text variant="caption" bold color="#10B981">
                    Ready for Delivery
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={[styles.emptyVehicleCard, { borderColor: theme.border }]}>
            <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
              <View
                style={[
                  styles.vehicleIconCircle,
                  {
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50],
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                <Ionicons name="bicycle-outline" size={28} color={colors.primary[500]} />
              </View>
              <Text variant="bodyLarge" bold>
                No Vehicle Registered Yet
              </Text>
              <Text variant="caption" secondary align="center" style={{ marginTop: 4, maxWidth: 280 }}>
                Register your delivery motorcycle, tricycle, or car to accept package delivery requests and start earning.
              </Text>
              <Button
                title="+ Register Vehicle"
                variant="primary"
                size="small"
                onPress={handleOpenVehicleModal}
                style={{ marginTop: spacing.md, backgroundColor: colors.primary[500] }}
              />
            </View>
          </Card>
        )}



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

      {/* Vehicle Info & Registration Modal */}
      <Modal
        visible={isVehicleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseVehicleModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={handleCloseVehicleModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.vehicleModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text variant="h2" bold>
                  {isVehicleRegistered ? 'Update Vehicle Details' : 'Register Vehicle'}
                </Text>
                <Text variant="caption" secondary style={{ marginTop: 2 }}>
                  Used for dispatch order assignment &amp; compliance
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={handleCloseVehicleModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.sm }}>
              {/* Driver Full Name */}
              <View>
                <Text variant="caption" secondary bold style={{ marginBottom: 4 }}>
                  DRIVER FULL NAME
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }]}>
                  <Ionicons name="person-outline" size={18} color={colors.primary[500]} style={{ marginRight: 8 }} />
                  <TextInput
                    value={editFullName}
                    onChangeText={setEditFullName}
                    placeholder="Enter your legal full name"
                    placeholderTextColor={theme.textTertiary}
                    style={[styles.modalTextInput, { color: theme.text }]}
                  />
                </View>
              </View>

              {/* Vehicle Type selector chips */}
              <View>
                <Text variant="caption" secondary bold style={{ marginBottom: 6 }}>
                  VEHICLE TYPE
                </Text>
                <View style={styles.vehicleTypeChips}>
                  {['Motorcycle', 'Tricycle / Keke', 'Car / Sedan', 'Van / Pickup'].map((type) => {
                    const isSelected = editVehicleType.toLowerCase().includes(type.split(' ')[0].toLowerCase());
                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setEditVehicleType(type)}
                        style={[
                          styles.typeChip,
                          {
                            backgroundColor: isSelected ? colors.primary[500] : (isDark ? colors.neutral[800] : colors.neutral[100]),
                            borderColor: isSelected ? colors.primary[500] : theme.border,
                          },
                        ]}
                      >
                        <Text variant="caption" bold color={isSelected ? '#FFFFFF' : theme.text}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* License Plate Number */}
              <View>
                <Text variant="caption" secondary bold style={{ marginBottom: 4 }}>
                  LICENSE PLATE NUMBER
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }]}>
                  <Ionicons name="card-outline" size={18} color={colors.primary[500]} style={{ marginRight: 8 }} />
                  <TextInput
                    value={editPlateNumber}
                    onChangeText={setEditPlateNumber}
                    placeholder="e.g. LT-8492-AB"
                    placeholderTextColor={theme.textTertiary}
                    autoCapitalize="characters"
                    style={[styles.modalTextInput, { color: theme.text }]}
                  />
                </View>
              </View>

              {/* Driver License Number */}
              <View>
                <Text variant="caption" secondary bold style={{ marginBottom: 4 }}>
                  DRIVER LICENSE NUMBER (CNI / PERMIS)
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }]}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primary[500]} style={{ marginRight: 8 }} />
                  <TextInput
                    value={editLicenseNumber}
                    onChangeText={setEditLicenseNumber}
                    placeholder="e.g. DL-2024-551"
                    placeholderTextColor={theme.textTertiary}
                    autoCapitalize="characters"
                    style={[styles.modalTextInput, { color: theme.text }]}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalActionButtonsRow, { marginTop: spacing.md }]}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleCloseVehicleModal}
                style={styles.modalBtnFlex}
              />
              <Button
                title="Save Vehicle"
                variant="primary"
                loading={isSavingVehicle}
                onPress={handleSaveVehicle}
                style={[styles.modalBtnFlex, { backgroundColor: colors.primary[500] }]}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          visible={!!toastMessage}
          onDismiss={() => setToastMessage(null)}
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
  vehicleSpecsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    rowGap: spacing.md,
  },
  specGridItem: {
    width: '50%',
    paddingRight: spacing.xs,
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
  emptyVehicleCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  vehicleModalCard: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    borderTopWidth: 1,
    padding: spacing.lg,
    maxHeight: '85%',
    ...shadows.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 14,
  },
  vehicleTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  typeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
});

