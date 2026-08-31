import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Badge, Avatar } from '../../components/ui';
import { KYCStatusBanner } from '../../components/seller/KYCStatusBanner';
import { SellerSalesTipsCarousel } from '../../components/seller/SellerSalesTipsCarousel';
import { SellerSidebarDrawer } from '../../components/navigation/SellerSidebarDrawer';
import { KYCStatus, UserRole, Product } from '@wunabuy/types';
import { formatXAF, formatRelativeTime } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useSellerStore } from '../../stores/seller.store';
import { useAuthStore } from '../../stores/auth.store';
import { SellerService, KYCService, AuthService } from '../../services/api';

export const SellerDashboardScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const {
    storeName,
    availableBalance,
    escrowLockedBalance,
    orders,
    products,
    updateStock,
  } = useSellerStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Hidden by default (null); only displays when staff explicitly approves verification
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isKycApprovedNoticeDismissed, setIsKycApprovedNoticeDismissed] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Expandable Product Quick-View Modal State
  const [selectedProductForExpand, setSelectedProductForExpand] = useState<Product | null>(null);
  const [isExpandModalVisible, setIsExpandModalVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleOpenExpandProduct = (product: Product) => {
    setSelectedProductForExpand(product);
    setActiveImageIndex(0);
    setIsExpandModalVisible(true);
  };

  const handleCloseExpandProduct = () => {
    setIsExpandModalVisible(false);
    setSelectedProductForExpand(null);
  };

  // Mock Store/Account identifier formatted with spacing as in reference design
  const storeAccountNumber = '2 1 4 5 4 5 5 3 6';

  const loadDashboardData = useCallback(async () => {
    try {
      const [kycData] = await Promise.all([
        KYCService.getStoreKYCStatus(),
        SellerService.getStoreDashboard(),
      ]);

      if (kycData?.status) {
        setKycStatus(kycData.status as any);
      }
    } catch {
      // Handled gracefully with offline fallback - keeps hidden
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartKYC = () => {
    navigation.navigate('StoreKYC');
  };

  const handleCopyAccount = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const pendingAcceptanceCount = orders.filter((o) => o.status === 'pending_acceptance').length;

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary[500]}
          colors={[colors.primary[500]]}
        />
      }
    >
      {/* 1. Top Header AppBar: Three Strokes Hamburger Menu on Left, Action Icons on Same Line at Top */}
      <View style={styles.topHeaderRow}>
        {/* Left: Square Soft-Shadow 3-Strokes Hamburger Menu Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.squareMenuBtn,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0],
              borderColor: theme.border,
            },
          ]}
          onPress={() => setIsDrawerOpen(true)}
        >
          <Ionicons name="menu-outline" size={22} color={theme.text} />
        </TouchableOpacity>

        {/* Right Action Icons: Notification Bell + QR Scan + Shopping Cart (All on Same Line) */}
        <View style={styles.headerRightActionIcons}>
          {/* Notification Bell Action */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            onPress={() => navigation.navigate('SellerOrders')}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={theme.text}
            />
            {pendingAcceptanceCount > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>

          {/* QR Code / Scan Action */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            onPress={() => {
              Alert.alert('Store QR Scanner', 'Scan customer or transporter fulfillment QR codes.');
            }}
          >
            <Ionicons
              name="scan-outline"
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>

          {/* 1-Tap Buyer Mode Switcher (Icon Only) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              useAuthStore.getState().setActiveRole(UserRole.BUYER);
              AuthService.switchRole(UserRole.BUYER);
            }}
            style={[
              styles.iconButton,
              {
                backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50],
                borderColor: isDark ? 'rgba(13,148,136,0.35)' : colors.primary[200],
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons name="cart-outline" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtitle Stack (Underneath App Bar) */}
      <View style={styles.greetingSection}>
        <Text variant="caption" color={colors.primary[500]} bold style={styles.greetingEyebrow}>
          MERCHANT DASHBOARD
        </Text>
        <Text variant="h1" bold style={styles.greetingTitle}>
          {storeName || 'Douala Tech Hub'}
        </Text>
        <Text variant="caption" secondary style={styles.greetingSubtitle}>
          Real-time order fulfillment &amp; 48-hour escrow protection in Douala
        </Text>
      </View>

      {/* KYC Status Verification: Hidden by default (null); only displays when staff has APPROVED verification */}
      {kycStatus === KYCStatus.APPROVED && !isKycApprovedNoticeDismissed && (
        <View
          style={[
            styles.kycApprovedBanner,
            {
              backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0',
            },
          ]}
        >
          <View style={styles.kycApprovedLeft}>
            <View style={styles.kycVerifiedIconCircle}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" bold color="#10B981" style={{ letterSpacing: 0.5 }}>
                STORE VERIFIED BY STAFF
              </Text>
              <Text variant="caption" secondary numberOfLines={1} style={{ marginTop: 1 }}>
                Verification approved • 48H Escrow &amp; MoMo Payouts active
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsKycApprovedNoticeDismissed(true)}
            style={styles.kycDismissBtn}
          >
            <Ionicons name="close" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}




      {/* 2. Main Feature Hero Balance Card (Emerald Teal Gradient with Image overlay & ID copy) */}
      <View
        style={[
          styles.heroBalanceCard,
          {
            backgroundColor: isDark ? '#064E3B' : '#0F766E',
          },
        ]}
      >
        {/* Background Decorative Curves & Stylized Silhouette */}
        <View style={styles.cardBgGlow} />
        <View style={styles.cardDecorativeCircle} />

        {/* Top Row: Store Account ID + Copy Icon + Top-Right Floating Fast Action Arrow */}
        <View style={styles.heroCardTopRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCopyAccount}
            style={styles.accountIdPill}
          >
            <Text variant="caption" color="rgba(255,255,255,0.95)" bold style={styles.accountIdText}>
              {storeAccountNumber}
            </Text>
            <Ionicons
              name="copy-outline"
              size={13}
              color="rgba(255,255,255,0.9)"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SellerWallet')}
            style={styles.floatingActionArrowBtn}
          >
            <Ionicons name="arrow-up-outline" size={18} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Copy Feedback Toast */}
        {copiedNotification && (
          <View style={styles.copiedPill}>
            <Text variant="caption" color="#10B981" bold>
              ✓ Store Account Number Copied!
            </Text>
          </View>
        )}

        {/* Middle: Account Label + Privacy Eye Toggle */}
        <View style={styles.heroCardLabelRow}>
          <Text variant="caption" color="rgba(255,255,255,0.85)" bold>
            Store Account
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            style={styles.eyeToggleBtn}
          >
            <Ionicons
              name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={16}
              color="rgba(255,255,255,0.85)"
            />
          </TouchableOpacity>
        </View>

        {/* Main Large Balance Display */}
        <View style={styles.heroBalanceAmountRow}>
          <Text variant="bodyLarge" color="rgba(255,255,255,0.9)" bold style={styles.currencyPrefix}>
            XAF
          </Text>
          <Text variant="display" bold color="#FFFFFF" style={styles.balanceMainText}>
            {isBalanceVisible
              ? availableBalance.toLocaleString('fr-FR')
              : '••••••••'}
          </Text>
        </View>

        {/* Bottom Escrow / Protection Badge */}
        <View style={styles.escrowSubBadgeRow}>
          <View style={styles.escrowPill}>
            <Text variant="caption" color="#FDE68A" bold>
              🔒 {formatXAF(escrowLockedBalance)} in Escrow (48H Protected)
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Top Services Grid (4-Column x 2-Row Icon Tiles) */}
      <View style={styles.sectionHeaderRow}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          Top services
        </Text>
      </View>

      <View style={styles.servicesGrid}>
        {/* 1. Send Money / Payout */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerWallet')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="arrow-up-circle-outline" size={26} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Send money
          </Text>
        </TouchableOpacity>

        {/* 2. Add Product */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('AddEditProduct')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="cube-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            + Product
          </Text>
        </TouchableOpacity>

        {/* 3. Orders Queue */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerOrders')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="receipt-outline" size={24} color={colors.primary[500]} />
            {pendingAcceptanceCount > 0 && (
              <View style={styles.tileBadgeCount}>
                <Text variant="caption" color="#FFFFFF" bold style={{ fontSize: 9 }}>
                  {pendingAcceptanceCount}
                </Text>
              </View>
            )}
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Orders ({orders.length})
          </Text>
        </TouchableOpacity>

        {/* 4. Stock & Catalog */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerProducts')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="pricetags-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Inventory
          </Text>
        </TouchableOpacity>

        {/* 5. Live Dispatch */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('SellerOrders')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="bicycle-outline" size={25} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Dispatch
          </Text>
        </TouchableOpacity>

        {/* 6. Store KYC */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('StoreKYC')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Store KYC
          </Text>
        </TouchableOpacity>

        {/* 7. Store Profile */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="storefront-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            Settings
          </Text>
        </TouchableOpacity>

        {/* 8. More Options */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.serviceItemWrapper}
          onPress={() => {
            Alert.alert('Store Tools', 'Quick access to analytics, marketing campaigns, and customer messaging.');
          }}
        >
          <View style={[styles.serviceIconTile, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}>
            <Ionicons name="grid-outline" size={24} color={colors.primary[500]} />
          </View>
          <Text variant="caption" bold numberOfLines={1} style={styles.serviceLabel}>
            More
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Sales Tips & Merchant Growth Auto Slideshow Presenter */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithBadge}>
          <Text variant="h3" bold style={styles.sectionTitle}>
            Sales Tips &amp; Growth
          </Text>
          <View style={[styles.tipsPillBadge, { backgroundColor: isDark ? 'rgba(245,158,11,0.18)' : '#FEF3C7' }]}>
            <Ionicons name="bulb-outline" size={12} color={colors.accent[500]} style={{ marginRight: 3 }} />
            <Text variant="caption" bold color={colors.accent[500]} style={{ fontSize: 10 }}>
              BEST PRACTICES
            </Text>
          </View>
        </View>
      </View>

      <SellerSalesTipsCarousel
        onPressTip={(tip) => {
          if (tip.actionScreen) {
            navigation.navigate(tip.actionScreen);
          }
        }}
      />



      {/* 5. My Store Products Catalog Section (Replaces Transactions) */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithBadge}>
          <Text variant="h3" bold style={styles.sectionTitle}>
            My Store Products
          </Text>
          <View style={[styles.productCountPill, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50] }]}>
            <Text variant="caption" bold color={colors.primary[600]}>
              {products.length} Items
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SellerProducts')}
        >
          <Text variant="caption" bold color={colors.primary[500]}>
            See all ›
          </Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <Card style={styles.emptyProductsCard}>
          <Ionicons name="cube-outline" size={40} color={theme.textSecondary} />
          <Text variant="bodyLarge" bold style={{ marginTop: spacing.xs }}>
            No products listed yet
          </Text>
          <Text variant="caption" secondary style={{ textAlign: 'center', marginTop: 4, marginBottom: spacing.md }}>
            Start selling by adding your first product catalog listing.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddEditProduct')}
            style={[styles.addFirstProductBtn, { backgroundColor: colors.primary[500] }]}
          >
            <Text variant="bodyMedium" bold color="#FFFFFF">
              + Add First Product
            </Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <View style={styles.productsList}>
          {products.slice(0, 4).map((product) => {
            const isLowStock = product.quantity > 0 && product.quantity <= 5;
            const isOutOfStock = product.quantity === 0;
            const mainImg = product.images && product.images.length > 0 ? product.images[0] : null;

            return (
              <Card key={product.id} style={styles.productDashboardCard}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleOpenExpandProduct(product)}
                  style={styles.productCardInnerRow}
                >
                  {/* Product Thumbnail with Stock Badge */}
                  <View style={styles.productImageWrapper}>
                    {mainImg ? (
                      <Image
                        source={{ uri: mainImg }}
                        style={styles.productThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productPlaceholder, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}>
                        <Ionicons name="image-outline" size={24} color={theme.textSecondary} />
                      </View>
                    )}

                    {/* Stock status badge overlay */}
                    {isOutOfStock ? (
                      <View style={[styles.productImageBadge, { backgroundColor: '#EF4444' }]}>
                        <Text variant="caption" color="#FFFFFF" bold style={{ fontSize: 9 }}>
                          Out
                        </Text>
                      </View>
                    ) : isLowStock ? (
                      <View style={[styles.productImageBadge, { backgroundColor: '#F59E0B' }]}>
                        <Text variant="caption" color="#FFFFFF" bold style={{ fontSize: 9 }}>
                          Low
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Product Details Info Stack */}
                  <View style={styles.productInfoStack}>
                    <Text variant="bodyLarge" bold numberOfLines={1} style={styles.productTitle}>
                      {product.name}
                    </Text>

                    <View style={styles.productCategoryTierRow}>
                      <Text variant="caption" secondary numberOfLines={1}>
                        {product.category} • <Text variant="caption" bold color={colors.primary[600]}>{product.quality_tier.toUpperCase()}</Text>
                      </Text>
                    </View>

                    <View style={styles.priceAndStockRow}>
                      <Text variant="bodyLarge" bold color={colors.primary[500]}>
                        {formatXAF(product.price)}
                      </Text>

                      {/* Stock counter & Quick Steppers */}
                      <View style={styles.stockStepperContainer}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            updateStock(product.id, -1);
                          }}
                          style={[styles.stepperMiniBtn, { borderColor: theme.border }]}
                        >
                          <Ionicons name="remove" size={12} color={theme.text} />
                        </TouchableOpacity>

                        <Text variant="caption" bold style={styles.stockNumberText}>
                          {product.quantity}
                        </Text>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            updateStock(product.id, 1);
                          }}
                          style={[styles.stepperMiniBtn, { borderColor: theme.border }]}
                        >
                          <Ionicons name="add" size={12} color={theme.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Right: Circular (+) Expand Trigger Button */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleOpenExpandProduct(product);
                    }}
                    style={[
                      styles.expandPlusButton,
                      {
                        backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50],
                        borderColor: isDark ? 'rgba(13,148,136,0.35)' : colors.primary[200],
                      },
                    ]}
                  >
                    <Ionicons name="add" size={20} color={colors.primary[500]} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>
      )}

      {/* Interactive Expanded Product Quick-View Modal */}
      {selectedProductForExpand && (
        <Modal
          visible={isExpandModalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseExpandProduct}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.expandedModalSheet,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Modal Drag Handle & Header */}
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalHeaderTitleStack}>
                  <Text variant="caption" bold color={colors.primary[500]}>
                    QUICK OVERVIEW & STOCK
                  </Text>
                  <Text variant="h3" bold numberOfLines={1} style={{ maxWidth: 260 }}>
                    {selectedProductForExpand.name}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCloseExpandProduct}
                  style={[styles.modalCloseBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                >
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.expandedModalScrollContent}
              >
                {/* Horizontal Swipeable Multi-Image Gallery */}
                <View style={styles.modalGalleryContainer}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / 280);
                      setActiveImageIndex(idx);
                    }}
                    style={styles.modalGalleryScrollView}
                  >
                    {(selectedProductForExpand.images?.length > 0
                      ? selectedProductForExpand.images
                      : ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800']
                    ).map((imgUrl, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: imgUrl }}
                        style={styles.modalGalleryImage}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>

                  {/* Image Counter Badge */}
                  <View style={styles.modalImageCounterBadge}>
                    <Text variant="caption" color="#FFFFFF" bold style={{ fontSize: 10 }}>
                      {activeImageIndex + 1} / {Math.max(1, selectedProductForExpand.images?.length || 1)}
                    </Text>
                  </View>
                </View>

                {/* Price, Tier, & Category */}
                <View style={styles.modalPriceSection}>
                  <View>
                    <Text variant="caption" secondary bold>
                      LISTING PRICE
                    </Text>
                    <Text variant="h1" bold color={colors.primary[500]}>
                      {formatXAF(selectedProductForExpand.price)}
                    </Text>
                  </View>

                  <View style={styles.modalTierPillsStack}>
                    <Badge
                      label={selectedProductForExpand.quality_tier.toUpperCase()}
                      variant="primary"
                      size="small"
                    />
                    <Badge
                      label={selectedProductForExpand.is_active ? 'ACTIVE' : 'PAUSED'}
                      variant={selectedProductForExpand.is_active ? 'success' : 'neutral'}
                      size="small"
                    />
                  </View>
                </View>

                {/* Live Stock Level Adjuster */}
                <Card style={styles.modalStockAdjustCard}>
                  <View style={styles.modalStockRow}>
                    <View>
                      <Text variant="bodyLarge" bold>
                        Inventory Quantity
                      </Text>
                      <Text variant="caption" secondary>
                        {selectedProductForExpand.quantity > 0
                          ? `${selectedProductForExpand.quantity} units available in store`
                          : 'Currently Out of Stock'}
                      </Text>
                    </View>

                    <View style={styles.modalStepperRow}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => updateStock(selectedProductForExpand.id, -1)}
                        style={[styles.modalStepperButton, { borderColor: theme.border }]}
                      >
                        <Ionicons name="remove" size={18} color={theme.text} />
                      </TouchableOpacity>

                      <Text variant="h2" bold style={styles.modalStockValueText}>
                        {selectedProductForExpand.quantity}
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => updateStock(selectedProductForExpand.id, 1)}
                        style={[styles.modalStepperButton, { borderColor: theme.border }]}
                      >
                        <Ionicons name="add" size={18} color={theme.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>

                {/* Product Description */}
                <View style={styles.modalDescriptionSection}>
                  <Text variant="bodyLarge" bold style={{ marginBottom: 4 }}>
                    Product Description
                  </Text>
                  <Text variant="bodyMedium" secondary style={{ lineHeight: 20 }}>
                    {selectedProductForExpand.description || 'No description provided for this listing.'}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActionButtonsStack}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      handleCloseExpandProduct();
                      navigation.navigate('AddEditProduct', { product: selectedProductForExpand });
                    }}
                    style={[styles.modalEditBtn, { backgroundColor: colors.primary[500] }]}
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text variant="bodyLarge" bold color="#FFFFFF">
                      Edit Listing Details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      handleCloseExpandProduct();
                      navigation.navigate('SellerProducts');
                    }}
                    style={[styles.modalFullCatalogBtn, { borderColor: theme.border }]}
                  >
                    <Ionicons name="pricetags-outline" size={16} color={theme.text} style={{ marginRight: 6 }} />
                    <Text variant="bodyMedium" bold color={theme.text}>
                      Manage in Full Catalog
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Seller Sidebar Navigation Drawer */}
      <SellerSidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
      />
    </ScreenContainer>
  );
};


