import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import { NotificationApiService } from '../api/notificationService';

// Check if running inside standard Expo Go client app on Android.
// Expo SDK 53+ removed remote push notifications (FCM) from Expo Go on Android,
// requiring a development build (npx expo run:android or EAS Build) for native push tokens.
const isExpoGoOnAndroid = Platform.OS === 'android' && isRunningInExpoGo();

// Dynamically require expo-notifications only when NOT running in Android Expo Go,
// preventing the SDK 53 fatal error throw on startup while keeping full support
// for Development Builds (APK / AAB) and iOS.
let Notifications: any = null;
if (!isExpoGoOnAndroid) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Notifications = require('expo-notifications');

    // Configure foreground presentation behavior
    Notifications?.setNotificationHandler?.({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('[NotificationManager] Native notifications module not available:', error);
  }
} else {
  // Helpful developer guidance for Expo Go on Android
  console.log(
    '[NotificationManager] Running in Expo Go on Android. Native remote push notifications require a development build (npx expo run:android). Real-time in-app notifications and inbox streams are fully operational.'
  );
}

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

      if (!Notifications) {
        // In Expo Go on Android, remote push permissions cannot be requested from OS.
        // Fallback to registering device token with backend so in-app notifications operate.
        await this.registerDeviceToken();
        return true;
      }

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
      let token = '';

      if (Notifications) {
        // In Android 13+, create Android notification channel
        if (Platform.OS === 'android') {
          try {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'Wunabuy Notifications',
              importance: Notifications.AndroidImportance?.MAX ?? 5,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#0D9488',
            });
          } catch {
            // ignore channel error
          }
        }

        // Fetch Expo push token
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          token = tokenData?.data || '';
        } catch {
          // Fallback for emulator / non-Google Play Services environments
          token = `dev_token_${Platform.OS}_${Date.now()}`;
        }
      } else {
        // Expo Go on Android fallback token
        token = `expogo_android_${Date.now()}`;
      }

      if (token) {
        await NotificationApiService.registerDeviceToken(
          token,
          Platform.OS,
          isExpoGoOnAndroid
            ? 'Expo Go Android Client'
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
   * Attach notification received listener.
   */
  addNotificationReceivedListener(callback: (notification: any) => void) {
    if (Notifications?.addNotificationReceivedListener) {
      return Notifications.addNotificationReceivedListener(callback);
    }
    return {
      remove: () => {},
    };
  },

  /**
   * Attach notification response (tap) listener.
   */
  addNotificationResponseListener(callback: (response: any) => void) {
    if (Notifications?.addNotificationResponseReceivedListener) {
      return Notifications.addNotificationResponseReceivedListener(callback);
    }
    return {
      remove: () => {},
    };
  },
};
