import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { ScreenContainer, Text, Button } from '../components/ui';
import { useThemeStore } from '../stores/theme.store';
import { spacing } from '@wunabuy/design-tokens';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Placeholder screen for Welcome
const WelcomeScreen = ({ navigation }: any) => {
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <Text variant="display" bold align="center" style={styles.title}>
        Wunabuy
      </Text>
      <Text variant="bodyLarge" secondary align="center" style={styles.subtitle}>
        Escrow-Protected E-Commerce & Logistics Marketplace
      </Text>
      <Button
        title="Get Started"
        onPress={() => navigation.navigate('Login')}
        style={styles.button}
      />
    </ScreenContainer>
  );
};

// Placeholder screen for Login
const LoginScreen = ({ navigation }: any) => {
  return (
    <ScreenContainer>
      <Text variant="h1" bold style={styles.title}>
        Enter Your Phone
      </Text>
      <Text variant="bodyMedium" secondary style={styles.subtitle}>
        We will send a 6-digit OTP code to verify your phone number.
      </Text>
      <Button
        title="Send OTP Code"
        onPress={() => navigation.navigate('VerifyOTP', { phone: '+237670000000' })}
        style={styles.button}
      />
    </ScreenContainer>
  );
};

// Placeholder screen for Verify OTP
const VerifyOTPScreen = ({ navigation, route }: any) => {
  return (
    <ScreenContainer>
      <Text variant="h1" bold style={styles.title}>
        Verify Code
      </Text>
      <Text variant="bodyMedium" secondary style={styles.subtitle}>
        Sent to {route.params?.phone ?? '+237 6XX XXX XXX'}
      </Text>
      <Button
        title="Verify & Continue"
        onPress={() => navigation.navigate('Register', { phone: route.params?.phone })}
        style={styles.button}
      />
    </ScreenContainer>
  );
};

// Placeholder screen for Register
const RegisterScreen = () => {
  return (
    <ScreenContainer>
      <Text variant="h1" bold style={styles.title}>
        Complete Profile
      </Text>
      <Text variant="bodyMedium" secondary style={styles.subtitle}>
        Enter your details to finalize your account registration.
      </Text>
    </ScreenContainer>
  );
};

export const AuthNavigator = () => {
  const { theme } = useThemeStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.md,
  },
});

