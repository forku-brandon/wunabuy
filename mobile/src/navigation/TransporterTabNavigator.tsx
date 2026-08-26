import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TransporterTabParamList } from './types';
import { ScreenContainer, Text, Button } from '../components/ui';
import { useThemeStore } from '../stores/theme.store';
import { useAuthStore } from '../stores/auth.store';
import { colors } from '@wunabuy/design-tokens';
import { UserRole } from '@wunabuy/types';

const Tab = createBottomTabNavigator<TransporterTabParamList>();

const TransporterJobsScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Delivery Jobs</Text>
    <Text variant="bodyMedium" secondary>Available nearby pickup and drop-off offers</Text>
  </ScreenContainer>
);

const TransporterActiveTripScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Active Delivery</Text>
    <Text variant="bodyMedium" secondary>Google Maps turn-by-turn navigation and breadcrumbs</Text>
  </ScreenContainer>
);

const TransporterEarningsScreen = () => (
  <ScreenContainer>
    <Text variant="h1" bold>Earnings & Mileage</Text>
    <Text variant="bodyMedium" secondary>Completed deliveries and daily revenue</Text>
  </ScreenContainer>
);

const TransporterProfileScreen = () => {
  const { setActiveRole } = useAuthStore();
  return (
    <ScreenContainer>
      <Text variant="h1" bold>Driver Profile</Text>
      <Text variant="bodyMedium" secondary style={{ marginBottom: 16 }}>Vehicle verification & role switching</Text>
      <Button
        title="Switch to Buyer Role"
        variant="outline"
        onPress={() => setActiveRole(UserRole.BUYER)}
      />
    </ScreenContainer>
  );
};

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
      <Tab.Screen name="TransporterProfile" component={TransporterProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
