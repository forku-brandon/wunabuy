import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Badge } from '../ui';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@wunabuy/types';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface RoleSwitcherCardProps {
  navigation?: any;
}

export const RoleSwitcherCard: React.FC<RoleSwitcherCardProps> = ({ navigation }) => {
  const { user, activeRole, setActiveRole } = useAuthStore();
  const { theme, isDark } = useThemeStore();

  // ONLY display roles that have been approved by Wunabuy Staff and present in available_roles
  const availableRoles = [...new Set(user?.available_roles ?? [UserRole.BUYER])] as UserRole[];

  const isSellerApproved = availableRoles.includes(UserRole.SELLER);
  const isTransporterApproved = availableRoles.includes(UserRole.TRANSPORTER);

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.SELLER:
        return {
          title: 'Seller (Store Owner)',
          subtitle: 'Manage products, inventory & store orders',
          iconName: 'storefront-outline' as const,
          color: colors.role.seller,
          bg: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF',
        };
      case UserRole.TRANSPORTER:
        return {
          title: 'Transport Driver',
          subtitle: 'Accept dispatch offers & delivery routes',
          iconName: 'car-sport-outline' as const,
          color: colors.role.transporter,
          bg: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB',
        };
      case UserRole.BUYER:
      default:
        return {
          title: 'Buyer (Customer)',
          subtitle: 'Discover products, escrow orders & wallet',
          iconName: 'cart-outline' as const,
          color: colors.primary[500],
          bg: isDark ? 'rgba(13,148,136,0.15)' : colors.primary[50],
        };
    }
  };

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
          {availableRoles.length > 1
            ? 'Tap an authorized role below to switch your workspace navigation.'
            : 'Your account is currently active in Buyer workspace mode.'}
        </Text>
      </View>

      {/* Approved Roles List (Transporter and Seller hidden until approved by Staff API) */}
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
                {
                  borderColor: isActive ? config.color : theme.border,
                  backgroundColor: isActive ? config.bg : theme.card,
                },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: isActive ? config.color : isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Ionicons
                  name={config.iconName}
                  size={18}
                  color={isActive ? colors.neutral[0] : theme.textSecondary}
                />
              </View>

              <View style={styles.roleInfo}>
                <Text variant="bodyMedium" bold color={isActive ? config.color : theme.text}>
                  {config.title}
                </Text>
                <Text variant="caption" secondary numberOfLines={1}>
                  {isActive ? '● Currently Active Workspace' : config.subtitle}
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  { borderColor: isActive ? config.color : theme.border },
                  isActive && { backgroundColor: config.color },
                ]}
              >
                {isActive && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Staff Verification & Unlock Notice (shown if Seller or Transporter are not yet unlocked) */}
      {(!isSellerApproved || !isTransporterApproved) && (
        <View
          style={[
            styles.verificationBanner,
            { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: theme.border },
          ]}
        >
          <View style={styles.verificationHeaderRow}>
            <Ionicons name="shield-checkmark" size={15} color={colors.primary[500]} style={{ marginRight: 6 }} />
            <Text variant="caption" bold color={colors.primary[600]}>
              Staff Approval Required for Additional Roles
            </Text>
          </View>
          <Text variant="caption" secondary style={styles.verificationText}>
            Seller and Transporter workspace roles are restricted to verified accounts. Once approved by Wunabuy Staff, their workspace switchers will automatically unlock above.
          </Text>

          {navigation && (
            <View style={styles.actionButtonsRow}>
              {!isSellerApproved && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('SellerWelcome')}
                  style={[styles.miniApplyBtn, { borderColor: colors.role.seller }]}
                >
                  <Text variant="caption" bold color={colors.role.seller}>
                    + Apply to Sell
                  </Text>
                </TouchableOpacity>
              )}

              {!isTransporterApproved && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('TransporterWelcome')}
                  style={[styles.miniApplyBtn, { borderColor: colors.role.transporter, marginLeft: 8 }]}
                >
                  <Text variant="caption" bold color={colors.role.transporter}>
                    + Apply as Driver
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
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
    padding: spacing.md - 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  roleInfo: {
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  verificationBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  verificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verificationText: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  miniApplyBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
});
