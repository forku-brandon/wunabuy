import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { TransporterSidebarDrawer } from '../../components/navigation/TransporterSidebarDrawer';
import { LiveTrackingMap } from '../../components/order/LiveTrackingMap';

import { DeliveryJob, UserRole } from '@wunabuy/types';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { AuthService } from '../../services/api';


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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setJobs(MOCK_DELIVERY_JOBS);
      setRefreshing(false);
    }, 800);
  }, []);

  const handleSwitchToBuyer = () => {
    useAuthStore.getState().setActiveRole(UserRole.BUYER);
    AuthService.switchRole(UserRole.BUYER);
  };

  const handleAcceptJob = (job: DeliveryJob) => {
    setSelectedMapJob(null);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    setToastMessage(`Job #${job.order_code} accepted! Navigating to active trip.`);
    setTimeout(() => {
      navigation.navigate('TransporterActiveTrip', { jobId: job.id, stage: 1 });
    }, 600);
  };

  const handleRejectJob = (job: DeliveryJob) => {
    setSelectedMapJob(null);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    setToastMessage(`Offer #${job.order_code} rejected. Surface next available job offer.`);
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

          {/* Right Action Icons: Notification, Buyer Mode */}
          <View style={styles.headerRightActionIcons}>
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

            {/* Pickup */}
            <View style={styles.addressBox}>
              <Text variant="caption" secondary bold>
                STORE PICKUP
              </Text>
              <Text variant="bodyMedium" bold style={{ marginTop: 1 }}>
                🏬 {item.store.store_name} ({item.pickup_address.address_text})
              </Text>
            </View>

            {/* Drop-off */}
            <View style={styles.addressBox}>
              <Text variant="caption" secondary bold>
                BUYER DELIVERY DESTINATION
              </Text>
              <Text variant="bodyMedium" bold style={{ marginTop: 1 }}>
                🏠 {item.delivery_address.address_text}
              </Text>
            </View>

            <View style={[styles.summaryBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Text variant="caption" secondary style={styles.summaryText}>
                📦 {item.items_summary}
              </Text>
            </View>

            {/* Map Route Trigger Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedMapJob(item)}
              style={[styles.mapRouteBtn, { backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : colors.primary[50], borderColor: colors.primary[200] }]}
            >
              <Ionicons name="map-outline" size={16} color={colors.primary[600]} />
              <Text variant="caption" bold color={colors.primary[600]}>
                Inspect GPS Map &amp; Shortest Route 🗺️
              </Text>
            </TouchableOpacity>

            {/* Driver Payout Dedicated Banner */}
            <View style={[styles.payoutHighlightBanner, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50], borderColor: isDark ? 'rgba(13,148,136,0.3)' : colors.primary[200] }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="cash-outline" size={18} color={colors.primary[600]} />
                <Text variant="caption" bold color={colors.primary[600]}>
                  ESTIMATED DRIVER PAYOUT
                </Text>
              </View>
              <Text variant="h2" bold color={colors.primary[600]}>
                {formatXAF(item.delivery_fee)}
              </Text>
            </View>

            {/* Action Buttons Row (Moved Down below Driver Payout for Maximum Spacing & Flexibility) */}
            <View style={styles.cardActionGroup}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleRejectJob(item)}
                style={[styles.rejectBtn, { borderColor: theme.border }]}
              >
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text variant="caption" bold color="#EF4444">
                  Not Interested
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
                  title={`Accept & Start Ride (${formatXAF(selectedMapJob.delivery_fee)}) ➔`}
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



      {/* Slide-out Navigation Drawer */}
      <TransporterSidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
      />

      {toastMessage && <Toast message={toastMessage} type="success" />}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.xs + 2,
    marginBottom: spacing.xs,
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
  modalAcceptBtn: {
    flex: 1,
  },
});

