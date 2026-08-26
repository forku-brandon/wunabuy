import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BuyerTabParamList } from './types';
import { ScreenContainer, Text, Button } from '../components/ui';
import { useThemeStore } from '../stores/theme.store';
import { useAuthStore } from '../stores/auth.store';
import { colors } from '@wunabuy/design-tokens';
import { UserRole } from '@wunabuy/types';

const Tab = createBottomTabNavigator<BuyerTabParamList>();

const BuyerHomeScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Buyer Home</Text>
    <Text variant="bodyMedium" secondary>Explore verified products and stores near you</Text>
  </ScreenContainer>
);

const BuyerSearchScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Explore Catalog</Text>
    <Text variant="bodyMedium" secondary>Search by category, price, or radius</Text>
  </ScreenContainer>
);

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

const BuyerProfileScreen = () => {
  const { setActiveRole } = useAuthStore();
  return (
    <ScreenContainer>
      <Text variant="h1" bold>Buyer Profile</Text>
      <Text variant="bodyMedium" secondary style={{ marginBottom: 16 }}>Manage account, addresses, and switch roles</Text>
      <Button
        title="Switch to Seller Role"
        variant="outline"
        onPress={() => setActiveRole(UserRole.SELLER)}
      />
    </ScreenContainer>
  );
};

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
      <Tab.Screen name="BuyerHome" component={BuyerHomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="BuyerSearch" component={BuyerSearchScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="BuyerCart" component={BuyerCartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="BuyerOrders" component={BuyerOrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="BuyerProfile" component={BuyerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
