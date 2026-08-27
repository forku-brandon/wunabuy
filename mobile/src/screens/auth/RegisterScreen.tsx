import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Input, Button, Card, Toast } from '../../components/ui';
import { SecureTokenService } from '../../services/SecureTokenService';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole, UserStatus } from '@wunabuy/types';
import { colors, spacing } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';

export const RegisterScreen = ({ route }: any) => {
  const { t } = useTranslation();
  const phone = route.params?.phone ?? '+237670000000';
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BUYER);
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
      const newUser = {
        id: 'user_uuid_' + Date.now(),
        phone,
        email: null,
        full_name: fullName.trim(),
        role: selectedRole,
        status: UserStatus.ACTIVE,
        avatar_url: null,
        is_phone_verified: true,
        default_address: null,
        available_roles: [selectedRole, UserRole.BUYER],
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
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.contentBox}>
        <View style={styles.header}>
          <Text variant="h1" bold align="center" style={styles.title}>
            {t('auth.registerTitle')}
          </Text>
          <Text variant="bodyMedium" secondary align="center" style={styles.subtitle}>
            Enter your details to finalize your account registration.
          </Text>
        </View>

        <Input
          label="Full Name"
          placeholder="e.g. Jean Dupont"
          value={fullName}
          onChangeText={(text) => {
            setError('');
            setFullName(text);
          }}
          error={error}
          containerStyle={styles.inputContainer}
        />

        <Text variant="caption" bold color={colors.neutral[600]} style={styles.roleLabel}>
          {t('auth.selectRole')}
        </Text>

        {/* Buyer Role Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedRole(UserRole.BUYER)}
        >
          <Card
            style={[
              styles.roleCard,
              selectedRole === UserRole.BUYER && styles.roleCardSelected,
            ]}
          >
            <View style={styles.roleHeader}>
              <Text variant="h3" bold color={colors.primary[500]}>
                🛒 {t('roles.buyer')}
              </Text>
              <View
                style={[
                  styles.radio,
                  selectedRole === UserRole.BUYER && styles.radioSelected,
                ]}
              />
            </View>
            <Text variant="bodyMedium" secondary style={styles.roleDescription}>
              {t('auth.roleBuy')}
            </Text>
          </Card>
        </TouchableOpacity>

        {/* Seller Role Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedRole(UserRole.SELLER)}
        >
          <Card
            style={[
              styles.roleCard,
              selectedRole === UserRole.SELLER && styles.roleCardSelectedSeller,
            ]}
          >
            <View style={styles.roleHeader}>
              <Text variant="h3" bold color={colors.role.seller}>
                🏪 {t('roles.seller')}
              </Text>
              <View
                style={[
                  styles.radio,
                  selectedRole === UserRole.SELLER && styles.radioSelectedSeller,
                ]}
              />
            </View>
            <Text variant="bodyMedium" secondary style={styles.roleDescription}>
              {t('auth.roleSell')}
            </Text>
          </Card>
        </TouchableOpacity>

        <Button
          title="Complete Registration"
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
  inputContainer: {
    marginBottom: spacing.md,
  },
  roleLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  roleCard: {
    marginBottom: spacing.md,
    borderWidth: 1.5,
  },
  roleCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  roleCardSelectedSeller: {
    borderColor: colors.role.seller,
    backgroundColor: '#EFF6FF',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  roleDescription: {
    lineHeight: 18,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  radioSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  radioSelectedSeller: {
    borderColor: colors.role.seller,
    backgroundColor: colors.role.seller,
  },
  button: {
    marginTop: spacing.md,
  },
});
