import React, { useState } from 'react';
import { View, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Toast } from '../../components/ui';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors, borderRadius } from '@wunabuy/design-tokens';
import { AuthService } from '../../services/api';

export const NotificationSettingsScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    AuthService.updatePreferences({ [key]: value });
    setToastMessage(`Preferences updated.`);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation.getParent()?.canGoBack()) {
              navigation.getParent()?.goBack();
            }
          }}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.title}>
          Notification Preferences
        </Text>
      </View>

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
            onValueChange={(val) => handleToggle('order_updates', val, setOrderUpdates)}
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
            onValueChange={(val) => handleToggle('chat_messages', val, setChatMessages)}
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
            onValueChange={(val) => handleToggle('price_alerts', val, setPriceAlerts)}
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
            onValueChange={(val) => handleToggle('promotions', val, setPromotions)}
            trackColor={{ false: theme.border, true: colors.primary[500] }}
          />
        </View>
      </Card>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
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
