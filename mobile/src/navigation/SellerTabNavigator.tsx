import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SellerTabParamList } from './types';
import { ScreenContainer, Text } from '../components/ui';
import { useThemeStore } from '../stores/theme.store';
import { colors } from '@wunabuy/design-tokens';
import { SellerDashboardScreen } from '../screens/seller/SellerDashboardScreen';
import { SellerProductsScreen } from '../screens/seller/SellerProductsScreen';
import { SellerOrdersScreen } from '../screens/seller/SellerOrdersScreen';
import { SellerWalletScreen } from '../screens/seller/SellerWalletScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<SellerTabParamList>();

export const SellerTabNavigator = () => {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.role.seller,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 54 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'SellerDashboard':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'SellerProducts':
              iconName = focused ? 'pricetag' : 'pricetag-outline';
              break;
            case 'SellerOrders':
              iconName = focused ? 'clipboard' : 'clipboard-outline';
              break;
            case 'SellerWallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'SellerProfile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="SellerDashboard" component={SellerDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="SellerProducts" component={SellerProductsScreen} options={{ title: 'Products' }} />
      <Tab.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="SellerWallet" component={SellerWalletScreen} options={{ title: 'Wallet' }} />
      <Tab.Screen name="SellerProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
