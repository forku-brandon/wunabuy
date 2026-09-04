import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Button, Toast } from '../../components/ui';
import { OTPInput } from '../../components/auth/OTPInput';
import { validateOTP, formatPhone } from '@wunabuy/utils';
import { spacing, colors } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SecureTokenService } from '../../services/SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole, UserStatus } from '@wunabuy/types';

export const VerifyOTPScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const phone = route.params?.phone ?? '+237670000000';
  const mode: 'register' | 'login' = route.params?.mode ?? 'login';
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 300 seconds (5 min)
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
      if (mode === 'register') {
        // Phone number verified -> Move to user profile setup (name & address)
        setLoading(false);
        setToastMessage('Phone number verified!');
        setTimeout(() => {
          navigation.navigate('Register', { phone });
        }, 400);
      } else {
        // Login mode -> Authenticate existing user directly
        const authenticatedUser = {
          id: 'user_' + phone.replace(/[^0-9]/g, ''),
          phone: phone,
          email: 'user@wunabuy.com',
          full_name: 'Jean Dupont',
          role: UserRole.BUYER,
          status: UserStatus.ACTIVE,
          avatar_url: null,
          is_phone_verified: true,
          default_address: {
            id: 'addr_default',
            label: 'Home',
            latitude: 4.0510564,
            longitude: 9.7678687,
            address_text: 'Rue Joss, Akwa',
            city: 'Douala',
            is_default: true,
          },
          available_roles: [UserRole.BUYER],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const accessToken = '1|sanctum_token_access_mock_' + Date.now();
        const refreshToken = 'sanctum_token_refresh_mock_' + Date.now();

        await SecureTokenService.setTokens(accessToken, refreshToken);
        setAuth(authenticatedUser, accessToken, refreshToken);
        setLoading(false);
        setToastMessage('Phone verified! Logged into account.');
      }
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
    <ScreenContainer contentContainerStyle={{ ...styles.container, paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) }}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            {t('auth.verifyOTPTitle')}
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
            {t('auth.verifyOTPSubtitle', { phone: formatPhone(phone) })}
          </Text>
        </View>

        <OTPInput value={otp} onChangeOTP={setOtp} disabled={loading} />

        {error ? (
          <Text variant="caption" color={colors.semantic.error[500]} align="center" style={styles.error}>
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
            <Text variant="caption" secondary align="center">
              Resend code in {formatTimer(timer)}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text variant="bodyMedium" bold color={colors.primary[500]} align="center">
                {t('auth.resendOTP')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  },
  subtitle: {
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  error: {
    marginVertical: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  resendContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
