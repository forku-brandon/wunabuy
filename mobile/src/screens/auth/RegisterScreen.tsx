import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Input, Button, Card, Toast } from '../../components/ui';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useTranslation } from 'react-i18next';

export const RegisterScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const phone = route.params?.phone ?? '+237670000000';
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
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
      // In production: await authApi.register({ phone, full_name: fullName, role: selectedRole });
      updateUser({
        full_name: fullName.trim(),
        role: selectedRole,
        available_roles: [selectedRole, UserRole.BUYER],
      });

      setLoading(false);
      // Navigation will be automatically updated by RootNavigator as user is authenticated
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to complete registration.');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h1" bold style={styles.title}>
          {t('auth.registerTitle')}
        </Text>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          Tell us your name and how you plan to use Wunabuy.
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
  roleLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
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
    marginTop: spacing.lg,
  },
});

