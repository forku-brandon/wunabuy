import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { RootNavigator, navigationRef } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/stores/theme.store';
import { useAuthStore } from './src/stores/auth.store';
import { AuthService } from './src/services/api/authService';
import './src/i18n'; // Initialize i18next
import { NotificationManager } from './src/services/notifications/notificationManager';
import { PermissionPromptModal } from './src/components/notifications/PermissionPromptModal';
import { useNotificationStore } from './src/stores/notification.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

/**
 * Inner component that has access to the theme store and can sync
 * the Android system navigation bar buttons style (light vs dark icons)
 * with the current app theme.
 */
const AppContent: React.FC = () => {
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  useEffect(() => {
    // Check if notification permission prompt has been displayed to user
    const checkNotificationPrompt = async () => {
      const prompted = await NotificationManager.hasPromptedPermission();
      if (!prompted) {
        // Small delay for smooth transition after initial render
        setTimeout(() => {
          setShowPermissionModal(true);
        }, 1200);
      }
    };
    checkNotificationPrompt();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      AuthService.getCurrentUser().catch(() => {});
      // Sync push token with backend and perform initial unread fetch
      NotificationManager.registerDeviceToken().catch(() => {});
      useNotificationStore.getState().pollNewNotifications().catch(() => {});

      // Real-time synchronization interval (like WhatsApp / Alibaba)
      // Checks backend for incoming order milestones, dispatch updates, and staff broadcasts
      const pollTimer = setInterval(() => {
        useNotificationStore.getState().pollNewNotifications().catch(() => {});
      }, 8000);

      return () => clearInterval(pollTimer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // 1. Listen for user tapping the notification banner in Android status bar / lockscreen
    const responseSub = NotificationManager.addNotificationResponseListener((response) => {
      try {
        const notifData = response?.notification?.request?.content?.data || {};
        const notificationId = notifData.notification_id;

        if (notificationId) {
          useNotificationStore.getState().markAsRead(notificationId).catch(() => {});
        }

        if (navigationRef.isReady()) {
          const screen = notifData.screen;
          if (screen === 'OrderTracking' && notifData.order_id) {
            navigationRef.navigate('OrderTracking', { orderId: String(notifData.order_id) });
          } else if (screen === 'BuyerOrders') {
            navigationRef.navigate('BuyerApp', { screen: 'BuyerOrders' } as any);
          } else if (screen === 'SellerOrders') {
            navigationRef.navigate('SellerApp', { screen: 'SellerOrders' } as any);
          } else if (screen === 'TransporterJobs') {
            navigationRef.navigate('TransporterApp', { screen: 'TransporterJobs' } as any);
          } else if (screen === 'BuyerWallet') {
            navigationRef.navigate('BuyerWallet');
          } else {
            navigationRef.navigate('Notifications');
          }
        }
      } catch (err) {
        console.warn('[App] Notification tap navigation error:', err);
      }
    });

    // 2. Listen for incoming notifications while app is in foreground
    const receivedSub = NotificationManager.addNotificationReceivedListener(() => {
      useNotificationStore.getState().incrementUnread();
      useNotificationStore.getState().fetchNotifications();
    });

    return () => {
      responseSub.remove();
      receivedSub.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        (NavigationBar as any).setButtonStyleAsync?.(isDark ? 'light' : 'dark')?.catch?.(() => {});
      } catch (e) {
        // Silently ignore if on unsupported environment
      }
    }
  }, [isDark]);

  return (
    <>
      <RootNavigator />
      <PermissionPromptModal
        visible={showPermissionModal}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </>
  );
};

export default function App() {
  const [fontsLoaded, fontsError] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-SemiBold': require('./assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('./assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  // Show minimal loading indicator while fonts load.
  // On error, gracefully continue with system fonts.
  if (!fontsLoaded && !fontsError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
  },
});
