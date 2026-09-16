import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationApiService } from '../api/notificationService';

// Configure foreground presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const PERMISSION_PROMPTED_KEY = '@wunabuy:notification_permission_prompted';

export const NotificationManager = {
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
   * Request native OS notification permissions.
   */
  async requestPermissions(): Promise<boolean> {
    try {
      await this.setPromptedPermission();

      const existingStatus: any = await Notifications.getPermissionsAsync();
      let isGranted = Boolean(existingStatus?.granted || existingStatus?.status === 'granted');

      if (!isGranted) {
        const requested: any = await Notifications.requestPermissionsAsync();
        isGranted = Boolean(requested?.granted || requested?.status === 'granted');
      }

      if (!isGranted) {
        return false;
      }

      // If granted, register device token
      await this.registerDeviceToken();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Retrieve and register device push token with backend.
   */
  async registerDeviceToken(): Promise<string | null> {
    try {
      // In Android 13+, create Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Wunabuy Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0D9488',
        });
      }

      // Fetch Expo push token
      let token = '';
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
      } catch {
        // Fallback for emulator / non-Google Play Services environments
        token = `emulator_token_${Platform.OS}_${Date.now()}`;
      }

      if (token) {
        await NotificationApiService.registerDeviceToken(
          token,
          Platform.OS,
          Platform.OS === 'android' ? 'Android Device' : 'iOS Device'
        );
      }

      return token;
    } catch {
      return null;
    }
  },

  /**
   * Attach notification received listener.
   */
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Attach notification response (tap) listener.
   */
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
