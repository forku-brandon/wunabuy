import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Button, Toast } from '../../components/ui';
import { OTPInput } from '../../components/auth/OTPInput';
import { formatPhone } from '@wunabuy/utils';
import { spacing, colors } from '@wunabuy/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SecureTokenService } from '../../services/SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../services/api';

export const PinLoginScreen = ({ navigation, route }: any) => {
  const phone = route.params?.phone ?? '+237670123456';
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePinSubmit = async (pinToSubmit = pin) => {
    if (pinToSubmit.length !== 6) {
      setError('Please enter your complete 6-digit security PIN.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.auth.loginWithPin({
        phone,
        pin: pinToSubmit,
      });

      if (!res?.success || !res?.data) {
        throw new Error(res?.error?.message || 'Invalid PIN. Please check and try again.');
      }

      const { user, access_token } = res.data;
      const refreshToken = 'sanctum_refresh_' + Date.now();

      await SecureTokenService.setTokens(access_token, refreshToken);
      setAuth(user, access_token, refreshToken);
      setLoading(false);
      setToastMessage('Authentication successful! Welcome back.');
    } catch (err: any) {
      setLoading(false);
      setError(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Incorrect 6-digit PIN. Please try again.'
      );
    }
  };

  const handlePinChange = (text: string) => {
    setError('');
    setPin(text);
    if (text.length === 6) {
      handlePinSubmit(text);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ ...styles.container, paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) }}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            Enter Security PIN
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
            Enter your 6-digit PIN for {formatPhone(phone)}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changePhoneBtn}>
            <Text variant="caption" bold color={colors.primary[500]}>
              Change Phone Number
            </Text>
          </TouchableOpacity>
        </View>

        <OTPInput
          length={6}
          value={pin}
          onChangeOTP={handlePinChange}
          disabled={loading}
          secureTextEntry={true}
        />

        {error ? (
          <Text variant="caption" color={colors.semantic.error[500]} align="center" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Button
          title="Sign In →"
          variant="primary"
          loading={loading}
          disabled={pin.length !== 6}
          onPress={() => handlePinSubmit()}
          style={styles.button}
        />
      </View>

      {toastMessage && <Toast message={toastMessage} type="info" />}
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
    marginBottom: spacing.lg,
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
  changePhoneBtn: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  error: {
    marginVertical: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
    height: 52,
  },
});
