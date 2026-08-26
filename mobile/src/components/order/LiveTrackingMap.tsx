import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';

export interface LiveTrackingMapProps {
  driverName?: string;
  driverPhone?: string;
  estimatedArrivalMin?: number;
  style?: ViewStyle;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  driverName = 'Samuel Mbida',
  driverPhone = '+237 675 112 233',
  estimatedArrivalMin = 15,
  style,
}) => {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      {/* Simulated Map View Canvas */}
      <View style={styles.mapCanvas}>
        <View style={styles.routeOverlay}>
          {/* Store Pin */}
          <View style={[styles.pin, styles.storePin]}>
            <Text variant="caption" color={colors.neutral[0]} bold>
              🏪 Akwa Store
            </Text>
          </View>

          {/* Dotted Route */}
          <View style={styles.routeLine} />

          {/* Moving Driver Pin */}
          <View style={[styles.pin, styles.driverPin]}>
            <Text variant="bodyMedium">🛵</Text>
            <Text variant="caption" color={colors.neutral[0]} bold style={{ marginLeft: 2 }}>
              Driver (En Route)
            </Text>
          </View>

          {/* Destination Pin */}
          <View style={[styles.pin, styles.buyerPin]}>
            <Text variant="caption" color={colors.neutral[0]} bold>
              🏠 Destination
            </Text>
          </View>
        </View>

        <View style={styles.etaBadge}>
          <Badge label={`ETA: ${estimatedArrivalMin} MINS`} variant="primary" />
        </View>
      </View>

      {/* Driver Card Info */}
      <View style={styles.driverInfoRow}>
        <View style={styles.driverAvatar}>
          <Text variant="h2">👨‍✈️</Text>
        </View>

        <View style={styles.driverText}>
          <Text variant="bodyLarge" bold>
            {driverName}
          </Text>
          <Text variant="caption" secondary>
            Verified Transporter • {driverPhone}
          </Text>
        </View>

        <View style={styles.callBadge}>
          <Text variant="bodyLarge">📞</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  mapCanvas: {
    width: '100%',
    height: 180,
    backgroundColor: '#1E293B',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  routeOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pin: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storePin: {
    backgroundColor: colors.role.seller,
  },
  driverPin: {
    backgroundColor: colors.accent[500],
  },
  buyerPin: {
    backgroundColor: colors.primary[500],
  },
  routeLine: {
    flex: 1,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.neutral[400],
    marginHorizontal: 4,
  },
  etaBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  driverText: {
    flex: 1,
  },
  callBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
