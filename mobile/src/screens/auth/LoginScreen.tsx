import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text, Input, Button, Toast } from '../../components/ui';
import { formatPhone, validatePhoneNumber, normalizePhone } from '@wunabuy/utils';
import { spacing } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';

export const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePhoneChange = (text: string) => {
    setError('');
    // Auto-format for display
    setPhone(text);
  };

  const handleSubmit = async () => {
    const normalized = normalizePhone(phone);
    if (!validatePhoneNumber(normalized)) {
      setError('Please enter a valid Cameroon phone number (+237 6XX XXX XXX)');
      return;
    }

    setLoading(true);
    try {
      // In production API integration: await authApi.login({ phone: normalized });
      setToastMessage('OTP code sent successfully!');
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('VerifyOTP', { phone: normalized });
      }, 800);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to send OTP code. Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h1" bold style={styles.title}>
          {t('auth.loginTitle')}
        </Text>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          {t('auth.loginSubtitle')}
        </Text>
      </View>

      <Input
        label="Phone Number"
        placeholder="+237 6XX XXX XXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={handlePhoneChange}
        error={error}
        autoFocus
      />

      <Button
        title={t('auth.sendOTP')}
        variant="primary"
        loading={loading}
        onPress={handleSubmit}
        style={styles.button}
      />

      {toastMessage && <Toast message={toastMessage} type="success" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.md,
  },
});

