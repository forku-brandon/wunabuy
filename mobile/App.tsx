import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/stores/theme.store';
import './src/i18n'; // Initialize i18next

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

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        // 'dark' = dark navigation bar (white soft buttons) for dark mode
        // 'light' = light navigation bar (dark soft buttons) for light mode
        NavigationBar.setStyle(isDark ? 'dark' : 'light');
      } catch (e) {
        // Silently ignore if on unsupported environment
      }
    }
  }, [isDark]);

  return <RootNavigator />;
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