const styles = StyleSheet.create({
  // 1. Top Header
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  squareMenuBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerRightActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  greetingSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  greetingEyebrow: {
    fontSize: 10,
    letterSpacing: 0.8,
    lineHeight: 12,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  greetingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  kycApprovedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  kycApprovedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  kycVerifiedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  kycDismissBtn: {
    padding: 4,
  },




  // 2. Hero Balance Card
  heroBalanceCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardBgGlow: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardDecorativeCircle: {
    position: 'absolute',
    bottom: -60,
    left: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  accountIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  accountIdText: {
    letterSpacing: 2,
    fontSize: 13,
  },
  floatingActionArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  heroCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  eyeToggleBtn: {
    padding: 2,
  },
  heroBalanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  currencyPrefix: {
    fontSize: 16,
    marginRight: 6,
    opacity: 0.9,
  },
  balanceMainText: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  escrowSubBadgeRow: {
    marginTop: spacing.xs,
  },
  escrowPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },

  // 3. Top Services Grid
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginBottom: spacing.xl,
  },
  serviceItemWrapper: {
    width: '22.5%',
    alignItems: 'center',
  },
  serviceIconTile: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    position: 'relative',
  },
  tileBadgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
  },

  // 4. Sales Tips & Merchant Growth Styles
  tipsPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },


  // 5. My Store Products List & Expanded Modal Styles
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  productCountPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  emptyProductsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  addFirstProductBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
  productsList: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  productDashboardCard: {
    padding: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  productCardInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  productThumbnail: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImageBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  productInfoStack: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.xs,
  },
  productTitle: {
    fontSize: 15,
    lineHeight: 18,
  },
  productCategoryTierRow: {
    marginVertical: 2,
  },
  priceAndStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stockStepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperMiniBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockNumberText: {
    fontSize: 12,
    minWidth: 16,
    textAlign: 'center',
  },
  expandPlusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  expandedModalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '85%',
    paddingTop: spacing.base,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.xl,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
    marginBottom: spacing.md,
  },
  modalHeaderTitleStack: {
    flex: 1,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedModalScrollContent: {
    paddingBottom: spacing.xl,
  },
  modalGalleryContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: '#000000',
  },
  modalGalleryScrollView: {
    width: '100%',
    height: '100%',
  },
  modalGalleryImage: {
    width: 320,
    height: 200,
  },
  modalImageCounterBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  modalPriceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTierPillsStack: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modalStockAdjustCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  modalStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalStepperButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStockValueText: {
    minWidth: 28,
    textAlign: 'center',
  },
  modalDescriptionSection: {
    marginBottom: spacing.lg,
  },
  modalActionButtonsStack: {
    gap: spacing.sm,
  },
  modalEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  modalFullCatalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
});


