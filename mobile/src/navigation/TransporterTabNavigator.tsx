import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransporterTabParamList } from './types';
import { useThemeStore } from '../stores/theme.store';
import { colors } from '@wunabuy/design-tokens';
import { TransporterJobsScreen } from '../screens/transporter/TransporterJobsScreen';
import { TransporterActiveTripScreen } from '../screens/transporter/TransporterActiveTripScreen';
import { TransporterEarningsScreen } from '../screens/transporter/TransporterEarningsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TransporterTabParamList>();

export const TransporterTabNavigator = () => {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.role.transporter,
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
            case 'TransporterJobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'TransporterActiveTrip':
              iconName = focused ? 'car' : 'car-outline';
              break;
            case 'TransporterEarnings':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'TransporterProfile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TransporterJobs" component={TransporterJobsScreen} options={{ title: 'Job Feed' }} />
      <Tab.Screen name="TransporterActiveTrip" component={TransporterActiveTripScreen} options={{ title: 'Active Trip' }} />
      <Tab.Screen name="TransporterEarnings" component={TransporterEarningsScreen} options={{ title: 'Earnings' }} />
      <Tab.Screen name="TransporterProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
