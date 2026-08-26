import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.role.transporter,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen name="TransporterJobs" component={TransporterJobsScreen} options={{ title: 'Jobs' }} />
      <Tab.Screen name="TransporterActiveTrip" component={TransporterActiveTripScreen} options={{ title: 'Active Trip' }} />
      <Tab.Screen name="TransporterEarnings" component={TransporterEarningsScreen} options={{ title: 'Earnings' }} />
      <Tab.Screen name="TransporterProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
