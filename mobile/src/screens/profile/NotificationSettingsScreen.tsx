import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { ScreenContainer, Text, Card } from '../../components/ui';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors } from '@wunabuy/design-tokens';

export const NotificationSettingsScreen = () => {
  const { theme } = useThemeStore();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);

  return (
    <ScreenContainer>
      <Text variant="h1" bold style={styles.title}>
        Notification Preferences
      </Text>
      <Text variant="bodyMedium" secondary style={styles.subtitle}>
        Choose how and when you want Wunabuy to notify you.
      </Text>

      <Card style={styles.card}>
        <View style={styles.settingItem}>
          <View style={styles.settingText}>
            <Text variant="bodyMedium" bold>
              Order Status Updates
            </Text>
            <Text variant="caption" secondary>
              Real-time push alerts when order status changes in escrow.
            </Text>
          </View>
          <Switch
            value={orderUpdates}
            onValueChange={setOrderUpdates}
            trackColor={{ false: theme.border, true: colors.primary[500] }}
          />
        </View>

        <View style={[styles.settingItem, styles.borderTop, { borderColor: theme.border }]}>
          <View style={styles.settingText}>
            <Text variant="bodyMedium" bold>
              In-App Chat Messages
            </Text>
            <Text variant="caption" secondary>
              Alerts when buyers, sellers, or drivers send you a message.
            </Text>
          </View>
          <Switch
            value={chatMessages}
            onValueChange={setChatMessages}
            trackColor={{ false: theme.border, true: colors.primary[500] }}
          />
        </View>

        <View style={[styles.settingItem, styles.borderTop, { borderColor: theme.border }]}>
          <View style={styles.settingText}>
            <Text variant="bodyMedium" bold>
              Price Drop & Deal Alerts
            </Text>
            <Text variant="caption" secondary>
              Notifications when items in your cart or wishlist go on sale.
            </Text>
          </View>
          <Switch
            value={priceAlerts}
            onValueChange={setPriceAlerts}
            trackColor={{ false: theme.border, true: colors.primary[500] }}
          />
        </View>

        <View style={[styles.settingItem, styles.borderTop, { borderColor: theme.border }]}>
          <View style={styles.settingText}>
            <Text variant="bodyMedium" bold>
              Promotions & Marketing
            </Text>
            <Text variant="caption" secondary>
              Receive special promo codes and marketplace highlights.
            </Text>
          </View>
          <Switch
            value={promotions}
            onValueChange={setPromotions}
            trackColor={{ false: theme.border, true: colors.primary[500] }}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  card: {
    paddingVertical: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  borderTop: {
    borderTopWidth: 1,
  },
  settingText: {
    flex: 1,
    paddingRight: spacing.md,
  },
});
