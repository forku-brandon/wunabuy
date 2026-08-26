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

const Stack = createNativeStackNavigator<RootStackParamList>();

// Shared Detail Screen Placeholders
const ProductDetailScreen = ({ route }: any) => (
  <ScreenContainer>
    <Text variant="h1" bold>Product Detail</Text>
    <Text variant="bodyMedium" secondary>Product ID: {route.params?.productId}</Text>
  </ScreenContainer>
);

const OrderTrackingScreen = ({ route }: any) => (
  <ScreenContainer>
    <Text variant="h1" bold>Live Order Tracking</Text>
    <Text variant="bodyMedium" secondary>Order ID: {route.params?.orderId}</Text>
  </ScreenContainer>
);

const ChatConversationScreen = ({ route }: any) => (
  <ScreenContainer>
    <Text variant="h1" bold>Chat Conversation</Text>
    <Text variant="bodyMedium" secondary>Conversation ID: {route.params?.conversationId}</Text>
  </ScreenContainer>
);

import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { AddressManagerScreen } from '../screens/profile/AddressManagerScreen';

export const RootNavigator = () => {
  const { isAuthenticated, activeRole } = useAuthStore();
  const { theme } = useThemeStore();

  const renderRoleApp = () => {
    switch (activeRole) {
      case UserRole.SELLER:
        return <Stack.Screen name="SellerApp" component={SellerTabNavigator} />;
      case UserRole.TRANSPORTER:
        return <Stack.Screen name="TransporterApp" component={TransporterTabNavigator} />;
      case UserRole.BUYER:
      default:
        return <Stack.Screen name="BuyerApp" component={BuyerTabNavigator} />;
    }
  };

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
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {renderRoleApp()}
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="AddressManager" component={AddressManagerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

