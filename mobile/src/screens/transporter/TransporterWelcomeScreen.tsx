/**
 * TransporterWelcomeScreen.tsx
 *
 * Wunabuy Transporter Onboarding Welcome Screen.
 * Matches the exact high-converting UX pattern established in SellerWelcomeScreen:
 * - 70% automated hero benefit carousel (rotating every 3.5s across 4 benefit cards)
 * - 20% high-end capsule CTA action container
 * - 10% header with back button and brand badge
 *
 * @author   Wunabuy Engineering Team
 * @version  1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text } from '../../components/ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.base * 2;
const SLIDESHOW_HEIGHT = Math.max(SCREEN_HEIGHT * 0.62, 420); // Takes 70% of main screen body
const WUNABUY_LOGO = require('../../../assets/icon.png');

export interface TransporterSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
}

const TRANSPORTER_SLIDES: TransporterSlide[] = [
  {
    id: 'slide_transporter_1',
    badge: 'INSTANT DELIVERY EARNINGS',
    badgeColor: colors.role.transporter,
    title: 'Earn on Every Trip, ✨\n1,500 – 3,500 XAF/Drop',
    subtitle: 'Get matched with high-volume merchant pickup and delivery jobs across Douala & Yaoundé with flexible hours.',
    iconName: 'bicycle',
  },
  {
    id: 'slide_transporter_2',
    badge: '100% DIRECT MOMO & ORANGE PAYOUTS',
    badgeColor: colors.accent[500],
    title: 'Instant Daily Cashout, ✨\nZero Delay to Wallet',
    subtitle: 'Withdraw your driver earnings directly to MTN Mobile Money (*126#) or Orange Money (#150*50#) at any time.',
    iconName: 'wallet',
  },
  {
    id: 'slide_transporter_3',
    badge: 'SMART GPS TURN-BY-TURN ROUTING',
    badgeColor: colors.primary[500],
    title: 'Live GPS Navigation, ✨\nOptimized Drop-Offs',
    subtitle: 'Turn-by-turn route directions from verified merchant stores to buyer doorsteps with automated mileage pay.',
    iconName: 'navigate',
  },
  {
    id: 'slide_transporter_4',
    badge: 'VERIFIED LOGISTICS FLEET BADGE',
    badgeColor: '#6366F1',
    title: 'Official Rider Badge, ✨\nPriority Job Dispatch',
    subtitle: 'Join Cameroon’s premier verified logistics network and receive priority high-value merchant dispatch requests.',
    iconName: 'shield-checkmark',
  },
];

export const TransporterWelcomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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
      {/* Top Header Bar (~10% Height) */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <Image source={WUNABUY_LOGO} style={styles.logoIcon} resizeMode="contain" />
          <View style={styles.badgePill}>
            <Text variant="caption" bold color={colors.role.transporter}>
              TRANSPORTER PORTAL 🛵
            </Text>
          </View>
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
                {/* Decorative background glow circle */}
                <View
                  style={[
                    styles.glowCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(245, 158, 11, 0.08)',
                    },
                  ]}
                />

                {/* Top Badge */}
                <View style={[styles.slideBadge, { backgroundColor: item.badgeColor + '20' }]}>
                  <Text variant="caption" bold color={item.badgeColor}>
                    {item.badge}
                  </Text>
                </View>

                {/* Big Animated Icon */}
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(245, 158, 11, 0.10)',
                      borderColor: item.badgeColor,
                    },
                  ]}
                >
                  <Ionicons name={item.iconName} size={48} color={item.badgeColor} />
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

        {/* 20% Bottom Action Container (High-End Capsule Button) */}
        <View
          style={[
            styles.actionContainer,
            {
              paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl),
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

          {/* Guarantee / Terms Footnote */}
          <View style={styles.guaranteeRow}>
            <Ionicons name="shield-checkmark" size={15} color={colors.semantic.success[500]} />
            <Text variant="caption" secondary style={styles.guaranteeText}>
              Motorcycle, Car, Van &amp; Bicycle logistics welcome across Cameroon
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoIcon: {
    width: 28,
    height: 28,
  },
  badgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
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
    height: SLIDESHOW_HEIGHT - 40,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  glowCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -40,
    right: -40,
  },
  slideBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  slideTitle: {
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  slideSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
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
  actionContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  capsuleBtn: {
    height: 56,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm + 2,
  },
  guaranteeText: {
    fontSize: 11,
  },
});

