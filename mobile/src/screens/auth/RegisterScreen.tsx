import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text, Input, Button } from '../../components/ui';
import { SecureTokenService } from '../../services/SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole, UserStatus, Address } from '@wunabuy/types';
import { spacing, colors } from '@wunabuy/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      let defaultAddress: Address | null = null;
      if (addressText.trim()) {
        defaultAddress = {
          id: 'addr_' + Date.now(),
          label: 'Home',
          latitude: 4.0510564,
          longitude: 9.7678687,
          address_text: addressText.trim(),
          city: 'Douala',
          is_default: true,
        };
      }

      const newUser = {
        id: 'user_uuid_' + Date.now(),
        phone,
        email: null,
        full_name: fullName.trim(),
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        avatar_url: null,
        is_phone_verified: true,
        default_address: defaultAddress,
        available_roles: [UserRole.BUYER],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const accessToken = '1|sanctum_token_access_mock_' + Date.now();
      const refreshToken = 'sanctum_token_refresh_mock_' + Date.now();

      await SecureTokenService.setTokens(accessToken, refreshToken);
      setAuth(newUser, accessToken, refreshToken);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to complete registration.');
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ ...styles.container, paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) }}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            Enter Your Details
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
            Welcome to Wunabuy! Enter your name to start buying safely with 48h escrow protection.
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
          title="Complete & Go to Home →"
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
