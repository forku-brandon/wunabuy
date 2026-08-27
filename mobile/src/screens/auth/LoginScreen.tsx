import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text, Input, Button, Toast } from '../../components/ui';
import { formatPhone, validatePhoneNumber, normalizePhone } from '@wunabuy/utils';
import { spacing, colors } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';

export const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePhoneChange = (text: string) => {
    setError('');
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
      setToastMessage('OTP code sent successfully!');
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('VerifyOTP', { phone: normalized });
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to send OTP code. Please try again.');
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            {t('auth.loginTitle')}
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
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
          containerStyle={styles.inputContainer}
        />

        <Button
          title={t('auth.sendOTP')}
          variant="primary"
          loading={loading}
          onPress={handleSubmit}
          style={styles.button}
        />
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
  },
  subtitle: {
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
});
