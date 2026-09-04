import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';

export interface LiveTrackingMapProps {
  driverName?: string;
  driverPhone?: string;
  driverRating?: string;
  estimatedArrivalMin?: number;
  distanceKm?: number;
  style?: ViewStyle;
  onCallDriver?: () => void;
  onMessageDriver?: () => void;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  driverName = 'Jean-Paul Mbida',
  driverPhone = '+237 675 112 233',
  driverRating = '4.9 ★',
  estimatedArrivalMin = 8,
  distanceKm = 1.8,
  style,
  onCallDriver,
  onMessageDriver,
}) => {
  const { theme, isDark } = useThemeStore();

  const handleCall = () => {
    if (onCallDriver) {
      onCallDriver();
    } else if (driverPhone) {
      const firstNumber = driverPhone.split('/')[0].split(',')[0].trim();
      const cleaned = firstNumber.replace(/[^+\d]/g, '');
      if (cleaned) {
        Linking.openURL(`tel:${cleaned}`).catch(() => {});
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      {/* Advanced Interactive Map Canvas */}
      <View style={styles.mapCanvas}>
        {/* Map Grid Pattern Lines */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />

        {/* Live GPS Route Curve Line */}
        <View style={styles.routePathContainer}>
          <View style={styles.routeSolidLine} />
          <View style={styles.routeDottedLine} />
        </View>

        {/* Top ETA & Distance Floating Pill */}
        <View style={styles.topEtaFloatingBadge}>
          <View style={styles.livePulseDot} />
          <Text variant="caption" bold color={colors.neutral[0]} style={styles.etaText}>
            LIVE GPS • {estimatedArrivalMin} MINS ({distanceKm} km away)
          </Text>
        </View>

        {/* 1. Merchant Store Pin (Origin) */}
        <View style={[styles.mapMarker, styles.storeMarkerPosition]}>
          <View style={styles.storeMarkerBubble}>
            <Ionicons name="storefront" size={14} color={colors.neutral[0]} style={{ marginRight: 3 }} />
            <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 10 }}>
              Akwa Hub
            </Text>
          </View>
          <View style={styles.markerPinTailStore} />
        </View>

        {/* 2. Live Moving Motorcycle Transporter Marker (Middle) */}
        <View style={[styles.mapMarker, styles.driverMarkerPosition]}>
          <View style={styles.driverMarkerBubble}>
            <Text style={{ fontSize: 14, marginRight: 3 }}>🛵</Text>
            <View>
              <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 10 }}>
                Rider (24 km/h)
              </Text>
              <Text variant="caption" color={colors.neutral[0]} style={{ fontSize: 8 }}>
                En Route
              </Text>
            </View>
          </View>
          <View style={styles.markerPinTailDriver} />
        </View>

        {/* 3. Buyer Doorstep Destination Pin (End) */}
        <View style={[styles.mapMarker, styles.buyerMarkerPosition]}>
          <View style={styles.buyerMarkerBubble}>
            <Ionicons name="location" size={14} color={colors.neutral[0]} style={{ marginRight: 3 }} />
            <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 10 }}>
              Your Doorstep
            </Text>
          </View>
          <View style={styles.markerPinTailBuyer} />
        </View>
      </View>

      {/* Driver Contact Card */}
      <View style={[styles.driverCardRow, { backgroundColor: theme.card }]}>
        <View style={[styles.driverAvatarCircle, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
          <Text style={{ fontSize: 24 }}>👨‍✈️</Text>
        </View>

        <View style={styles.driverTextCol}>
          <View style={styles.driverNameRow}>
            <Text variant="bodyLarge" bold numberOfLines={1}>
              {driverName}
            </Text>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color="#F59E0B" style={{ marginRight: 2 }} />
              <Text variant="caption" bold color={colors.neutral[900]} style={{ fontSize: 10 }}>
                {driverRating}
              </Text>
            </View>
          </View>

          <Text variant="caption" secondary numberOfLines={1}>
            Verified Motorcycle Rider • {driverPhone}
          </Text>
        </View>

        {/* Action Buttons: Call & Message */}
        <View style={styles.driverActionsGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCall}
            style={[styles.actionCircleBtn, { backgroundColor: colors.semantic.success[50] }]}
          >
            <Ionicons name="call" size={18} color={colors.semantic.success[700]} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onMessageDriver}
            style={[styles.actionCircleBtn, { backgroundColor: colors.primary[50] }]}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary[500]} />
          </TouchableOpacity>
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
    ...shadows.sm,
  },
  mapCanvas: {
    width: '100%',
    height: 210,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  routePathContainer: {
    position: 'absolute',
    top: '52%',
    left: '12%',
    right: '12%',
    height: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeSolidLine: {
    width: '50%',
    height: 3,
    backgroundColor: colors.primary[500],
  },
  routeDottedLine: {
    width: '50%',
    height: 3,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.accent[500],
  },
  topEtaFloatingBadge: {
    position: 'absolute',
    top: spacing.sm + 2,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.success[500],
    marginRight: 6,
  },
  etaText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  storeMarkerPosition: {
    top: '36%',
    left: '6%',
  },
  storeMarkerBubble: {
    backgroundColor: colors.role.seller,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  markerPinTailStore: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.role.seller,
  },
  driverMarkerPosition: {
    top: '28%',
    left: '42%',
  },
  driverMarkerBubble: {
    backgroundColor: colors.accent[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  markerPinTailDriver: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent[500],
  },
  buyerMarkerPosition: {
    top: '40%',
    right: '6%',
  },
  buyerMarkerBubble: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  markerPinTailBuyer: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary[500],
  },
  driverCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  driverAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  driverTextCol: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  driverActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  actionCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
