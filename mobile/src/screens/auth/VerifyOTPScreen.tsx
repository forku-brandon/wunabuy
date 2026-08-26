import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Button, Toast } from '../../components/ui';
import { OTPInput } from '../../components/auth/OTPInput';
import { SecureTokenService } from '../../services/SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';
import { validateOTP, formatPhone } from '@wunabuy/utils';
import { spacing, colors } from '@wunabuy/design-tokens';
import { UserRole, UserStatus } from '@wunabuy/types';
import { useTranslation } from 'react-i18next';

export const VerifyOTPScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const phone = route.params?.phone ?? '+237670000000';
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 300 seconds (5 min) countdown
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!validateOTP(otp)) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock successful verification for development / UI flow
      // In production API integration: const res = await authApi.verifyOtp({ phone, otp });
      const mockUser = {
        id: 'user_uuid_12345',
        phone,
        email: null,
        full_name: 'Jean Dupont',
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        avatar_url: null,
        is_phone_verified: true,
        default_address: null,
        available_roles: [UserRole.BUYER, UserRole.SELLER],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockAccessToken = '1|sanctum_token_access_mock_12345';
      const mockRefreshToken = 'sanctum_token_refresh_mock_67890';

      // Save tokens securely
      await SecureTokenService.setTokens(mockAccessToken, mockRefreshToken);

      // Populate Zustand Auth Store
      setAuth(mockUser, mockAccessToken, mockRefreshToken);

      setLoading(false);
      // If user requires profile registration, navigate to Register; otherwise RootNavigator handles app mount
      navigation.navigate('Register', { phone });
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Invalid verification code. Please check and try again.');
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(300);
    setOtp('');
    setError('');
    setToastMessage('New verification code sent via SMS!');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h1" bold style={styles.title}>
          {t('auth.verifyOTPTitle')}
        </Text>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          {t('auth.verifyOTPSubtitle', { phone: formatPhone(phone) })}
        </Text>
      </View>

      <OTPInput value={otp} onChangeOTP={setOtp} disabled={loading} />

      {error ? (
        <Text variant="caption" color={colors.semantic.error[500]} style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Button
        title={t('auth.verify')}
        variant="primary"
        loading={loading}
        onPress={handleVerify}
        style={styles.button}
      />

      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text variant="caption" secondary>
            Resend code in {formatTimer(timer)}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text variant="bodyMedium" bold color={colors.primary[500]}>
              {t('auth.resendOTP')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
  resendContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});

