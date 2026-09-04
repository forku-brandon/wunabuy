import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { TransporterSidebarDrawer } from '../../components/navigation/TransporterSidebarDrawer';
import { LiveTrackingMap } from '../../components/order/LiveTrackingMap';

import { DeliveryJob, UserRole } from '@wunabuy/types';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { AuthService, TransporterService } from '../../services/api';



const MOCK_DELIVERY_JOBS: DeliveryJob[] = [
  {
    id: 'job_1',
    order_id: 'ord_101',
    order_code: 'WB-2026-9842',
    store: {
      id: 'store_101',
      store_name: 'Douala Tech Hub (Akwa)',
      rating_avg: 4.9,
      is_verified: true,
    },
    pickup_address: {
      id: 'p_1',
      label: 'Store Pickup',
      latitude: 4.0510,
      longitude: 9.7678,
      address_text: 'Rue Joss, Akwa',
      city: 'Douala',
      is_default: false,
    },
    delivery_address: {
      id: 'd_1',
      label: 'Buyer Home',
      latitude: 4.0611,
      longitude: 9.7863,
      address_text: 'Boulevard de la Liberté, Bonanjo',
      city: 'Douala',
      is_default: true,
    },
    items_summary: '1x Samsung Galaxy A54 5G (Package size: Small)',
    delivery_fee: 1500,
    currency: 'XAF',
    distance_km: 2.4,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'job_2',
    order_id: 'ord_102',
    order_code: 'WB-2026-5511',
    store: {
      id: 'store_103',
      store_name: 'Heritage African Couture',
      rating_avg: 5.0,
      is_verified: true,
    },
    pickup_address: {
      id: 'p_2',
      label: 'Store Pickup',
      latitude: 4.0480,
      longitude: 9.7610,
      address_text: 'Marché Central, Douala',
      city: 'Douala',
      is_default: false,
    },
    delivery_address: {
      id: 'd_2',
      label: 'Buyer Office',
      latitude: 4.0520,
      longitude: 9.7680,
      address_text: 'Rue Prince Bell, Bali',
      city: 'Douala',
      is_default: true,
    },
    items_summary: '2x Traditional Embroidered Toghu Garments',
    delivery_fee: 2500,
    currency: 'XAF',
    distance_km: 1.8,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'job_3',
    order_id: 'ord_103',
    order_code: 'WB-2026-3390',
    store: {
      id: 'store_104',
      store_name: 'Kribi Fresh Organic Produce',
      rating_avg: 4.8,
      is_verified: true,
    },
    pickup_address: {
      id: 'p_3',
      label: 'Store Pickup',
      latitude: 4.0530,
      longitude: 9.7710,
      address_text: 'Avenue King Akwa, Douala',
      city: 'Douala',
      is_default: false,
    },
    delivery_address: {
      id: 'd_3',
      label: 'Buyer Residence',
      latitude: 4.0680,
      longitude: 9.7920,
      address_text: 'Camp Yabassi, Douala',
      city: 'Douala',
      is_default: true,
    },
    items_summary: '1x Organic Fruit Basket & Fresh Juice Crate',
    delivery_fee: 1800,
    currency: 'XAF',
    distance_km: 3.5,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export const TransporterJobsScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<DeliveryJob[]>(MOCK_DELIVERY_JOBS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMapJob, setSelectedMapJob] = useState<DeliveryJob | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      const data = await TransporterService.getAvailableJobs(activeFilter);
      setJobs(data);
    } catch {
      setJobs(MOCK_DELIVERY_JOBS);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }, [loadJobs]);

  const handleSwitchToBuyer = () => {
    useAuthStore.getState().setActiveRole(UserRole.BUYER);
    AuthService.switchRole(UserRole.BUYER);
  };

  const handleAcceptJob = async (job: DeliveryJob) => {
    setSelectedMapJob(null);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    setToastMessage(`Job #${job.order_code} accepted! Navigating to active trip.`);
    await TransporterService.acceptJob(job.id);
    setTimeout(() => {
      navigation.navigate('TransporterActiveTrip', { jobId: job.id, stage: 1 });
    }, 600);
  };

  const handleRejectJob = async (job: DeliveryJob) => {
    setSelectedMapJob(null);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    setToastMessage(`Offer #${job.order_code} rejected. Surface next available job offer.`);
    await TransporterService.rejectJob(job.id);
  };


  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'package' | 'permit' | 'merchant'>('package');
  const [isScanningProcess, setIsScanningProcess] = useState(false);

  const handleSimulateScan = () => {
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || isScanningProcess) return;
    setScanned(true);
    setIsScanningProcess(true);

    setTimeout(() => {
      setIsScanningProcess(false);
      setIsScannerOpen(false);

      if (scannerMode === 'package') {
        setToastMessage('📦 Package QR Code #WB-2026-9842 verified! Syncing account status.');
        setToastMessage(`⚡ Live Package QR #${data} verified! Waybill synced with active trip.`);
      } else if (scannerMode === 'permit') {
        setToastMessage('💳 Douala Council Fleet Permit scanned & account status updated!');
        setToastMessage(`⚡ Live Driver Permit #${data} scanned! Douala fleet verification active.`);
      } else {
        setToastMessage('🏪 Merchant Store QR scanned! Checked in at Douala Tech Hub.');
        setToastMessage(`⚡ Live Store QR #${data} scanned! Checked in at merchant counter.`);
      }
    }, 1200);
    }, 600);
  };

  const handleSimulateScan = (presetCode?: string) => {
    setScanned(true);
    setIsScanningProcess(true);
    const code = presetCode || (scannerMode === 'package' ? 'WB-2026-9842' : scannerMode === 'permit' ? 'DLA-2026-88' : 'STORE-101');
    setTimeout(() => {
      setIsScanningProcess(false);
      setIsScannerOpen(false);

      if (scannerMode === 'package') {
        setToastMessage(`📦 Package QR #${code} scanned! Waybill verified & synced.`);
      } else if (scannerMode === 'permit') {
        setToastMessage(`💳 Driver Permit #${code} scanned! Douala fleet verification active.`);
      } else {
        setToastMessage(`🏪 Store QR #${code} scanned! Store check-in timestamp recorded.`);
      }
    }, 600);
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === 'near') return (job.distance_km ?? 0) <= 2.0;
    if (activeFilter === 'high_pay') return job.delivery_fee >= 2000;
    return true;
  });

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header AppBar */}
      <View style={[styles.headerContainer, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.topHeaderRow}>
          {/* Left: 3-Strokes Hamburger Drawer Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsDrawerOpen(true)}
            style={[styles.squareMenuBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[0], borderColor: theme.border }]}
          >
            <Ionicons name="menu" size={24} color={theme.text} />
          </TouchableOpacity>

          {/* Right Action Icons: Scanner, Notification, Buyer Mode */}
          <View style={styles.headerRightActionIcons}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsScannerOpen(true)}
              style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : colors.primary[50], borderColor: colors.primary[200], borderWidth: 1 }]}
            >
              <Ionicons name="qr-code-outline" size={20} color={colors.primary[600]} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('NotificationSettings')}
              style={[styles.iconButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSwitchToBuyer}
              style={[styles.iconButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            >
              <Ionicons name="cart-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>


        {/* Subtitle Stack */}
        <View style={styles.subtitleStack}>
          <Text variant="caption" bold color={colors.primary[600]}>
            FLEET DISPATCH • DOUALA SECTOR
          </Text>
          <Text variant="h1" bold style={styles.screenTitleText}>
            Available Delivery Jobs
          </Text>
        </View>

        {/* Filter Chips Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('all')}
            style={[
              styles.chipItem,
              activeFilter === 'all'
                ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
            ]}
          >
            <Text variant="caption" bold color={activeFilter === 'all' ? '#FFFFFF' : theme.text}>
              All Offers ({jobs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('near')}
            style={[
              styles.chipItem,
              activeFilter === 'near'
                ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
            ]}
          >
            <Text variant="caption" bold color={activeFilter === 'near' ? '#FFFFFF' : theme.text}>
              &lt; 2km Nearby 📍
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilter('high_pay')}
            style={[
              styles.chipItem,
              activeFilter === 'high_pay'
                ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
            ]}
          >
            <Text variant="caption" bold color={activeFilter === 'high_pay' ? '#FFFFFF' : theme.text}>
              High Pay 💰
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Jobs Feed */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="bodyLarge" bold color={colors.primary[500]}>
                  {item.order_code}
                </Text>
                <Badge label="EXPRESS" variant="primary" size="small" />
              </View>
              <Badge label={`${formatDistance(item.distance_km)} AWAY`} variant="info" size="small" />
            </View>

            {/* Detailed Route Timeline Address Card */}
            <View style={[styles.routeTimelineCard, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: theme.border }]}>
              {/* Pickup Address */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineIconCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="storefront" size={12} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text variant="caption" bold color="#059669">
                      1. STORE PICKUP LOCATION
                    </Text>
                    <Badge label="MERCHANT" variant="primary" size="small" />
                  </View>
                  <Text variant="bodyLarge" bold style={{ marginTop: 2 }}>
                    {item.store.store_name}
                  </Text>
                  <Text variant="bodyMedium" color={theme.textSecondary} style={{ marginTop: 1, lineHeight: 18 }}>
                    📍 {item.pickup_address.address_text}, {item.pickup_address.city}
                  </Text>
                </View>
              </View>

              {/* Drop-off Address */}
              <View style={[styles.timelineRow, { marginTop: spacing.xs + 2 }]}>
                <View style={styles.timelineIconCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]}>
                    <Ionicons name="location" size={12} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text variant="caption" bold color="#DC2626">
                      2. BUYER DELIVERY DESTINATION
                    </Text>
                    <Badge label="DOORSTEP" variant="info" size="small" />
                  </View>
                  <Text variant="bodyLarge" bold style={{ marginTop: 2 }}>
                    {item.delivery_address.address_text}
                  </Text>
                  <Text variant="bodyMedium" color={theme.textSecondary} style={{ marginTop: 1, lineHeight: 18 }}>
                    📍 {item.delivery_address.city} • Contact Buyer on Arrival
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.summaryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Text variant="caption" secondary style={styles.summaryText}>
                📦 {item.items_summary}
              </Text>
            </View>

            {/* Grid-Safe Driver Payout Banner */}
            <View style={[styles.payoutHighlightBanner, { backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#F0FDFA', borderColor: colors.primary[300] }]}>
              <View style={styles.payoutLabelBox}>
                <Ionicons name="cash" size={18} color={colors.primary[600]} />
                <Text variant="caption" bold color={colors.primary[700]} style={{ marginLeft: 4 }}>
                  DRIVER PAYOUT
                </Text>
              </View>
              <View style={styles.payoutAmountBadge}>
                <Text variant="bodyLarge" bold color={colors.primary[600]}>
                  {formatXAF(item.delivery_fee)}
                </Text>
              </View>
            </View>

            {/* Map Route Trigger Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedMapJob(item)}
              style={[styles.mapRouteBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50], borderColor: colors.primary[200] }]}
            >
              <Ionicons name="map-outline" size={16} color={colors.primary[600]} />
              <Text variant="caption" bold color={colors.primary[600]}>
                Inspect GPS Map &amp; Shortest Route 🗺️
              </Text>
            </TouchableOpacity>

            {/* Action Buttons Row */}
            <View style={styles.cardActionGroup}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleRejectJob(item)}
                style={[styles.rejectBtn, { borderColor: theme.border }]}
              >
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text variant="caption" bold color="#EF4444">
                  Pass Job
                </Text>
              </TouchableOpacity>

              <Button
                title="Accept Job ➔"
                variant="primary"
                size="medium"
                fullWidth={false}
                onPress={() => handleAcceptJob(item)}
                style={styles.acceptBtn}
              />
            </View>
          </Card>
        )}
      />

      {/* Google Map GPS Route Modal */}
      <Modal
        visible={!!selectedMapJob}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedMapJob(null)}
      >
        {selectedMapJob && (
          <View style={[styles.mapModalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.mapModalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedMapJob(null)} style={styles.closeMapBtn}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                <Text variant="caption" bold color={colors.primary[600]}>
                  GPS ROUTE MAP • {selectedMapJob.order_code}
                </Text>
                <Text variant="h2" bold numberOfLines={1}>
                  Shortest Dispatch Route
                </Text>
              </View>
              <Badge label={`${formatDistance(selectedMapJob.distance_km)}`} variant="primary" size="small" />
            </View>

            {/* Live Tracking Map Component */}
            <View style={{ flex: 1 }}>
              <LiveTrackingMap
                driverName="You (Rider)"
                driverPhone="+237 670 000 000"
                estimatedArrivalMin={Math.ceil((selectedMapJob.distance_km ?? 2) * 3)}
              />
            </View>

            {/* Bottom Modal Route Info Card */}
            <View style={[styles.mapModalBottomCard, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom + spacing.xs, spacing.md) }]}>
              <View style={styles.routeDetailRow}>
                <Ionicons name="location" size={20} color={colors.primary[500]} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" secondary bold>
                    STORE PICKUP
                  </Text>
                  <Text variant="bodyMedium" bold numberOfLines={1}>
                    {selectedMapJob.store.store_name} ({selectedMapJob.pickup_address.address_text})
                  </Text>
                </View>
              </View>

              <View style={[styles.routeDetailRow, { marginTop: spacing.xs }]}>
                <Ionicons name="flag" size={20} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" secondary bold>
                    BUYER DOORSTEP
                  </Text>
                  <Text variant="bodyMedium" bold numberOfLines={1}>
                    {selectedMapJob.delivery_address.address_text}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleRejectJob(selectedMapJob)}
                  style={[styles.modalRejectBtn, { borderColor: theme.border }]}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                  <Text variant="bodyMedium" bold color="#EF4444">
                    Not Interested ✖
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Accept Job ➔"
                  variant="primary"
                  size="large"
                  onPress={() => handleAcceptJob(selectedMapJob)}
                  style={styles.modalAcceptBtn}
                />
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* QR & Barcode Scanner Modal */}
      <Modal
        visible={isScannerOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsScannerOpen(false)}
      >
        <View style={[styles.mapModalContainer, { backgroundColor: theme.background }]}>
          {/* Header */}

          <View style={[styles.mapModalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsScannerOpen(false)} style={styles.closeMapBtn}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
              <Text variant="caption" bold color={colors.primary[600]}>
                SCANNER & ACCOUNT VERIFIER 📷
              </Text>
              <Text variant="h2" bold numberOfLines={1}>
                Scan &amp; Update Account
              </Text>
            </View>
            <Badge label="LIVE SCAN" variant="primary" size="small" />
          </View>

          <ScrollView style={{ flex: 1, padding: spacing.base }}>
            {/* Mode Selector Tabs */}
            <Text variant="caption" secondary bold style={{ marginBottom: spacing.xs }}>
              SELECT SCANNER MODE
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setScannerMode('package')}
                style={[
                  styles.scannerTabChip,
                  scannerMode === 'package'
                    ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                    : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }
                ]}
              >
                <Text variant="caption" bold color={scannerMode === 'package' ? '#FFFFFF' : theme.text}>
                  📦 Package Code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setScannerMode('permit')}
                style={[
                  styles.scannerTabChip,
                  scannerMode === 'permit'
                    ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                    : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }
                ]}
              >
                <Text variant="caption" bold color={scannerMode === 'permit' ? '#FFFFFF' : theme.text}>
                  💳 Driver Permit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setScannerMode('merchant')}
                style={[
                  styles.scannerTabChip,
                  scannerMode === 'merchant'
                    ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                    : { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border }
                ]}
              >
                <Text variant="caption" bold color={scannerMode === 'merchant' ? '#FFFFFF' : theme.text}>
                  🏪 Store Check-in
                </Text>
              </TouchableOpacity>
            </View>

            {/* Viewfinder Mockup */}
            {/* Live Camera Viewfinder */}
            <View style={styles.viewfinderBox}>
              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  enableTorch={torchEnabled}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                  }}
                />
              ) : (
                <View style={styles.permissionPlaceholder}>
                  <Ionicons name="camera-outline" size={36} color="#94A3B8" />
                  <Text variant="bodyMedium" bold color="#FFFFFF" align="center" style={{ marginTop: 6 }}>
                    Live Camera Hardware Sensor
                  </Text>
                  <Text variant="caption" color="rgba(255,255,255,0.7)" align="center" style={{ marginTop: 2, marginBottom: spacing.xs }}>
                    Enable camera access to scan package QR codes and driver permits live.
                  </Text>
                  <Button
                    title="Grant Camera Permission"
                    variant="primary"
                    size="small"
                    onPress={requestPermission}
                  />
                </View>
              )}

              {/* Viewfinder Corners */}
              <View style={styles.viewfinderCornerTL} />
              <View style={styles.viewfinderCornerTR} />
              <View style={styles.viewfinderCornerBL} />
              <View style={styles.viewfinderCornerBR} />

              <Ionicons name="qr-code-outline" size={64} color={colors.primary[500]} />
              <Text variant="caption" bold color="#FFFFFF" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
                {scannerMode === 'package'
                  ? 'Align Waybill Barcode or Package QR inside reticle'
                  : scannerMode === 'permit'
                  ? 'Align Douala Council Permit or Driver License'
                  : 'Align Store Check-in QR code'}
              </Text>
            </View>
              {/* Live Laser Scanner Line */}
              <View style={styles.laserLine} />

            {/* Instruction Card */}
            <Card style={{ marginTop: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary[600]} />
                <Text variant="bodyMedium" bold style={{ flex: 1 }}>
                  Automatic Account &amp; Order Sync
              {/* Torch Flashlight Toggle */}
              {permission?.granted && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setTorchEnabled(!torchEnabled)}
                  style={[
                    styles.torchBtn,
                    { backgroundColor: torchEnabled ? colors.accent[500] : 'rgba(15,23,42,0.85)' },
                  ]}
                >
                  <Ionicons
                    name={torchEnabled ? 'flash' : 'flash-off'}
                    size={16}
                    color={torchEnabled ? '#000000' : '#FFFFFF'}
                  />
                  <Text variant="caption" bold color={torchEnabled ? '#000000' : '#FFFFFF'}>
                    {torchEnabled ? 'Torch ON' : 'Torch OFF'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Live Scanner Sensor Status Tag */}
              <View style={styles.scanStatusTag}>
                <View style={[styles.livePulseDot, { backgroundColor: scanned ? colors.accent[500] : '#10B981' }]} />
                <Text variant="caption" bold color="#FFFFFF">
                  {scanned ? 'QR / BARCODE DETECTED!' : 'LIVE CAMERA SCANNER ACTIVE'}
                </Text>
              </View>
              <Text variant="caption" secondary style={{ marginTop: 4 }}>
                Scanning instant codes updates your account verification status, store check-in timestamp, and package handover records directly in real time.
              </Text>
            </Card>
            </View>

            {scanned && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setScanned(false)}
                style={styles.rescanBtn}
              >
                <Ionicons name="refresh-outline" size={16} color={colors.primary[600]} />
                <Text variant="caption" bold color={colors.primary[600]}>
                  Tap to Reset &amp; Scan Another Code
                </Text>
              </TouchableOpacity>
            )}

            <Text variant="caption" secondary bold style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
              SELECT SAMPLE QR CODE TO SCAN
            </Text>

            {/* Quick Sample Presets */}
            <View style={{ gap: spacing.xs }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSimulateScan('WB-2026-9842')}
                style={[styles.sampleBarcodeRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Ionicons name="cube-outline" size={22} color={colors.primary[500]} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text variant="bodyMedium" bold>
                    📦 Waybill Package QR (#WB-2026-9842)
                  </Text>
                  <Text variant="caption" secondary>
                    Douala Tech Hub • Samsung Galaxy A54
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSimulateScan('DLA-2026-88')}
                style={[styles.sampleBarcodeRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Ionicons name="card-outline" size={22} color={colors.primary[500]} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text variant="bodyMedium" bold>
                    💳 Fleet Driver Permit (#DLA-2026-88)
                  </Text>
                  <Text variant="caption" secondary>
                    Douala Urban Transport Council Registered Driver
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSimulateScan('STORE-101')}
                style={[styles.sampleBarcodeRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Ionicons name="storefront-outline" size={22} color={colors.primary[500]} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text variant="bodyMedium" bold>
                    🏪 Merchant Store Check-in (#STORE-101)
                  </Text>
                  <Text variant="caption" secondary>
                    Douala Tech Hub Akwa Branch Counter #2
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Button
              title={isScanningProcess ? 'Scanning & Verifying...' : '⚡ Scan & Sync Account Direct'}
              variant="primary"
              size="large"
              loading={isScanningProcess}
              onPress={handleSimulateScan}
              style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
              onPress={() => handleSimulateScan()}
              style={{ marginTop: spacing.lg, marginBottom: spacing.xl, backgroundColor: colors.primary[500] }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Slide-out Navigation Drawer */}
      <TransporterSidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
      />

      {toastMessage && <Toast message={toastMessage} type="success" onDismiss={() => setToastMessage(null)} />}

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  dutyBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginRight: 2,
  },
  dutyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleStack: {
    marginBottom: spacing.xs + 2,
  },
  screenTitleText: {
    fontSize: 22,
    marginTop: 2,
  },
  filterChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.xs,
  },
  chipItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  jobCard: {
    marginBottom: 0,
    overflow: 'hidden',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  addressBox: {
    marginBottom: spacing.xs,
  },
  routeTimelineCard: {
    padding: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.xs,
    paddingTop: 2,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: 'rgba(148,163,184,0.3)',
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
  },
  summaryBox: {
    padding: spacing.xs + 2,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
  },
  summaryText: {
    fontSize: 12,
  },
  payoutHighlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  payoutLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  payoutAmountBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  mapRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  acceptBtn: {
    flex: 1.2,
    backgroundColor: colors.primary[500],
  },
  modalAcceptBtn: {
    flex: 1.4,
    backgroundColor: colors.primary[500],
  },
  scannerTabChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  viewfinderBox: {
    backgroundColor: '#0F172A',
    height: 220,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    position: 'relative',
    overflow: 'hidden',
  },
  viewfinderCornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primary[500],
  },
  viewfinderCornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primary[500],
  },
  viewfinderCornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primary[500],
  },
  viewfinderCornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primary[500],
  },
  mapModalContainer: {
    flex: 1,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  closeMapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModalBottomCard: {
    padding: spacing.base,
    borderTopWidth: 1,
    ...shadows.lg,
  },
  routeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.md,
  },
  modalRejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  permissionPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    backgroundColor: '#0F172A',
  },
  laserLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  torchBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    zIndex: 10,
  },
  scanStatusTag: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    zIndex: 10,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  sampleBarcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
});


