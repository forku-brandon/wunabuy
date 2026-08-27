import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Avatar, Toast } from '../../components/ui';
import { ProductCard } from '../../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../../services/mockProducts';
import { Product } from '@wunabuy/types';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { formatPhone } from '@wunabuy/utils';
import { spacing, colors, borderRadius, shadows } from '@wunabuy/design-tokens';

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { theme, isDark } = useThemeStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const showNotice = (title: string) => {
    setToastMessage(`${title} feature accessed.`);
  };

  const ListHeader = (
    <>
      {/* Top Header Row with Settings Gear Icon (Matching media_1787828841561.png) */}
      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.userHeaderLeft}>
          <Avatar
            url={user?.avatar_url}
            name={user?.full_name ?? 'Jean Dupont'}
            size={42}
          />
          <View style={styles.userHeaderTextCol}>
            <Text variant="h2" bold numberOfLines={1}>
              {user?.full_name ?? 'tb2700557643'}
            </Text>
            <Text variant="caption" secondary numberOfLines={1}>
              {formatPhone(user?.phone ?? '+237670123456')}
            </Text>
          </View>
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
            onPress={() => navigation.navigate('BuyerOrders', { status: 'disputed' })}
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

          <TouchableOpacity onPress={() => showNotice('Followed Stores')} style={styles.toolItem}>
            <Ionicons name="storefront-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Followed Stores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('BuyerCart')} style={styles.toolItem}>
            <Ionicons name="star-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showNotice('Footprints')} style={styles.toolItem}>
            <Ionicons name="footsteps-outline" size={22} color={colors.primary[500]} />
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

          <TouchableOpacity onPress={() => showNotice('Pay Later')} style={styles.toolItem}>
            <Ionicons name="wallet-outline" size={22} color={colors.primary[500]} />
            <Text variant="caption" style={styles.toolText}>
              Pay Later
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
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} onPress={handleSelectProduct} />
          </View>
        )}
      />

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
  userHeaderTextCol: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
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
    width: '18%',
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
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },
  cardWrapper: {
    width: '48%',
  },
});
