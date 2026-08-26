import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BuyerTabParamList } from './types';
import { ScreenContainer, Text } from '../components/ui';
import { useThemeStore } from '../stores/theme.store';
import { colors } from '@wunabuy/design-tokens';
import { HomeScreen } from '../screens/buyer/HomeScreen';
import { SearchScreen } from '../screens/buyer/SearchScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<BuyerTabParamList>();

const BuyerCartScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Cart & Checkout</Text>
    <Text variant="bodyMedium" secondary>Your items in escrow checkout</Text>
  </ScreenContainer>
);

const BuyerOrdersScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Order Tracking</Text>
    <Text variant="bodyMedium" secondary>Track active escrow deliveries in real-time</Text>
  </ScreenContainer>
);

export const BuyerTabNavigator = () => {
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen name="BuyerHome" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="BuyerSearch" component={SearchScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="BuyerCart" component={BuyerCartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="BuyerOrders" component={BuyerOrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="BuyerProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
