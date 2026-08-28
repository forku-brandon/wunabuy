/**
 * TransporterWelcomeScreen.tsx
 *
 * Wunabuy Transporter Onboarding Welcome Screen.
 * Advanced, ultra-flexible, responsive layout:
 * - Clean header without logo, featuring safe back navigation & live status badge
 * - 70% automated hero benefit carousel (rotating every 3.5s across 4 benefit cards)
 * - Perfectly centered screen-width snapping (zero packed/overlapping sliders)
 * - 4-item clean transport modality grid (Bike 🏍️ • Taxi 🚕 • Van 🚐 • Plane ✈️)
 * - 20% high-end capsule CTA action container
 *
 * @author   Wunabuy Engineering Team
 * @version  2.2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text } from '../../components/ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@wunabuy/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDESHOW_HEIGHT = Math.max(SCREEN_HEIGHT * 0.52, 360);

export interface TransporterSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  statHighlight: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
}

const TRANSPORTER_SLIDES: TransporterSlide[] = [
  {
    id: 'slide_transporter_1',
    badge: 'HIGH EARNINGS',
    badgeColor: colors.role.transporter,
    title: 'Earn on Every Trip, ✨\n1,500 – 3,500 XAF/Drop',
    subtitle: 'Get matched with high-volume merchant pickup and delivery jobs across Douala & Yaoundé with flexible hours.',
    statHighlight: 'Avg. 35K XAF/Day',
    iconName: 'bicycle',
  },
  {
    id: 'slide_transporter_2',
    badge: 'DIGITAL CASHOUT',
    badgeColor: colors.accent[500],
    title: 'Instant Daily Payouts, ✨\nDirect to MoMo & Orange',
    subtitle: 'Withdraw your driver earnings directly to MTN Mobile Money (*126#) or Orange Money (#150*50#) anytime with zero delay.',
    statHighlight: 'Instant MoMo/OM',
    iconName: 'wallet',
  },
  {
    id: 'slide_transporter_3',
    badge: 'SMART GPS ROUTING',
    badgeColor: colors.primary[500],
    title: 'Live GPS Navigation, ✨\nOptimized Drop-Offs',
    subtitle: 'Turn-by-turn route directions from verified merchant stores to buyer doorsteps with automated mileage bonuses.',
    statHighlight: '10s GPS Refresh',
    iconName: 'navigate',
  },
  {
    id: 'slide_transporter_4',
    badge: 'VERIFIED FLEET',
    badgeColor: '#6366F1',
    title: 'Verified Rider Badge, ✨\nPriority Job Dispatch',
    subtitle: 'Join Cameroon’s premier verified logistics network and receive priority high-value merchant dispatch requests.',
    statHighlight: 'Priority Dispatch',
    iconName: 'shield-checkmark',
  },
];

interface TransportMode {
  id: string;
  label: string;
  subLabel: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  bgColorLight: string;
  bgColorDark: string;
}

const TRANSPORT_MODES: TransportMode[] = [
  {
    id: 'bike',
    label: 'Bike',
    subLabel: 'Moto-Taxi',
    iconName: 'bicycle',
    iconColor: colors.role.transporter,
    bgColorLight: '#FEF3C7',
    bgColorDark: 'rgba(245, 158, 11, 0.18)',
  },
  {
    id: 'taxi',
    label: 'Taxi',
    subLabel: 'Cab / Sedan',
    iconName: 'car-sport',
    iconColor: colors.role.seller,
    bgColorLight: '#EFF6FF',
    bgColorDark: 'rgba(37, 99, 235, 0.18)',
  },
  {
    id: 'van',
    label: 'Van',
    subLabel: 'Cargo / Bus',
    iconName: 'bus',
    iconColor: colors.primary[500],
    bgColorLight: '#CCFBF1',
    bgColorDark: 'rgba(13, 148, 136, 0.18)',
  },
  {
    id: 'plane',
    label: 'Plane',
    subLabel: 'Air Cargo',
    iconName: 'airplane',
    iconColor: '#8B5CF6',
    bgColorLight: '#F5F3FF',
    bgColorDark: 'rgba(139, 92, 246, 0.18)',
  },
];

export const TransporterWelcomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();
  const { setActiveRole } = useAuthStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Safe Back Navigation Handler (prevents GO_BACK unhandled warnings)
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      setActiveRole(UserRole.BUYER);
      navigation.reset({
        index: 0,
        routes: [{ name: 'BuyerApp' }],
      });
    }
  };

  // Automated Slideshow Motion Effect (Rotates every 3.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % TRANSPORTER_SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header Bar (~10% Height) — Clean, Modern, Logo-Free */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Live Network Status Badge */}
        <View
          style={[
            styles.networkBadge,
            {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
            },
          ]}
        >
          <View style={styles.pulseDot} />
          <Text variant="caption" bold color={colors.role.transporter} style={styles.networkBadgeText}>
            TRANSPORTER FLEET
          </Text>
        </View>
      </View>

      {/* Main Body Container */}
      <View style={styles.mainBodyContainer}>
        {/* 70% Automated Hero Benefit Carousel */}
        <View style={styles.slideshowContainer}>
          <FlatList
            ref={flatListRef}
            data={TRANSPORTER_SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={styles.slideOuterContainer}>
                <View
                  style={[
                    styles.slideCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                    },
                  ]}
                >
                  {/* Decorative background glow circles */}
                  <View
                    style={[
                      styles.glowCircle1,
                      {
                        backgroundColor: isDark
                          ? 'rgba(245, 158, 11, 0.10)'
                          : 'rgba(245, 158, 11, 0.06)',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.glowCircle2,
                      {
                        backgroundColor: isDark
                          ? 'rgba(13, 148, 136, 0.08)'
                          : 'rgba(13, 148, 136, 0.04)',
                      },
                    ]}
                  />

                  {/* Top Badge & Stat Pill Row */}
                  <View style={styles.slideHeaderRow}>
                    <View
                      style={[
                        styles.slideBadge,
                        {
                          backgroundColor: item.badgeColor + '18',
                          borderColor: item.badgeColor + '35',
                        },
                      ]}
                    >
                      <Ionicons name="sparkles" size={11} color={item.badgeColor} />
                      <Text
                        variant="caption"
                        bold
                        color={item.badgeColor}
                        numberOfLines={1}
                        style={styles.badgeLabel}
                      >
                        {item.badge}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statPill,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9',
                          borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                        },
                      ]}
                    >
                      <Ionicons name="shield-checkmark" size={11} color={colors.role.transporter} />
                      <Text
                        variant="caption"
                        bold
                        color={isDark ? colors.neutral[200] : colors.neutral[800]}
                        numberOfLines={1}
                        style={styles.statLabel}
                      >
                        {item.statHighlight}
                      </Text>
                    </View>
                  </View>

                  {/* Icon Circle with Glowing Border */}
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isDark
                          ? 'rgba(245, 158, 11, 0.14)'
                          : 'rgba(245, 158, 11, 0.08)',
                        borderColor: item.badgeColor,
                      },
                    ]}
                  >
                    <Ionicons name={item.iconName} size={36} color={item.badgeColor} />
                  </View>

                  {/* Title & Subtitle */}
                  <View style={styles.textContainer}>
                    <Text variant="h2" bold style={styles.slideTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <Text variant="bodyMedium" secondary style={styles.slideSubtitle} numberOfLines={3}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Active Carousel Dot Indicators */}
          <View style={styles.dotsRow}>
            {TRANSPORTER_SLIDES.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    isActive
                      ? [styles.activeDot, { backgroundColor: colors.role.transporter }]
                      : { backgroundColor: isDark ? colors.neutral[700] : '#CBD5E1' },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* ── Four Transport Modalities Bar (Bike, Taxi, Van, Plane) ──────── */}
        <View style={styles.transportModesContainer}>
          <View style={styles.modesRow}>
            {TRANSPORT_MODES.map((mode) => (
              <View
                key={mode.id}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                  },
                ]}
              >
                <View
                  style={[
                    styles.modeIconCircle,
                    {
                      backgroundColor: isDark ? mode.bgColorDark : mode.bgColorLight,
                    },
                  ]}
                >
                  <Ionicons name={mode.iconName} size={22} color={mode.iconColor} />
                </View>
                <Text variant="caption" bold color={theme.text} numberOfLines={1} style={styles.modeTitle}>
                  {mode.label}
                </Text>
                <Text variant="caption" secondary numberOfLines={1} style={styles.modeSubTitle}>
                  {mode.subLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 20% Bottom Action Container (High-End Capsule Button) */}
        <View
          style={[
            styles.actionContainer,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xs, spacing.md),
              backgroundColor: theme.background,
            },
          ]}
        >
          {/* Main Capsule CTA Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('TransporterKYC')}
            style={[styles.capsuleBtn, { backgroundColor: colors.role.transporter }]}
          >
            <Text variant="bodyLarge" bold color={colors.neutral[0]} style={styles.capsuleBtnText}>
              Start Driver Verification
            </Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={18} color={colors.role.transporter} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.role.transporter,
    marginRight: 6,
  },
  networkBadgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  mainBodyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  slideshowContainer: {
    height: SLIDESHOW_HEIGHT,
    justifyContent: 'center',
  },
  slideOuterContainer: {
    width: SCREEN_WIDTH,
    height: SLIDESHOW_HEIGHT - 26,
    paddingHorizontal: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideCard: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  glowCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -40,
    right: -40,
  },
  glowCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -30,
    left: -30,
  },
  slideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.xs,
  },
  slideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexShrink: 1,
    maxWidth: '52%',
  },
  badgeLabel: {
    marginLeft: 4,
    fontSize: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexShrink: 1,
    maxWidth: '46%',
  },
  statLabel: {
    marginLeft: 4,
    fontSize: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
  },
  slideTitle: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 4,
    fontSize: 18,
  },
  slideSubtitle: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
    fontSize: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  activeDot: {
    width: 22,
    height: 7,
    borderRadius: 3.5,
  },
  transportModesContainer: {
    paddingHorizontal: spacing.base,
    marginVertical: spacing.xs,
  },
  modesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  modeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 12,
    lineHeight: 15,
  },
  modeSubTitle: {
    fontSize: 9,
    marginTop: 1,
  },
  actionContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  capsuleBtn: {
    height: 52,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    ...shadows.md,
  },
  capsuleBtnText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
