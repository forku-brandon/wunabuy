import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text, Input, Button } from '../../components/ui';
import { SecureTokenService } from '../../services/SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole, UserStatus, Address } from '@wunabuy/types';
import { spacing, colors } from '@wunabuy/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../services/api';

export const RegisterScreen = ({ route }: any) => {
  const phone = route.params?.phone ?? '+237670000000';
  const { setAuth } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.auth.register({
        phone,
        full_name: fullName.trim(),
        role: 'buyer',
        address_text: addressText.trim() || undefined,
      });

      if (!res?.success || !res?.data) {
        throw new Error(res?.error?.message || 'Failed to complete registration.');
      }

      const { user, access_token } = res.data;
      const refreshToken = 'sanctum_refresh_' + Date.now();

      await SecureTokenService.setTokens(access_token, refreshToken);
      setAuth(user, access_token, refreshToken);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to complete registration.');
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ ...styles.container, paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) }}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            Complete Your Profile
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
            Enter your name and optional delivery address to finish setting up your account.
          </Text>
        </View>

        <Input
          label="Full Name *"
          placeholder="e.g. Jean Dupont"
          value={fullName}
          onChangeText={(text) => {
            setError('');
            setFullName(text);
          }}
          error={error}
          containerStyle={styles.inputContainer}
          autoFocus
        />

        <Input
          label="Delivery Address (Optional)"
          placeholder="e.g. Rue Joss, Akwa, Douala"
          value={addressText}
          onChangeText={setAddressText}
          containerStyle={styles.inputContainer}
        />

        <Button
          title="Complete Registration & Log In →"
          variant="primary"
          loading={loading}
          onPress={handleSubmit}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: spacing.xl,
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
    marginTop: spacing.md,
    height: 52,
  },
});
