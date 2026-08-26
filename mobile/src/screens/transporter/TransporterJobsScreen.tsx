import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { DeliveryJob } from '@wunabuy/types';
import { formatXAF, formatDistance } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

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
      latitude: 4.0720,
      longitude: 9.7900,
      address_text: 'Bali, Douala',
      city: 'Douala',
      is_default: true,
    },
    items_summary: '2x Toghu Embroidered Outfits (Package size: Medium)',
    delivery_fee: 2000,
    currency: 'XAF',
    distance_km: 4.1,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export const TransporterJobsScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [jobs, setJobs] = useState<DeliveryJob[]>(MOCK_DELIVERY_JOBS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAcceptJob = (job: DeliveryJob) => {
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    setToastMessage(`Job #${job.order_code} accepted! Navigating to active trip.`);
    setTimeout(() => {
      navigation.navigate('TransporterActiveTrip', { jobId: job.id });
    }, 800);
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text variant="h1" bold color={colors.role.transporter}>
            Available Delivery Jobs 🛵
          </Text>
          <Badge label="ONLINE" variant="success" size="small" />
        </View>

        <Text variant="caption" secondary>
          Nearby transport offers in Douala sorted by distance
        </Text>
      </View>

      {/* Jobs Feed */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text variant="bodyLarge" bold color={colors.primary[500]}>
                {item.order_code}
              </Text>
              <Badge label={`${formatDistance(item.distance_km)} AWAY`} variant="info" size="small" />
            </View>

            {/* Pickup */}
            <View style={styles.addressBox}>
              <Text variant="caption" secondary>
                PICKUP STORE
              </Text>
              <Text variant="bodyMedium" bold>
                🏬 {item.store.store_name} ({item.pickup_address.address_text})
              </Text>
            </View>

            {/* Drop-off */}
            <View style={styles.addressBox}>
              <Text variant="caption" secondary>
                DELIVERY DESTINATION
              </Text>
              <Text variant="bodyMedium" bold>
                🏠 {item.delivery_address.address_text}
              </Text>
            </View>

            <Text variant="caption" secondary style={styles.summaryText}>
              📦 {item.items_summary}
            </Text>

            <View style={styles.footerRow}>
              <View>
                <Text variant="caption" secondary>
                  YOUR DRIVER EARNINGS
                </Text>
                <Text variant="h2" bold color={colors.role.transporter}>
                  {formatXAF(item.delivery_fee)}
                </Text>
              </View>

              <Button
                title="Accept Job"
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

      {toastMessage && <Toast message={toastMessage} type="success" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
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
  summaryText: {
    marginVertical: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  acceptBtn: {
    backgroundColor: colors.role.transporter,
    minWidth: 120,
  },
});

