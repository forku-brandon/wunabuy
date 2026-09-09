import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Input, Button, Toast } from '../../components/ui';
import { normalizePhone, validatePhoneNumber } from '@wunabuy/utils';
import { spacing, colors, borderRadius } from '@wunabuy/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../services/api';

export const LoginScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const initialMode: 'register' | 'login' = route.params?.mode ?? 'login';
  const [authMode, setAuthMode] = useState<'register' | 'login'>(initialMode);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePhoneChange = (text: string) => {
    setError('');
    setPhone(text);
  };

  const handleSubmit = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    const normalized = normalizePhone(phone);
    // Flexible validation for local 9-digit or full E.164 phone numbers
    if (normalized.length < 10) {
      setError('Please enter a valid 9-digit phone number (e.g. 670 123 456)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const checkRes = await api.auth.checkPhone(normalized);
      const isRegistered = checkRes?.data?.is_registered ?? false;

      if (authMode === 'register') {
        if (isRegistered) {
          setLoading(false);
          setError('An account with this phone number already exists. Please sign in instead.');
          return;
        }
        setLoading(false);
        navigation.navigate('Register', { phone: normalized });
      } else {
        if (!isRegistered) {
          setLoading(false);
          setError('No account found for this phone number. Please create an account first.');
          return;
        }
        setLoading(false);
        navigation.navigate('PinLogin', { phone: normalized });
      }
    } catch {
      setLoading(false);
      if (authMode === 'register') {
        navigation.navigate('Register', { phone: normalized });
      } else {
        navigation.navigate('PinLogin', { phone: normalized });
      }
    }
  };

  const isRegister = authMode === 'register';

  return (
    <ScreenContainer contentContainerStyle={{ ...styles.container, paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) }}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
            {isRegister
              ? 'Enter your mobile phone number to set up your account and 6-digit PIN.'
              : 'Enter your registered mobile phone number to log into your account.'}
          </Text>
        </View>

        <Input
          label="Mobile Phone Number *"
          placeholder="670 123 456 or +237 6XX XXX XXX"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={handlePhoneChange}
          error={error}
          autoFocus
          containerStyle={styles.inputContainer}
        />

        <Button
          title={isRegister ? 'Continue to Registration →' : 'Continue to PIN →'}
          variant="primary"
          loading={loading}
          onPress={handleSubmit}
          style={styles.button}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setError('');
            setAuthMode(isRegister ? 'login' : 'register');
          }}
          style={styles.switchModeBtn}
        >
          <Text variant="bodyMedium" bold align="center" color={colors.primary[500]}>
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create an Account"}
          </Text>
        </TouchableOpacity>
      </View>

      {toastMessage && <Toast message={toastMessage} type="success" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  contentBox: {
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.xs,
    fontSize: 26,
  },
  subtitle: {
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.xs,
    height: 52,
  },
  switchModeBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
});
