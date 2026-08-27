import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text, Button } from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Official Wunabuy app icon
const WUNABUY_LOGO = require('../../../assets/icon.png');

export interface SlideItem {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  secondaryPillText: string;
}

const ONBOARDING_SLIDES: SlideItem[] = [
  {
    id: '1',
    badge: '100% ESCROW PROTECTION',
    badgeColor: colors.semantic.success[700],
    badgeBg: colors.semantic.success[50],
    title: 'Your Money Stays Safe Until Delivery Is Verified',
    subtitle:
      'Payments are held securely in 48-hour escrow. Merchants only receive funds after you receive, inspect, and sign for your order.',
    iconName: 'shield-checkmark-sharp',
    iconColor: colors.primary[500],
    iconBg: colors.primary[50],
    secondaryPillText: '🔒 48h Escrow Guarantee',
  },
  {
    id: '2',
    badge: 'VERIFIED LOCAL MERCHANTS',
    badgeColor: colors.role.seller,
    badgeBg: '#EFF6FF',
    title: 'Shop Directly From Verified Local Stores',
    subtitle:
      'Browse thousands of electronics, fashion items, food, and home goods from KYC-verified store owners in your city.',
    iconName: 'storefront-sharp',
    iconColor: colors.role.seller,
    iconBg: '#DBEAFE',
    secondaryPillText: '🏬 100% Verified Stores',
  },
  {
    id: '3',
    badge: 'REAL-TIME LIVE GPS',
    badgeColor: '#B45309',
    badgeBg: '#FFFBEB',
    title: 'Track Your Driver Live to Your Doorstep',
    subtitle:
      'Watch your transport provider in real-time with 10-second GPS breadcrumb updates from pickup to final hand-off.',
    iconName: 'location-sharp',
    iconColor: colors.accent[500],
    iconBg: '#FEF3C7',
    secondaryPillText: '📍 Live GPS Tracking',
  },
];

export interface WalkthroughCarouselProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const WalkthroughCarousel: React.FC<WalkthroughCarouselProps> = ({
  onComplete,
  onSkip,
}) => {
  const { theme, isDark } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (activeIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header with Official Wunabuy Logo */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <Image source={WUNABUY_LOGO} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.brandTitleCol}>
            <Text variant="h2" bold color={colors.primary[500]}>
              Wunabuy
            </Text>
            <Text variant="caption" secondary style={styles.tagline}>
              ESCROW MARKETPLACE
            </Text>
          </View>
        </View>

        {onSkip && activeIndex < ONBOARDING_SLIDES.length - 1 && (
          <Button
            title="Skip"
            variant="ghost"
            size="small"
            fullWidth={false}
            onPress={onSkip}
          />
        )}
      </View>

      {/* Main Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Contextual Illustration Card */}
            <View
              style={[
                styles.illustrationBox,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                !isDark && shadows.md,
              ]}
            >
              {/* Outer Decorative Ring */}
              <View style={[styles.outerRing, { backgroundColor: item.iconBg }]}>
                {/* Central Feature Icon */}
                <View style={[styles.iconCircle, { backgroundColor: item.iconColor }]}>
                  <Ionicons name={item.iconName} size={48} color={colors.neutral[0]} />
                </View>
              </View>

              {/* Floating Context Badges */}
              <View style={styles.badgeRow}>
                <View style={[styles.badgePill, { backgroundColor: item.badgeBg, borderColor: item.badgeColor }]}>
                  <Text variant="caption" bold color={item.badgeColor}>
                    {item.badge}
                  </Text>
                </View>
              </View>

              <View style={styles.secondaryPillContainer}>
                <Text variant="caption" bold color={theme.textSecondary}>
                  {item.secondaryPillText}
                </Text>
              </View>
            </View>

            {/* Slide Title */}
            <Text variant="h1" bold align="center" style={styles.title}>
              {item.title}
            </Text>

            {/* Slide Subtitle */}
            <Text variant="bodyLarge" secondary align="center" style={styles.subtitle}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* Footer Navigation & CTA */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? colors.primary[500] : theme.border,
                  width: index === activeIndex ? 28 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Primary CTA Button */}
        <Button
          title={
            activeIndex === ONBOARDING_SLIDES.length - 1
              ? 'Get Started →'
              : 'Continue →'
          }
          variant="primary"
          onPress={handleNext}
          style={styles.mainCtaBtn}
        />

        {/* Quick Log In Option */}
        <TouchableOpacity activeOpacity={0.8} onPress={onComplete} style={styles.loginLink}>
          <Text variant="bodyMedium" align="center" secondary>
            Already have an account?{' '}
            <Text variant="bodyMedium" bold color={colors.primary[500]}>
              Log In
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    height: 60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
  },
  brandTitleCol: {
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 0.8,
    marginTop: -2,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationBox: {
    width: SCREEN_WIDTH - 48,
    height: 250,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  outerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  badgeRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  badgePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  secondaryPillContainer: {
    position: 'absolute',
    bottom: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  title: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    lineHeight: 30,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
    marginHorizontal: 4,
  },
  mainCtaBtn: {
    marginBottom: spacing.md,
  },
  loginLink: {
    paddingVertical: spacing.xs,
  },
});
