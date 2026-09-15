import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Input, Button } from '../../components/ui';
import { SecureTokenService } from '../../services/SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole, UserStatus, Address } from '@wunabuy/types';
import { spacing, colors, shadows } from '@wunabuy/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/theme.store';
import { LegalTermsModal, LegalDocType } from '../../components/legal/LegalTermsModal';

import { api } from '../../services/api';

export const RegisterScreen = ({ navigation, route }: any) => {
  const phone = route.params?.phone ?? '+237670000000';
  const { setAuth } = useAuthStore();
  const { isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalDocType>('terms');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openLegalModal = (tab: LegalDocType) => {
    setLegalModalTab(tab);
    setLegalModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!pin || pin.length !== 6) {
      setError('Please enter a complete 6-digit security PIN.');
      return;
    }

    if (pin !== confirmPin) {
      setError('The security PINs do not match. Please check and re-enter.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must read and agree to the Terms of Service and Privacy Policy to register.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.auth.register({
        phone,
        full_name: fullName.trim(),
        role: 'buyer',
        pin: pin.trim(),
        address_text: addressText.trim() || undefined,
        terms_accepted: true,
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
            Enter your name, optional delivery address, and set a 6-digit PIN to secure your account.
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
          error={error && !fullName.trim() ? error : undefined}
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

        <Input
          label="Create 6-Digit Security PIN *"
          placeholder="••••••"
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          value={pin}
          onChangeText={(text) => {
            setError('');
            setPin(text.replace(/[^0-9]/g, ''));
          }}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Confirm 6-Digit Security PIN *"
          placeholder="••••••"
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          value={confirmPin}
          onChangeText={(text) => {
            setError('');
            setConfirmPin(text.replace(/[^0-9]/g, ''));
          }}
          containerStyle={styles.inputContainer}
        />

        {/* Legal Agreement Checkbox (Google Play Store Compliance) */}
        <View style={styles.termsWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setError('');
              setAgreedToTerms(!agreedToTerms);
            }}
            style={styles.checkboxRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            accessibilityLabel="Agree to Terms of Service and Privacy Policy"
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: agreedToTerms
                    ? colors.primary[500]
                    : isDark
                    ? colors.neutral[600]
                    : colors.neutral[300],
                  backgroundColor: agreedToTerms
                    ? colors.primary[500]
                    : isDark
                    ? colors.neutral[800]
                    : '#FFFFFF',
                },
              ]}
            >
              {agreedToTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>

            <View style={styles.termsTextContainer}>
              <Text variant="caption" style={[styles.termsText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                I have read and agree to Wunabuy's{' '}
                <Text
                  variant="caption"
                  bold
                  style={[styles.termsLink, { color: colors.primary[500] }]}
                  onPress={() => openLegalModal('terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  variant="caption"
                  bold
                  style={[styles.termsLink, { color: colors.primary[500] }]}
                  onPress={() => openLegalModal('privacy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {error ? (
          <Text variant="caption" color={colors.semantic.error[500]} align="center" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <Button
          title="Create Account & Log In →"
          variant="primary"
          loading={loading}
          disabled={!agreedToTerms && !loading}
          onPress={handleSubmit}
          style={styles.button}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login', { mode: 'login' })}
          style={styles.signInLink}
        >
          <Text variant="bodyMedium" bold align="center" color={colors.primary[500]}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Google Play Compliant Legal Document Viewer */}
      <LegalTermsModal
        visible={legalModalVisible}
        initialTab={legalModalTab}
        onClose={() => setLegalModalVisible(false)}
        showAcceptButton={!agreedToTerms}
        onAccept={() => {
          setAgreedToTerms(true);
          setError('');
        }}
      />
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
    marginBottom: spacing.md,
  },
  termsWrapper: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: spacing.sm,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    lineHeight: 19,
    fontSize: 12.5,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  errorText: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.xs,
    height: 52,
  },
  signInLink: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
});
