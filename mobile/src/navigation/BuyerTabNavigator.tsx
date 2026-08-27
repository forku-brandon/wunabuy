import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BuyerTabParamList } from './types';
import { useThemeStore } from '../stores/theme.store';
import { colors } from '@wunabuy/design-tokens';
import { HomeScreen } from '../screens/buyer/HomeScreen';
import { SearchScreen } from '../screens/buyer/SearchScreen';
import { BuyerCartScreen } from '../screens/buyer/BuyerCartScreen';
import { BuyerOrdersScreen } from '../screens/buyer/BuyerOrdersScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useCartStore } from '../stores/cart.store';

const Tab = createBottomTabNavigator<BuyerTabParamList>();

export const BuyerTabNavigator = () => {
  const { theme } = useThemeStore();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'BuyerHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'BuyerSearch':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'BuyerCart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'BuyerOrders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'BuyerProfile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="BuyerHome"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="BuyerSearch"
        component={SearchScreen}
        options={{ title: 'Explore' }}
      />
      <Tab.Screen
        name="BuyerCart"
        component={BuyerCartScreen}
        options={{
          title: 'Cart',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.semantic.error[500] },
        }}
      />
      <Tab.Screen
        name="BuyerOrders"
        component={BuyerOrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name="BuyerProfile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
