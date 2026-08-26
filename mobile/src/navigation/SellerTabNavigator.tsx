import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SellerTabParamList } from './types';
import { ScreenContainer, Text, Button } from '../components/ui';
import { useThemeStore } from '../stores/theme.store';
import { useAuthStore } from '../stores/auth.store';
import { colors } from '@wunabuy/design-tokens';
import { UserRole } from '@wunabuy/types';

const Tab = createBottomTabNavigator<SellerTabParamList>();

const SellerDashboardScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Seller Dashboard</Text>
    <Text variant="bodyMedium" secondary>Daily sales, pending orders, and escrow overview</Text>
  </ScreenContainer>
);

const SellerProductsScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Products Inventory</Text>
    <Text variant="bodyMedium" secondary>Manage store items and stock levels</Text>
  </ScreenContainer>
);

const SellerOrdersScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Fulfillment Orders</Text>
    <Text variant="bodyMedium" secondary>Accept and mark orders ready for pickup</Text>
  </ScreenContainer>
);

const SellerWalletScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Store Wallet</Text>
    <Text variant="bodyMedium" secondary>Available payouts and transaction ledger</Text>
  </ScreenContainer>
);

const SellerProfileScreen = () => {
  const { setActiveRole } = useAuthStore();
  return (
    <ScreenContainer>
      <Text variant="h1" bold>Store Profile</Text>
      <Text variant="bodyMedium" secondary style={{ marginBottom: 16 }}>Store settings and role management</Text>
      <Button
        title="Switch to Buyer Role"
        variant="outline"
        onPress={() => setActiveRole(UserRole.BUYER)}
      />
    </ScreenContainer>
  );
};

export const SellerTabNavigator = () => {
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.role.seller,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen name="SellerDashboard" component={SellerDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="SellerProducts" component={SellerProductsScreen} options={{ title: 'Products' }} />
      <Tab.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="SellerWallet" component={SellerWalletScreen} options={{ title: 'Wallet' }} />
      <Tab.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
