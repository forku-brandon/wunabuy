import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { linkingConfig } from './linking';
import { AuthNavigator } from './AuthNavigator';
import { BuyerTabNavigator } from './BuyerTabNavigator';
import { SellerTabNavigator } from './SellerTabNavigator';
import { TransporterTabNavigator } from './TransporterTabNavigator';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { UserRole } from '@wunabuy/types';
import { ScreenContainer, Text } from '../components/ui';

// Screen Imports
import { ProductDetailScreen } from '../screens/buyer/ProductDetailScreen';
import { OrderTrackingScreen } from '../screens/buyer/OrderTrackingScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { AddressManagerScreen } from '../screens/profile/AddressManagerScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { SellerWelcomeScreen } from '../screens/seller/SellerWelcomeScreen';
import { StoreKYCScreen } from '../screens/seller/StoreKYCScreen';
import { TransporterWelcomeScreen } from '../screens/transporter/TransporterWelcomeScreen';
import { TransporterKYCScreen } from '../screens/transporter/TransporterKYCScreen';
import { AddEditProductScreen } from '../screens/seller/AddEditProductScreen';
import { CheckoutPaymentScreen } from '../screens/buyer/CheckoutPaymentScreen';
import { OrderSuccessScreen } from '../screens/buyer/OrderSuccessScreen';
import { WalletScreen } from '../screens/buyer/WalletScreen';
import { FollowedStoresScreen } from '../screens/buyer/FollowedStoresScreen';
import { FavoritesScreen } from '../screens/buyer/FavoritesScreen';
import { FootprintScreen } from '../screens/buyer/FootprintScreen';
import { RefundsScreen } from '../screens/buyer/RefundsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ChatConversationScreen = ({ route }: any) => (
  <ScreenContainer>
    <Text variant="h1" bold>Chat Conversation</Text>
    <Text variant="bodyMedium" secondary>Conversation ID: {route.params?.conversationId}</Text>
  </ScreenContainer>
);

export const RootNavigator = () => {
  const { isAuthenticated, activeRole } = useAuthStore();
  const { theme } = useThemeStore();

  return (
    <NavigationContainer
      linking={linkingConfig}
      theme={{
        dark: theme.background === '#0F172A',
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
          notification: theme.accent,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName={
          activeRole === UserRole.SELLER
            ? 'SellerApp'
            : activeRole === UserRole.TRANSPORTER
            ? 'TransporterApp'
            : 'BuyerApp'
        }
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="BuyerApp" component={BuyerTabNavigator} />
            <Stack.Screen name="SellerApp" component={SellerTabNavigator} />
            <Stack.Screen name="TransporterApp" component={TransporterTabNavigator} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="AddressManager" component={AddressManagerScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="SellerWelcome" component={SellerWelcomeScreen} />
            <Stack.Screen name="StoreKYC" component={StoreKYCScreen} />
            <Stack.Screen name="TransporterWelcome" component={TransporterWelcomeScreen} />
            <Stack.Screen name="TransporterKYC" component={TransporterKYCScreen} />
            <Stack.Screen name="AddEditProduct" component={AddEditProductScreen} />
            <Stack.Screen name="CheckoutPayment" component={CheckoutPaymentScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
            <Stack.Screen name="BuyerWallet" component={WalletScreen} />
            <Stack.Screen name="FollowedStores" component={FollowedStoresScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Footprint" component={FootprintScreen} />
            <Stack.Screen name="Refunds" component={RefundsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

