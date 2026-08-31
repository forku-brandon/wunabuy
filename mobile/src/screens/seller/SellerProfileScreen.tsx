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
import { ProductCard } from '../../components/product/ProductCard';
import { Product, UserRole, KYCStatus } from '@wunabuy/types';
import { formatXAF, formatPhone } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { useSellerStore } from '../../stores/seller.store';
import { AuthService, SellerService, KYCService } from '../../services/api';

export const SellerProfileScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    storeName,
    availableBalance,
    escrowLockedBalance,
    orders,
    products,
    updateStock,
  } = useSellerStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const storeAccountNumber = '2 1 4 5 4 5 5 3 6';

  const pendingAcceptanceCount = orders.filter((o) => o.status === 'pending_acceptance').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyPickupCount = orders.filter((o) => o.status === 'ready_for_pickup').length;
  const inTransitCount = orders.filter((o) => o.status === 'in_transit').length;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleCopyAccount = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('AddEditProduct', { product });
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
          'Wunabuy requires camera access to update your store profile picture.'
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
      setToastMessage('Store photo updated successfully! 📸');
    } catch {
      setToastMessage('Store photo saved locally.');
      setIsAvatarModalVisible(false);
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* 1. Header Row: Store Profile & Settings Icon */}
        <View style={styles.headerRow}>
          <View style={styles.userHeaderLeft}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenAvatarModal}
              style={styles.avatarWrapper}
            >
              <Avatar
                url={user?.avatar_url}
                name={storeName || user?.full_name || 'My Store'}
                size={52}
                showBorder
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenAvatarModal}
                style={styles.avatarCameraBadge}
              >
                <Ionicons name="camera" size={10} color={colors.neutral[0]} />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} onPress={handleOpenAvatarModal} style={styles.userNameCol}>
              <View style={styles.userNameRow}>
                <Text variant="h2" bold numberOfLines={1} style={styles.userNameText}>
                  {storeName || user?.full_name || 'Douala Tech Hub'}
                </Text>
                <View style={[styles.kycVerifiedBadge, { backgroundColor: '#CCFBF1' }]}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.primary[600]} style={{ marginRight: 2 }} />
                  <Text variant="caption" bold color={colors.primary[600]} style={{ fontSize: 9 }}>
                    STORE
                  </Text>
                </View>
              </View>
              <Text variant="caption" secondary style={styles.userPhoneText}>
                {formatPhone(user?.phone ?? '+237670123456')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Settings Gear Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
            style={[styles.settingsBtn, { backgroundColor: theme.card }]}
          >
            <Ionicons name="settings-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* 2. Store Wallet Quick-Access Banner Card */}
        <TouchableOpacity
          activeOpacity={0.87}
          onPress={() => navigation.navigate('SellerWallet')}
          style={[styles.walletBannerCard, { backgroundColor: isDark ? '#064E3B' : '#0F766E' }]}
        >
          <View style={styles.walletCircle1} />
          <View style={styles.walletCircle2} />

          <View style={styles.walletBannerLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
                Store Available Balance
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCopyAccount();
                }}
                style={styles.copyIdPill}
              >
                <Text variant="caption" color="#FFFFFF" bold style={{ fontSize: 10 }}>
                  {storeAccountNumber}
                </Text>
                <Ionicons name="copy-outline" size={10} color="#FFFFFF" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.walletBalanceRow}>
              <Text variant="h1" bold color={colors.neutral[0]} style={styles.walletBalanceText}>
                {isBalanceVisible ? formatXAF(availableBalance) : '•••••• FCFA'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  setIsBalanceVisible(!isBalanceVisible);
                }}
                style={styles.eyeToggleBtn}
              >
                <Ionicons
                  name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="rgba(255,255,255,0.9)"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.walletEscrowBadge}>
              <Ionicons name="lock-closed" size={10} color="rgba(255,255,255,0.9)" style={{ marginRight: 3 }} />
              <Text variant="caption" color="rgba(255,255,255,0.9)" style={{ fontSize: 9 }}>
                {formatXAF(escrowLockedBalance)} LOCKED IN ESCROW
              </Text>
            </View>
          </View>

          <View style={styles.walletBannerRight}>
            <View style={styles.walletIconCircle}>
              <Ionicons name="wallet" size={24} color={colors.primary[600]} />
            </View>
            <Text variant="caption" bold color={colors.neutral[0]} style={{ marginTop: 6 }}>
              Payouts ›
            </Text>
          </View>
        </TouchableOpacity>

        {/* 3. Store Order Fulfillment Queue Grid */}
        <Card style={styles.ordersCard}>
          <View style={styles.cardHeaderRow}>
            <Text variant="h2" bold style={styles.cardTitle}>
              Store Fulfillment Queue
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SellerOrders')}>
              <Text variant="bodyMedium" secondary bold>
                All ({orders.length}) ›
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orderStatusGrid}>
            {/* New / Pending Acceptance */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SellerOrders')}
              style={styles.statusItem}
            >
              <View style={styles.iconBadgeWrapper}>
                <Ionicons name="alert-circle-outline" size={26} color={theme.text} />
                {pendingAcceptanceCount > 0 && (
                  <View style={styles.statusBadge}>
                    <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                      {pendingAcceptanceCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="caption" style={styles.statusText}>
                Accept
              </Text>
            </TouchableOpacity>

            {/* Preparing / Pack */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SellerOrders')}
              style={styles.statusItem}
            >
              <View style={styles.iconBadgeWrapper}>
                <Ionicons name="cube-outline" size={26} color={theme.text} />
                {preparingCount > 0 && (
                  <View style={styles.statusBadge}>
                    <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                      {preparingCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="caption" style={styles.statusText}>
                Pack
              </Text>
            </TouchableOpacity>

            {/* Ready for Pickup */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SellerOrders')}
              style={styles.statusItem}
            >
              <View style={styles.iconBadgeWrapper}>
                <Ionicons name="bicycle-outline" size={26} color={theme.text} />
                {readyPickupCount > 0 && (
                  <View style={styles.statusBadge}>
                    <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                      {readyPickupCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="caption" style={styles.statusText}>
                Handover
              </Text>
            </TouchableOpacity>

            {/* In Transit */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SellerOrders')}
              style={styles.statusItem}
            >
              <View style={styles.iconBadgeWrapper}>
                <Ionicons name="navigate-outline" size={26} color={theme.text} />
                {inTransitCount > 0 && (
                  <View style={styles.statusBadge}>
                    <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                      {inTransitCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="caption" style={styles.statusText}>
                En Route
              </Text>
            </TouchableOpacity>

            {/* Completed */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SellerOrders')}
              style={styles.statusItem}
            >
              <Ionicons name="checkmark-circle-outline" size={26} color={colors.semantic.success[500]} />
              <Text variant="caption" style={styles.statusText}>
                Settled
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 4. Merchant Management Tools & Services */}
        <Card style={styles.toolsCard}>
          <View style={styles.toolsRow}>
            <TouchableOpacity onPress={() => navigation.navigate('AddEditProduct')} style={styles.toolItem}>
              <Ionicons name="add-circle-outline" size={22} color={colors.primary[500]} />
              <Text variant="caption" style={styles.toolText}>
                Add Product
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SellerProducts')} style={styles.toolItem}>
              <Ionicons name="pricetags-outline" size={22} color={colors.primary[500]} />
              <Text variant="caption" style={styles.toolText}>
                Catalog ({products.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('StoreKYC')} style={styles.toolItem}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary[500]} />
              <Text variant="caption" style={styles.toolText}>
                Store KYC
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('AddressManager')} style={styles.toolItem}>
              <Ionicons name="location-outline" size={22} color={colors.primary[500]} />
              <Text variant="caption" style={styles.toolText}>
                GPS Hub
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('NotificationSettings')} style={styles.toolItem}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary[500]} />
              <Text variant="caption" style={styles.toolText}>
                Alerts
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 5. 1-Tap Switch to Buyer Workspace Banner Card */}
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

        {/* 6. My Active Listings Showcase Header */}
        <View style={styles.catalogSectionHeader}>
          <Text variant="h2" bold style={styles.sectionTitleText}>
            My Store Catalog
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SellerProducts')}>
            <Text variant="caption" bold color={colors.primary[500]}>
              Manage ({products.length}) ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products Grid */}
        <View style={styles.productGrid}>
          {products.slice(0, 4).map((product) => (
            <View key={product.id} style={styles.productCardCol}>
              <ProductCard product={product} onPress={handleSelectProduct} />
            </View>
          ))}
        </View>
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
                Store Photo
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleCloseAvatarModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarPreviewCenter}>
              <View style={styles.largeAvatarRing}>
                <Avatar
                  url={selectedAvatarUri}
                  name={storeName || user?.full_name || 'My Store'}
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
                <Ionicons name="camera-outline" size={22} color={colors.primary[500]} />
                <Text variant="bodyMedium" bold style={{ marginTop: 4 }}>
                  Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleChooseFromGallery}
                style={[styles.sourceActionBtn, { borderColor: theme.border, backgroundColor: theme.background }]}
              >
                <Ionicons name="images-outline" size={22} color={colors.primary[500]} />
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
                style={styles.modalBtnFlex}
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
    paddingBottom: spacing['3xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userNameCol: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: 18,
    lineHeight: 22,
    flexShrink: 1,
  },
  kycVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  userPhoneText: {
    fontSize: 12,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  walletBannerCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 110,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  walletCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -30,
    right: 40,
  },
  walletCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -20,
    left: 20,
  },
  walletBannerLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  copyIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: 2,
  },
  walletBalanceText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  eyeToggleBtn: {
    padding: 2,
  },
  walletEscrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  walletBannerRight: {
    alignItems: 'center',
  },
  walletIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  ordersCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
  },
  orderStatusGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    minWidth: 54,
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  statusBadgeText: {
    fontSize: 9,
  },
  statusText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  toolsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  toolsRow: {
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
    textAlign: 'center',
  },
  switchBuyerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  switchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  switchTextCol: {
    flex: 1,
  },
  switchBadgePill: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  catalogSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitleText: {
    fontSize: 18,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardCol: {
    width: '48.5%',
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  avatarModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.xl,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  modalCloseBtn: {
    padding: 4,
  },
  avatarPreviewCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  largeAvatarRing: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  avatarSourceActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sourceActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtnFlex: {
    flex: 1,
  },
});
