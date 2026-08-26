import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { OrderStatus } from '@wunabuy/types';
import { getStatusColor, getStatusLabel } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';

export interface OrderStatusStepperProps {
  status: OrderStatus;
  style?: ViewStyle;
}

const STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: OrderStatus.PAID_ESCROW, label: 'Paid in Escrow', icon: '🔒' },
  { status: OrderStatus.PREPARING, label: 'Merchant Preparing', icon: '👨‍🍳' },
  { status: OrderStatus.READY_FOR_PICKUP, label: 'Ready for Driver', icon: '📦' },
  { status: OrderStatus.EN_ROUTE, label: 'Driver En Route', icon: '🛵' },
  { status: OrderStatus.DELIVERED, label: 'Delivered', icon: '🏠' },
  { status: OrderStatus.COMPLETED, label: 'Escrow Released', icon: '🎉' },
];

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
  status,
  style,
}) => {
  const { theme } = useThemeStore();

  const getStepIndex = (currentStatus: OrderStatus): number => {
    switch (currentStatus) {
      case OrderStatus.PAID_ESCROW:
        return 0;
      case OrderStatus.PREPARING:
        return 1;
      case OrderStatus.READY_FOR_PICKUP:
        return 2;
      case OrderStatus.EN_ROUTE:
      case OrderStatus.IN_TRANSIT:
        return 3;
      case OrderStatus.DELIVERED:
      case OrderStatus.RECEIVED:
        return 4;
      case OrderStatus.COMPLETED:
        return 5;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(status);

  return (
    <View style={[styles.container, style]}>
      {STEPS.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <View key={step.status} style={styles.stepRow}>
            {/* Step Icon Indicator */}
            <View style={styles.indicatorColumn}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: isCompleted ? colors.primary[500] : theme.input,
                    borderColor: isCompleted ? colors.primary[500] : theme.border,
                  },
                ]}
              >
                <Text variant="caption" color={isCompleted ? colors.neutral[0] : theme.textSecondary}>
                  {step.icon}
                </Text>
              </View>

              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: index < activeIndex ? colors.primary[500] : theme.border },
                  ]}
                />
              )}
            </View>

            {/* Step Label */}
            <View style={styles.textColumn}>
              <Text
                variant="bodyMedium"
                bold={isCurrent}
                color={isCompleted ? (isCurrent ? colors.primary[500] : theme.text) : theme.textSecondary}
              >
                {step.label}
              </Text>
              {isCurrent && (
                <Text variant="caption" color={colors.primary[500]}>
                  Current Active Stage
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.md,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 2,
    height: 28,
    marginVertical: 2,
  },
  textColumn: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: spacing.md,
  },
});
