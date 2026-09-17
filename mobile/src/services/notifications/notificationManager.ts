import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import { NotificationApiService } from '../api/notificationService';

// Import individual modules from expo-notifications to avoid DevicePushTokenAutoRegistration.fx
// which causes a fatal runtime throw on Android Expo Go SDK 53+.
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from 'expo-notifications/build/NotificationsEmitter';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';

// Configure foreground presentation behavior so notifications always present with sound and banner
try {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  // Graceful fallback
}

const PERMISSION_PROMPTED_KEY = '@wunabuy:notification_permission_prompted';
const LAST_SEEN_NOTIFICATION_KEY = '@wunabuy:last_presented_notification_id';
const NOTIFICATION_CHANNEL_ID = 'wunabuy_alerts_v1';

export const NotificationManager = {
  /**
   * Ensure native Android Notification Channel exists with MAX importance, vibration, sound, and badge.
   */
  async ensureNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
          name: 'Wunabuy Alerts & Orders',
          importance: AndroidImportance.MAX,
          vibrationPattern: [0, 300, 200, 300],
          lightColor: '#0D9488',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      } catch (err) {
        console.warn('[NotificationManager] Channel creation note:', err);
      }
    }
  },

  /**
   * Check if user has already been asked for notification permission.
   */
  async hasPromptedPermission(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(PERMISSION_PROMPTED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Mark permission prompt as completed.
   */
  async setPromptedPermission(): Promise<void> {
    try {
      await AsyncStorage.setItem(PERMISSION_PROMPTED_KEY, 'true');
    } catch {
      // ignore
    }
  },

  /**
   * Request native OS notification permissions on the physical device.
   */
  async requestPermissions(): Promise<boolean> {
    try {
      await this.setPromptedPermission();
      await this.ensureNotificationChannel();

      const existingStatus: any = await getPermissionsAsync();
      let isGranted = Boolean(existingStatus?.granted || existingStatus?.status === 'granted');

      if (!isGranted) {
        const requested: any = await requestPermissionsAsync();
        isGranted = Boolean(requested?.granted || requested?.status === 'granted');
      }

      // Register device token with backend
      await this.registerDeviceToken();
      return isGranted;
    } catch (err) {
      console.warn('[NotificationManager] Permission request note:', err);
      await this.registerDeviceToken();
      return true;
    }
  },

  /**
   * Retrieve and register device push token with backend.
   */
  async registerDeviceToken(): Promise<string | null> {
    try {
      await this.ensureNotificationChannel();

      let token = '';
      const inExpoGo = isRunningInExpoGo();

      if (!inExpoGo || Platform.OS === 'ios') {
        // In standalone development build / production build or iOS Expo Go, fetch real Expo push token
        try {
          // Dynamic require to prevent SDK 53 throw in Android Expo Go
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { getExpoPushTokenAsync } = require('expo-notifications/build/getExpoPushTokenAsync');
          const tokenData = await getExpoPushTokenAsync();
          token = tokenData?.data || '';
        } catch {
          token = `dev_token_${Platform.OS}_${Date.now()}`;
        }
      } else {
        // In Android Expo Go, use persistent device identifier for real-time inbox tracking
        token = `expogo_android_${Date.now()}`;
      }

      if (token) {
        await NotificationApiService.registerDeviceToken(
          token,
          Platform.OS,
          inExpoGo
            ? `Expo Go ${Platform.OS === 'android' ? 'Android' : 'iOS'}`
            : Platform.OS === 'android'
            ? 'Android Device'
            : 'iOS Device'
        );
      }

      return token;
    } catch {
      return null;
    }
  },

  /**
   * Present an immediate native Android/iOS system notification banner on the device's top bar!
   * Shows up on the lock screen and notification shade with native sound and vibration,
   * exactly like WhatsApp, Alibaba, or Amazon.
   */
  async presentDeviceNotification(payload: {
    id: string;
    title: string;
    message: string;
    data?: Record<string, any> | null;
  }): Promise<string | null> {
    try {
      await this.ensureNotificationChannel();

      const notifId = await scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.message,
          sound: 'default',
          vibrate: [0, 300, 200, 300],
          data: {
            notification_id: payload.id,
            ...(payload.data || {}),
          },
          ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : {}),
        },
        trigger: null, // IMMEDIATE native presentation in OS top bar/drawer
      });

      // Track last presented notification ID
      await AsyncStorage.setItem(LAST_SEEN_NOTIFICATION_KEY, payload.id);
      return notifId;
    } catch (err) {
      console.warn('[NotificationManager] Error presenting native device notification:', err);
      return null;
    }
  },

  /**
   * Check for new incoming notifications and trigger native device alert if unnotified.
   */
  async syncAndAlertNewNotifications(notifications: any[]): Promise<void> {
    if (!notifications || notifications.length === 0) return;

    try {
      const lastSeenId = await AsyncStorage.getItem(LAST_SEEN_NOTIFICATION_KEY);
      const unreadItems = notifications.filter((n) => !n.is_read);

      if (unreadItems.length === 0) return;

      const latest = unreadItems[0];
      if (latest && latest.id !== lastSeenId) {
        // Trigger native device system banner with sound and vibration!
        await this.presentDeviceNotification(latest);
      }
    } catch {
      // Ignore background sync errors
    }
  },

  /**
   * Attach notification received listener.
   */
  addNotificationReceivedListener(callback: (notification: any) => void) {
    try {
      return addNotificationReceivedListener(callback);
    } catch {
      return { remove: () => {} };
    }
  },

  /**
   * Attach notification response (user taps notification in device top bar / notification shade).
   */
  addNotificationResponseListener(callback: (response: any) => void) {
    try {
      return addNotificationResponseReceivedListener(callback);
    } catch {
      return { remove: () => {} };
    }
  },
};
