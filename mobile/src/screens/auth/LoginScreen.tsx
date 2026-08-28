import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Input, Button, Toast } from '../../components/ui';
import { normalizePhone, validatePhoneNumber } from '@wunabuy/utils';
import { spacing, colors, borderRadius } from '@wunabuy/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LoginScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePhoneChange = (text: string) => {
    setError('');
    setPhone(text);
  };

  const handleQuickDemo = () => {
    setError('');
    setPhone('670123456');
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
      setToastMessage('OTP verification code sent!');
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('VerifyOTP', { phone: normalized });
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to send OTP code. Please try again.');
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ ...styles.container, paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['3xl']) }}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            Enter Phone Number
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
            Enter your mobile number to log in or create your Wunabuy escrow account.
          </Text>
        </View>

        <Input
          label="Mobile Phone Number"
          placeholder="670 123 456 or +237 6XX XXX XXX"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={handlePhoneChange}
          error={error}
          autoFocus
          containerStyle={styles.inputContainer}
        />

        {/* Quick Demo Fill Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={handleQuickDemo} style={styles.demoFillBtn}>
          <Text variant="caption" bold color={colors.primary[500]}>
            💡 Auto-fill Demo Number (+237 670 123 456)
          </Text>
        </TouchableOpacity>

        <Button
          title="Send Verification Code →"
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
    fontSize: 26,
  },
  subtitle: {
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  demoFillBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  button: {
    marginTop: spacing.xs,
    height: 52,
  },
});
