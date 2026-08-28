/**
 * TransporterWelcomeScreen.tsx
 *
 * Wunabuy Transporter Onboarding Welcome Screen.
 * Advanced UI / UX architecture:
 * - Clean header without logo, featuring safe back navigation & live status badge
 * - 70% automated hero benefit carousel (rotating every 3.5s across 4 benefit cards)
 * - Fleet statistics banner (★ 4.9 Fleet Rating • 2,400+ Active Riders)
 * - 3-pillar quick perks bar (⚡ 10s Dispatch • 💰 Daily MoMo • 🛡️ Trip Insured)
 * - 20% high-end capsule CTA action container
 *
 * @author   Wunabuy Engineering Team
 * @version  2.0.0
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
const BANNER_WIDTH = SCREEN_WIDTH - spacing.base * 2;
const SLIDESHOW_HEIGHT = Math.max(SCREEN_HEIGHT * 0.58, 400);

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
    badge: 'HIGH-VOLUME EARNINGS',
    badgeColor: colors.role.transporter,
    title: 'Earn on Every Trip, ✨\n1,500 – 3,500 XAF/Drop',
    subtitle: 'Get matched with high-volume merchant pickup and delivery jobs across Douala & Yaoundé with flexible hours.',
    statHighlight: 'Avg. 35,000 XAF / Day',
    iconName: 'bicycle',
  },
  {
    id: 'slide_transporter_2',
    badge: 'INSTANT DIGITAL CASHOUT',
    badgeColor: colors.accent[500],
    title: 'Instant Daily Payouts, ✨\nDirect to MoMo & Orange',
    subtitle: 'Withdraw your driver earnings directly to MTN Mobile Money (*126#) or Orange Money (#150*50#) anytime with zero delay.',
    statHighlight: '100% Guaranteed Payouts',
    iconName: 'wallet',
  },
  {
    id: 'slide_transporter_3',
    badge: 'SMART GPS TURN-BY-TURN',
    badgeColor: colors.primary[500],
    title: 'Live GPS Navigation, ✨\nOptimized Drop-Offs',
    subtitle: 'Turn-by-turn route directions from verified merchant stores to buyer doorsteps with automated mileage bonuses.',
    statHighlight: '10-Second GPS Refresh',
    iconName: 'navigate',
  },
  {
    id: 'slide_transporter_4',
    badge: 'OFFICIAL FLEET VERIFICATION',
    badgeColor: '#6366F1',
    title: 'Verified Rider Badge, ✨\nPriority Job Dispatch',
    subtitle: 'Join Cameroon’s premier verified logistics network and receive priority high-value merchant dispatch requests.',
    statHighlight: 'Priority Order Matching',
    iconName: 'shield-checkmark',
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

      {/* Main Body Container: 70% Slideshow / 20% Action Split */}
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
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item }) => (
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
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(245, 158, 11, 0.08)',
                    },
                  ]}
                />
                <View
                  style={[
                    styles.glowCircle2,
                    {
                      backgroundColor: isDark
                        ? 'rgba(13, 148, 136, 0.08)'
                        : 'rgba(13, 148, 136, 0.05)',
                    },
                  ]}
                />

                {/* Top Badge & Stat Pill */}
                <View style={styles.slideHeaderRow}>
                  <View style={[styles.slideBadge, { backgroundColor: item.badgeColor + '20' }]}>
                    <Text variant="caption" bold color={item.badgeColor}>
                      {item.badge}
                    </Text>
                  </View>

                  <View style={[styles.statPill, { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
                    <Ionicons name="sparkles" size={12} color={colors.accent[500]} />
                    <Text variant="caption" bold color={theme.text} style={{ marginLeft: 4 }}>
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
                        ? 'rgba(245, 158, 11, 0.16)'
                        : 'rgba(245, 158, 11, 0.10)',
                      borderColor: item.badgeColor,
                    },
                  ]}
                >
                  <Ionicons name={item.iconName} size={46} color={item.badgeColor} />
                </View>

                {/* Title & Subtitle */}
                <Text variant="h1" bold style={styles.slideTitle}>
                  {item.title}
                </Text>

                <Text variant="bodyMedium" secondary style={styles.slideSubtitle}>
                  {item.subtitle}
                </Text>
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

        {/* 3-Pillar Quick Perks Bar */}
        <View style={styles.perksRow}>
          <View style={[styles.perkItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="flash-outline" size={15} color={colors.accent[500]} />
            <Text variant="caption" bold style={styles.perkText}>
              10s Dispatch
            </Text>
          </View>

          <View style={[styles.perkItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="cash-outline" size={15} color={colors.semantic.success[500]} />
            <Text variant="caption" bold style={styles.perkText}>
              Daily MoMo
            </Text>
          </View>

          <View style={[styles.perkItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="shield-checkmark-outline" size={15} color={colors.primary[500]} />
            <Text variant="caption" bold style={styles.perkText}>
              Trip Insured
            </Text>
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

          {/* Guarantee / Vehicle Scope Footnote */}
          <View style={styles.guaranteeRow}>
            <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success[500]} />
            <Text variant="caption" secondary style={styles.guaranteeText}>
              Motorcycle, Car, Van &amp; Bicycle riders welcome in Douala &amp; Yaoundé
            </Text>
          </View>
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
  flatListContent: {
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
  slideCard: {
    width: BANNER_WIDTH,
    height: SLIDESHOW_HEIGHT - 32,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  glowCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -40,
    right: -40,
  },
  glowCircle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: -30,
    left: -30,
  },
  slideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  slideBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  slideTitle: {
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.xs,
    fontSize: 22,
  },
  slideSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  perksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    gap: spacing.xs + 2,
  },
  perkItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 4,
    ...shadows.sm,
  },
  perkText: {
    fontSize: 11,
  },
  actionContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  capsuleBtn: {
    height: 54,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    ...shadows.md,
  },
  capsuleBtnText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs + 2,
  },
  guaranteeText: {
    fontSize: 11,
  },
});
