import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Badge } from '../ui';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const RoleSwitcherCard: React.FC = () => {
  const { user, activeRole, setActiveRole } = useAuthStore();
  const { theme } = useThemeStore();

  const availableRoles = user?.available_roles ?? [UserRole.BUYER];

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.SELLER:
        return {
          title: 'Seller (Store Owner)',
          icon: '🏪',
          color: colors.role.seller,
          bg: '#EFF6FF',
        };
      case UserRole.TRANSPORTER:
        return {
          title: 'Transport Driver',
          icon: '🚚',
          color: colors.role.transporter,
          bg: '#FFFBEB',
        };
      case UserRole.BUYER:
      default:
        return {
          title: 'Buyer (Customer)',
          icon: '🛒',
          color: colors.primary[500],
          bg: colors.primary[50],
        };
    }
  };

  const activeConfig = getRoleConfig(activeRole);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text variant="h3" bold>
            Active Role Context
          </Text>
          <Badge
            label={activeRole.toUpperCase()}
            variant={
              activeRole === UserRole.BUYER
                ? 'primary'
                : activeRole === UserRole.SELLER
                ? 'info'
                : 'warning'
            }
          />
        </View>
        <Text variant="caption" secondary style={styles.subtitle}>
          Tap any available role below to switch workspace navigation instantly.
        </Text>
      </View>

      <View style={styles.rolesList}>
        {availableRoles.map((role) => {
          const config = getRoleConfig(role);
          const isActive = role === activeRole;

          return (
            <TouchableOpacity
              key={role}
              activeOpacity={0.8}
              onPress={() => setActiveRole(role)}
              style={[
                styles.roleItem,
                { borderColor: isActive ? config.color : theme.border },
                isActive && { backgroundColor: config.bg },
              ]}
            >
              <Text variant="bodyLarge" style={styles.roleIcon}>
                {config.icon}
              </Text>

              <View style={styles.roleInfo}>
                <Text variant="bodyMedium" bold color={isActive ? config.color : theme.text}>
                  {config.title}
                </Text>
                {isActive && (
                  <Text variant="caption" color={config.color}>
                    Currently Active Workspace
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.radio,
                  { borderColor: isActive ? config.color : theme.border },
                  isActive && { backgroundColor: config.color },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 16,
  },
  rolesList: {
    gap: spacing.sm,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  roleIcon: {
    marginRight: spacing.md,
    fontSize: 20,
  },
  roleInfo: {
    flex: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
});
