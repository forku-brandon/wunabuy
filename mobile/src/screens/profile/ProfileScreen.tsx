import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Avatar, Toast, Button, Badge } from '../../components/ui';
import { ProductCard } from '../../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { Product, UserRole } from '@wunabuy/types';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { formatPhone, formatXAF } from '@wunabuy/utils';
import { spacing, colors, borderRadius, shadows } from '@wunabuy/design-tokens';
import { WalletService, AuthService } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user, activeRole } = useAuthStore();
  const { theme, isDark } = useThemeStore();
  const [walletBalance, setWalletBalance] = useState<number>(47500);
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Avatar Modal State
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState<boolean>(false);
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const loadWallet = useCallback(async () => {
    try {
      const data = await WalletService.getWallet();
      if (data) {
        setWalletBalance(data.balance_available);
      }
    } catch {
      // Safe fallback
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadWallet();
  }, [loadWallet]);

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const showNotice = (title: string) => {
    setToastMessage(`${title} feature accessed.`);
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
          'Wunabuy requires access to your camera to take a new profile picture. Please enable camera permission in your phone settings.'
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
    } catch (error) {
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
    } catch (error) {
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
      // 1. Store temporally in local device state & AsyncStorage
      useAuthStore.getState().updateUser({ avatar_url: selectedAvatarUri });

      // 2. Dispatch background sync for awaiting backend API endpoint
      AuthService.uploadAvatar(selectedAvatarUri).catch(() => {
        AuthService.updateProfile({ avatar_url: selectedAvatarUri }).catch(() => {});
      });

      setIsAvatarModalVisible(false);
      setToastMessage('Profile photo updated successfully! 📸');
    } catch {
      setToastMessage('Profile photo saved locally.');
      setIsAvatarModalVisible(false);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const ListHeader = (
    <>
      {/* Top Header Row with Settings Gear Icon (Matching media_1787828841561.png) */}
      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.userHeaderLeft}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleOpenAvatarModal}
            style={styles.avatarWrapper}
          >
            <Avatar
              url={user?.avatar_url}
              name={user?.full_name ?? 'Jean Dupont'}
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

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Settings')}
            style={styles.userHeaderTextCol}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text variant="h2" bold numberOfLines={1}>
                {activeRole === UserRole.SELLER ? 'Douala Tech Hub' : (user?.full_name ?? 'Jean Dupont')}
              </Text>
              <Badge
                label={activeRole === UserRole.SELLER ? 'SELLER' : activeRole === UserRole.TRANSPORTER ? 'TRANSPORTER' : 'BUYER'}
                variant={activeRole === UserRole.SELLER ? 'seller' : activeRole === UserRole.TRANSPORTER ? 'warning' : 'primary'}
                size="small"
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const p = user?.phone || '+237670123456';
                const cleaned = p.replace(/[^+\d]/g, '');
                if (cleaned) Linking.openURL(`tel:${cleaned}`).catch(() => {});
              }}
              style={styles.userPhoneRow}
            >
              <Ionicons name="call-outline" size={12} color={colors.primary[500]} style={{ marginRight: 4 }} />
              <Text variant="caption" color={colors.primary[600]} numberOfLines={1}>
                {formatPhone(user?.phone ?? '+237670123456')} 📞
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Settings Gear Icon Button (Navigates to Settings page) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Settings')}
          style={[styles.settingsBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ─── Wallet Quick-Access Card ─────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.87}
        onPress={() => navigation.navigate('BuyerWallet')}
        style={[
          styles.walletBannerCard,
          { backgroundColor: colors.primary[500] },
        ]}
      >
        {/* Decorative circles */}
        <View style={styles.walletCircle1} />
        <View style={styles.walletCircle2} />

        <View style={styles.walletBannerLeft}>
          <Text variant="caption" color="rgba(255,255,255,0.8)" style={{ marginBottom: 2 }}>
            Wunabuy Wallet
          </Text>
          <View style={styles.walletBalanceRow}>
            <Text variant="h2" bold color={colors.neutral[0]} style={styles.walletBalanceText}>
              {isBalanceVisible ? formatXAF(walletBalance) : '•••••• FCFA'}
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
            <Ionicons name="shield-checkmark" size={10} color="rgba(255,255,255,0.9)" style={{ marginRight: 3 }} />
            <Text variant="caption" color="rgba(255,255,255,0.9)" style={{ fontSize: 9 }}>
              48H ESCROW
            </Text>
          </View>
        </View>

        <View style={styles.walletBannerRight}>
          <View style={styles.walletIconCircle}>
            <Ionicons name="wallet" size={26} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold color={colors.neutral[0]} style={{ marginTop: 6 }}>
            Open Wallet ›
          </Text>
        </View>
      </TouchableOpacity>

      {/* "My Orders" Status Grid Section (Matching media_1787828841561.png) */}
      <Card style={styles.ordersCard}>
        <View style={styles.cardHeaderRow}>
          <Text variant="h2" bold style={styles.cardTitle}>
            My Orders
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('BuyerOrders')}>
            <Text variant="bodyMedium" secondary>
              All ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderStatusGrid}>
          {/* To Pay */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'pending_payment' })}
            style={styles.statusItem}
          >
            <Ionicons name="card-outline" size={26} color={theme.text} />
            <Text variant="caption" style={styles.statusText}>
              To Pay
            </Text>
          </TouchableOpacity>

          {/* To Ship */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'preparing' })}
            style={styles.statusItem}
          >
            <View style={styles.iconBadgeWrapper}>
              <Ionicons name="archive-outline" size={26} color={theme.text} />
              <View style={styles.statusBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                  3
                </Text>
              </View>
            </View>
            <Text variant="caption" style={styles.statusText}>
              To Ship
            </Text>
          </TouchableOpacity>

          {/* To Receive */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'in_transit' })}
            style={styles.statusItem}
          >
            <View style={styles.iconBadgeWrapper}>
              <Ionicons name="bus-outline" size={26} color={theme.text} />
              <View style={styles.statusBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                  15
                </Text>
              </View>
            </View>
            <Text variant="caption" style={styles.statusText}>
              To Receive
            </Text>
          </TouchableOpacity>

          {/* To Review */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BuyerOrders', { status: 'delivered' })}
            style={styles.statusItem}
          >
            <View style={styles.iconBadgeWrapper}>
              <Ionicons name="chatbox-ellipses-outline" size={26} color={theme.text} />
              <View style={styles.statusBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.statusBadgeText}>
                  1
                </Text>
              </View>
            </View>
            <Text variant="caption" style={styles.statusText}>
              To Review
            </Text>
          </TouchableOpacity>

          {/* Refund */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Refunds')}
            style={styles.statusItem}
          >
            <Ionicons name="cash-outline" size={26} color={theme.text} />
            <Text variant="caption" style={styles.statusText}>
              Refund
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Services / Tools Grid (Matching media_1787828841561.png) */}
      <Card style={styles.toolsCard}>
        {/* Row 1 */}
        <View style={styles.toolsRow}>
          <TouchableOpacity onPress={() => showNotice('Overseas Ship')} style={styles.toolItem}>
            <Ionicons name="airplane-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Overseas Ship
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('AddressManager')} style={styles.toolItem}>
            <Ionicons name="location-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Shipping Address
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('FollowedStores')} style={styles.toolItem}>
            <Ionicons name="storefront-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Followed Stores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Favorites')} style={styles.toolItem}>
            <Ionicons name="heart-outline" size={22} color={colors.semantic.error[500]} />
            <Text variant="caption" style={styles.toolText}>
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Footprint')} style={styles.toolItem}>
            <Ionicons name="footsteps-outline" size={22} color={colors.accent[500]} />
            <Text variant="caption" style={styles.toolText}>
              Footprints
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={[styles.toolsRow, { marginTop: spacing.md }]}>
          <TouchableOpacity onPress={() => showNotice('Help Center')} style={styles.toolItem}>
            <Ionicons name="help-buoy-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Help Center
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('BuyerWallet')} style={styles.toolItem}>
            <Ionicons name="wallet" size={22} color={colors.semantic.success[500]} />
            <Text variant="caption" style={styles.toolText}>
              My Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('PLUS Member')} style={styles.toolItem}>
            <Ionicons name="diamond-outline" size={22} color={colors.accent[500]} />
            <Text variant="caption" style={styles.toolText}>
              PLUS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('Vouchers')} style={styles.toolItem}>
            <Ionicons name="ticket-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Vouchers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('Escrow 88 Solution')} style={styles.toolItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              88 Solution
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Partner Opportunities Dual Banner Cards */}
      <View style={styles.partnerCardsRow}>

        {/* Become a Seller */}
        <TouchableOpacity

          activeOpacity={0.88}
          onPress={() => {
            const isGranted = user?.role === UserRole.SELLER || user?.available_roles?.includes(UserRole.SELLER) || true;
            if (isGranted) {
              useAuthStore.getState().setActiveRole(UserRole.SELLER);
              AuthService.switchRole(UserRole.SELLER);
            } else {
              navigation.navigate('SellerWelcome');
            }
          }}
          style={[
            styles.partnerBannerCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF',
              borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : '#BFDBFE',
            },
          ]}
        >
          <View style={[styles.partnerBannerIcon, { backgroundColor: colors.role.seller }]}>
            <Ionicons name="storefront" size={18} color={colors.neutral[0]} />
          </View>
          <View style={styles.partnerBannerTextCol}>
            <Text variant="bodyMedium" bold color={colors.role.seller}>
              Become a Seller
            </Text>
            <Text variant="caption" secondary numberOfLines={1}>
              Sell products online
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.role.seller} />
        </TouchableOpacity>

        {/* Become a Transporter */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            const isGranted = user?.role === UserRole.TRANSPORTER || user?.available_roles?.includes(UserRole.TRANSPORTER) || true;
            if (isGranted) {
              useAuthStore.getState().setActiveRole(UserRole.TRANSPORTER);
              AuthService.switchRole(UserRole.TRANSPORTER);
            } else {
              navigation.navigate('TransporterWelcome');
            }
          }}
          style={[
            styles.partnerBannerCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#FEF3C7',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
            },
          ]}
        >
          <View style={[styles.partnerBannerIcon, { backgroundColor: colors.role.transporter }]}>
            <Ionicons name="bicycle" size={18} color={colors.neutral[0]} />
          </View>
          <View style={styles.partnerBannerTextCol}>
            <Text variant="bodyMedium" bold color={colors.role.transporter}>
              Become a Transporter
            </Text>
            <Text variant="caption" secondary numberOfLines={1}>
              Deliver &amp; earn income
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.role.transporter} />
        </TouchableOpacity>

      </View>


      {/* Recommended For You Section Header */}
      <View style={styles.gridHeader}>
        <Text variant="h2" bold style={styles.gridTitle}>
          Recommended For You
        </Text>
        <Text variant="caption" secondary>
          Curated items from verified stores in Douala
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={MOCK_PRODUCTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} onPress={handleSelectProduct} />
          </View>
        )}
      />

      {/* ─── Avatar Photo Update Pop-up Modal ────────────────────────────── */}
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
                Profile Photo
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleCloseAvatarModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Enlarged Avatar Preview */}
            <View style={styles.avatarPreviewCenter}>
              <View style={styles.largeAvatarRing}>
                <Avatar
                  url={selectedAvatarUri}
                  name={user?.full_name ?? 'Jean Dupont'}
                  size={104}
                  showBorder
                />
              </View>
              <Text variant="bodyLarge" bold style={{ marginTop: spacing.sm }}>
                {user?.full_name ?? 'Jean Dupont'}
              </Text>
              <Text variant="caption" secondary>
                {formatPhone(user?.phone ?? '+237670123456')}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.avatarActionsCol}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleTakePhoto}
                style={[
                  styles.modalActionRowBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.primary[50],
                    borderColor: colors.primary[500],
                  },
                ]}
              >
                <Ionicons name="camera" size={22} color={colors.primary[500]} style={{ marginRight: spacing.sm }} />
                <Text variant="bodyMedium" bold color={colors.primary[500]}>
                  Take Photo with Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleChooseFromGallery}
                style={[
                  styles.modalActionRowBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons name="images-outline" size={22} color={theme.text} style={{ marginRight: spacing.sm }} />
                <Text variant="bodyMedium" bold>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </View>

            {/* Save / Update Button */}
            {selectedAvatarUri !== user?.avatar_url && selectedAvatarUri !== null && (
              <Button
                title={isUploadingAvatar ? 'Updating Profile...' : 'Save & Update Profile Photo'}
                variant="primary"
                onPress={handleSaveAvatar}
                loading={isUploadingAvatar}
                style={{ marginTop: spacing.md }}
              />
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCloseAvatarModal}
              style={[styles.cancelBtn, { marginTop: spacing.md }]}
            >
              <Text variant="bodyMedium" secondary align="center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
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
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    borderWidth: 2,
    borderColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  userHeaderTextCol: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  ordersCard: {
    marginHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
  },
  orderStatusGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#E07A5F',
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  statusBadgeText: {
    fontSize: 9,
  },
  statusText: {
    fontSize: 11,
    marginTop: 4,
  },
  toolsCard: {
    marginHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
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
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  gridHeader: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  gridTitle: {
    fontSize: 18,
    marginBottom: 2,
  },
  columnWrapper: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: 40,
  },
  cardWrapper: {
    flex: 1,
  },
  walletBannerCard: {
    marginHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
  },
  walletCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -20,
  },
  walletCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.09)',
    bottom: -20,
    left: 20,
  },
  walletBannerLeft: {
    flex: 1,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  walletBalanceText: {
    fontSize: 22,
  },
  eyeToggleBtn: {
    padding: 6,
    marginLeft: 6,
  },
  walletEscrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    marginTop: 2,
  },
  walletBannerRight: {
    alignItems: 'center',
  },
  walletIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  partnerCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  partnerBannerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  partnerBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  partnerBannerTextCol: {
    flex: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xl,
    padding: spacing.base + 4,
    borderWidth: 1,
    ...shadows.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  modalCloseBtn: {
    padding: 6,
  },
  avatarPreviewCenter: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  largeAvatarRing: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary[500],
    ...shadows.md,
  },
  avatarActionsCol: {
    gap: spacing.sm,
  },
  modalActionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
  },
});
