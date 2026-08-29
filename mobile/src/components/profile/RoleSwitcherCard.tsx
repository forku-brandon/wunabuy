import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Badge } from '../ui';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@wunabuy/types';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { AuthService } from '../../services/api';

export interface RoleSwitcherCardProps {
  navigation?: any;
}

export const RoleSwitcherCard: React.FC<RoleSwitcherCardProps> = ({ navigation }) => {
  const { user, activeRole, setActiveRole } = useAuthStore();
  const { theme, isDark } = useThemeStore();

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    AuthService.switchRole(role);
    if (navigation) {
      if (role === UserRole.SELLER) {
        navigation.navigate('SellerApp');
      } else if (role === UserRole.TRANSPORTER) {
        navigation.navigate('TransporterApp');
      } else {
        navigation.navigate('BuyerApp');
      }
    }
  };

  // Always provide Buyer and Seller workspaces for testing and direct switching
  const availableRoles: UserRole[] = [UserRole.BUYER, UserRole.SELLER];
  if ((user as any)?.is_transporter_approved || (user?.role === UserRole.TRANSPORTER && user?.available_roles?.includes(UserRole.TRANSPORTER))) {
    availableRoles.push(UserRole.TRANSPORTER);
  }

  const isSellerApproved = true;
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
            : 'Your account is currently active in default Buyer workspace mode.'}
        </Text>
      </View>

      {/* Active Approved Roles (Seller & Transporter hidden until backend approval) */}
      <View style={styles.rolesList}>
        {availableRoles.map((role) => {
          const config = getRoleConfig(role);
          const isActive = role === activeRole;

          return (
            <TouchableOpacity
              key={role}
              activeOpacity={0.8}
              onPress={() => handleRoleSelect(role)}
              style={[
                styles.roleItem,
                {
                  borderColor: isActive ? config.color : theme.border,
                  backgroundColor: isActive ? config.bg : theme.card,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isActive
                      ? config.color
                      : isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                  },
                ]}
              >
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

      {/* Staff Verification & Apply for Additional Roles Section */}
      {(!isSellerApproved || !isTransporterApproved) && (
        <View
          style={[
            styles.verificationBanner,
            { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.border },
          ]}
        >
          <View style={styles.verificationHeaderRow}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary[500]} style={{ marginRight: 6 }} />
            <Text variant="bodyMedium" bold color={colors.primary[600]}>
              Staff Approval Required for Additional Roles
            </Text>
          </View>
          <Text variant="caption" secondary style={styles.verificationText}>
            Seller and Transporter workspace roles are restricted to verified accounts. Apply below to submit your documents. Once approved by Wunabuy Staff via API, the role switch button will automatically appear in your active roles above.
          </Text>

          {navigation && (
            <View style={styles.actionButtonsCol}>
              {/* Apply to Sell Button */}
              {!isSellerApproved && (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => navigation.navigate('SellerWelcome')}
                  style={[styles.applyCardBtn, { borderColor: colors.role.seller }]}
                >
                  <View style={[styles.applyIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="storefront" size={18} color={colors.role.seller} />
                  </View>
                  <View style={styles.applyTextCol}>
                    <Text variant="bodyMedium" bold color={colors.role.seller}>
                      Apply to Sell (Store Owner)
                    </Text>
                    <Text variant="caption" secondary>
                      Register your merchant store &amp; list products
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.role.seller} />
                </TouchableOpacity>
              )}

              {/* Apply to Transport Button */}
              {!isTransporterApproved && (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => navigation.navigate('TransporterWelcome')}
                  style={[styles.applyCardBtn, { borderColor: colors.role.transporter, marginTop: spacing.xs }]}
                >
                  <View style={[styles.applyIconCircle, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="car-sport" size={18} color={colors.role.transporter} />
                  </View>
                  <View style={styles.applyTextCol}>
                    <Text variant="bodyMedium" bold color={colors.role.transporter}>
                      Apply to Transport (Driver)
                    </Text>
                    <Text variant="caption" secondary>
                      Register your vehicle &amp; accept delivery dispatches
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.role.transporter} />
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
    borderRadius: borderRadius.xl,
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
    marginBottom: spacing.sm,
  },
  actionButtonsCol: {
    gap: spacing.xs,
  },
  applyCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  applyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  applyTextCol: {
    flex: 1,
  },
});
