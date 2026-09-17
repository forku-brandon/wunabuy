import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Badge, Toast } from '../../components/ui';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { useNotificationStore, NotificationFilter } from '../../stores/notification.store';
import { ApiNotification } from '../../services/api/notificationService';

interface TabItem {
  key: NotificationFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { key: 'all', label: 'All', icon: 'notifications-outline' },
  { key: 'orders', label: 'Orders & Trips', icon: 'cube-outline' },
  { key: 'marketing', label: 'Promos', icon: 'pricetag-outline' },
  { key: 'updates', label: 'System', icon: 'shield-checkmark-outline' },
];

export const NotificationsScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();
  const { activeRole } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    activeFilter,
    setFilter,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const initialFilter = route?.params?.filter as NotificationFilter | undefined;
    if (initialFilter && ['all', 'orders', 'marketing', 'updates'].includes(initialFilter)) {
      setFilter(initialFilter);
    } else {
      fetchNotifications();
    }
  }, [route?.params?.filter, activeRole]);

  const handleNotificationPress = async (item: ApiNotification) => {
    if (!item.is_read) {
      await markAsRead(item.id);
    }

    const data = item.data || {};
    const screen = data.screen;

    // Handle deep navigation based on payload
    if (screen === 'OrderTracking' && data.order_id) {
      navigation.navigate('OrderTracking', { orderId: String(data.order_id) });
      return;
    }

    if (screen === 'TransporterActiveTrip') {
      navigation.navigate('TransporterActiveTrip', { jobId: data.job_id ? String(data.job_id) : undefined });
      return;
    }

    if (screen === 'BuyerWallet' || item.type === 'escrow') {
      navigation.navigate('BuyerWallet');
      return;
    }

    if (screen === 'BuyerOrders') {
      navigation.navigate('BuyerApp', { screen: 'BuyerOrders' });
      return;
    }

    if (screen === 'SellerOrders') {
      navigation.navigate('SellerApp', { screen: 'SellerOrders' });
      return;
    }

    if (data.order_id) {
      navigation.navigate('OrderTracking', { orderId: String(data.order_id) });
      return;
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    await markAllAsRead();
    setToastMessage('All notifications marked as read');
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to remove all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            setToastMessage('All notifications cleared');
          },
        },
      ]
    );
  };

  const handleDeleteItem = (id: string, e: any) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return 'Recently';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return { name: 'cube' as const, bg: '#EFF6FF', color: '#2563EB' };
      case 'delivery':
        return { name: 'bicycle' as const, bg: '#F0FDF4', color: '#16A34A' };
      case 'escrow':
        return { name: 'shield-checkmark' as const, bg: '#ECFDF5', color: '#059669' };
      case 'marketing':
      case 'promo':
        return { name: 'flame' as const, bg: '#FFF7ED', color: '#EA580C' };
      case 'alert':
        return { name: 'warning' as const, bg: '#FEF2F2', color: '#DC2626' };
      case 'system':
      default:
        return { name: 'notifications' as const, bg: '#F8FAFC', color: '#64748B' };
    }
  };

  const renderItem = ({ item }: { item: ApiNotification }) => {
    const iconConfig = getNotificationIcon(item.type);
    const timeLabel = formatRelativeTime(item.created_at);
    const hasDetails = item.data?.order_id || item.data?.order_code || item.data?.screen;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.itemContainer,
          {
            backgroundColor: isDark ? (item.is_read ? theme.card : '#1E293B') : (item.is_read ? '#FFFFFF' : '#F0F9FF'),
            borderColor: isDark ? theme.border : (item.is_read ? '#F1F5F9' : '#BAE6FD'),
          },
        ]}
      >
        <View style={styles.itemRow}>
          {/* Icon */}
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isDark ? '#1E293B' : iconConfig.bg },
            ]}
          >
            <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
          </View>

          {/* Content */}
          <View style={styles.contentCol}>
            <View style={styles.titleRow}>
              <Text
                variant="bodyMedium"
                bold={!item.is_read}
                style={[
                  styles.titleText,
                  { color: isDark ? theme.text : '#0F172A' },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>

            <Text
              variant="bodyMedium"
              secondary
              numberOfLines={3}
              style={styles.messageText}
            >
              {item.message}
            </Text>

            {/* Bottom Meta & Tags */}
            <View style={styles.metaRow}>
              <View style={styles.tagsContainer}>
                {item.data?.order_code && (
                  <View style={[styles.orderPill, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <Text variant="caption" style={{ color: isDark ? '#F1F5F9' : '#334155', fontWeight: '600' }}>
                      #{item.data.order_code}
                    </Text>
                  </View>
                )}
                <Text variant="caption" secondary style={styles.timeText}>
                  {timeLabel}
                </Text>
              </View>

              <View style={styles.actionAffordance}>
                {hasDetails && (
                  <Text variant="caption" style={{ color: colors.primary[500], fontWeight: '600', marginRight: 4 }}>
                    View
                  </Text>
                )}
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={(e) => handleDeleteItem(item.id, e)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={15} color={isDark ? '#94A3B8' : '#94A3B8'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="h2" bold style={{ color: theme.text }}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badgePill}>
                <Text variant="caption" bold style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Text variant="caption" style={{ color: colors.primary[500], fontWeight: '600', textTransform: 'capitalize' }}>
            {activeRole ? `${activeRole} Workspace` : 'All Updates'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.headerBtn}
            >
              <Ionicons name="checkmark-done" size={22} color={colors.primary[500]} />
            </TouchableOpacity>
          )}

          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.headerBtn}
            >
              <Ionicons name="trash-outline" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        {TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: colors.primary[500], borderBottomWidth: 2 },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? colors.primary[500] : isDark ? '#94A3B8' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text
                variant="caption"
                bold={isActive}
                style={{
                  color: isActive ? colors.primary[500] : isDark ? '#94A3B8' : '#64748B',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listEmptyContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchNotifications(activeFilter)}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="notifications-off-outline" size={44} color={isDark ? '#64748B' : '#94A3B8'} />
              </View>
              <Text variant="h3" bold style={[styles.emptyTitle, { color: theme.text }]}>
                No Notifications
              </Text>
              <Text variant="caption" secondary style={styles.emptySubtitle}>
                {activeFilter === 'all'
                  ? "You're completely up to date! Live alerts for orders, deliveries, and updates will arrive here."
                  : `No ${activeFilter} notifications right now.`}
              </Text>
            </View>
          ) : null
        }
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: spacing.sm,
  },
  badgePill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
    gap: 10,
  },
  listEmptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: 8,
  },
  messageText: {
    lineHeight: 19,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 12,
  },
  actionAffordance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
