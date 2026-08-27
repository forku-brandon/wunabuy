import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuyerTabParamList } from './types';
import { useThemeStore } from '../stores/theme.store';
import { colors, shadows } from '@wunabuy/design-tokens';
import { HomeScreen } from '../screens/buyer/HomeScreen';
import { SearchScreen } from '../screens/buyer/SearchScreen';
import { BuyerCartScreen } from '../screens/buyer/BuyerCartScreen';
import { BuyerOrdersScreen } from '../screens/buyer/BuyerOrdersScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useCartStore } from '../stores/cart.store';

const Tab = createBottomTabNavigator<BuyerTabParamList>();

export const BuyerTabNavigator = () => {
  const { theme, isDark } = useThemeStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const insets = useSafeAreaInsets();

  const bottomInset = insets.bottom > 0 ? insets.bottom : 10;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E07A5F',
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: isDark ? theme.border : 'transparent',
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'BuyerHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'BuyerSearch':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'BuyerCart':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'BuyerOrders':
              iconName = focused ? 'bag-handle' : 'bag-handle-outline';
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
        options={{ title: 'Categories' }}
      />
      <Tab.Screen
        name="BuyerCart"
        component={BuyerCartScreen}
        options={{
          title: 'Wishlist',
          tabBarBadge: itemCount > 0 ? itemCount : 2,
          tabBarBadgeStyle: { backgroundColor: '#E07A5F' },
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
