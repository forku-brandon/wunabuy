import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { Text, Button } from '../ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Official Wunabuy app logo & onboarding hero images
const WUNABUY_LOGO = require('../../../assets/icon.png');
const HERO_ESCROW = require('../../../assets/onboarding/hero_escrow.jpg');
const HERO_STORES = require('../../../assets/onboarding/hero_stores.jpg');
const HERO_DELIVERY = require('../../../assets/onboarding/hero_delivery.jpg');

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  image: any;
}

const ONBOARDING_SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'No Worries! ✨\nYour Money Is Always Safe',
    subtitle:
      'Shop with complete peace of mind. We hold your payment securely until you receive, inspect, and approve your order at your door.',
    image: HERO_ESCROW,
  },
  {
    id: '2',
    title: 'Shop From Real Stores ✨\nIn Your Neighborhood',
    subtitle:
      'Discover thousands of genuine phones, electronics, fashion, and home goods from trusted local shop owners in your city.',
    image: HERO_STORES,
  },
  {
    id: '3',
    title: 'Fast Doorstep Delivery ✨\nTracked to Your Gate',
    subtitle:
      'Watch your delivery rider move on a live map in real-time as your package travels directly from the store to your hand.',
    image: HERO_DELIVERY,
  },
];

export interface WalkthroughCarouselProps {
  onComplete: () => void;
  onGetStarted?: () => void;
  onSkip?: () => void;
}

export const WalkthroughCarousel: React.FC<WalkthroughCarouselProps> = ({
  onComplete,
  onGetStarted,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();
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
    } else if (onGetStarted) {
      onGetStarted();
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Main Full-Screen 100% Background Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            {/* Full-Screen 100% Height Hero Background Image */}
            <Image source={item.image} style={styles.heroImageFull} resizeMode="cover" />

            {/* Subtle Vignette Overlay across Entire Screen */}
            <View style={styles.dimVignetteOverlay} />

            {/* Dimmed Dark Overlay Sheet Behind Text Content */}
            <View style={styles.textDimmedOverlaySheet}>
              <View style={styles.slideContentBox}>
                {/* Overlaid Headline */}
                <Text variant="h1" bold color="#FFFFFF" style={styles.slideTitle}>
                  {item.title}
                </Text>

                {/* Subtitle Description */}
                <Text variant="bodyLarge" color="rgba(255, 255, 255, 0.88)" style={styles.slideSubtitle}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Floating Header (Absolute Overlay on Top) */}
      <View style={[styles.floatingHeader, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.logoBadgePill}>
          <Image source={WUNABUY_LOGO} style={styles.logoIcon} resizeMode="contain" />
          <Text variant="bodyMedium" bold color="#FFFFFF">
            Wunabuy
          </Text>
          <View style={styles.logoTagDivider} />
          <Text variant="caption" bold color={colors.primary[400]}>
            ESCROW
          </Text>
        </View>

        {onSkip && activeIndex < ONBOARDING_SLIDES.length - 1 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSkip}
            style={styles.skipBtn}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
          >
            <Text variant="bodyMedium" bold color="rgba(255, 255, 255, 0.9)">
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fixed Bottom Action Controls (Absolute Overlay on Bottom with Safe Area Insets) */}
      <View style={[styles.bottomControlsSection, { paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl) }]}>
        {/* Sleek Horizontal Pill Indicators */}
        <View style={styles.paginationDotsRow}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => flatListRef.current?.scrollToIndex({ index, animated: true })}
            >
              <View
                style={[
                  styles.dotPill,
                  index === activeIndex ? styles.activeDotPill : styles.inactiveDotPill,
                ]}
              />
            </TouchableOpacity>
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
          style={styles.primaryCtaPillBtn}
        />

        {/* Secondary Log In Link (Elevated above bottom phone buttons) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onComplete}
          style={styles.secondaryLoginLink}
          hitSlop={{ top: 12, bottom: 12, left: 20, right: 20 }}
        >
          <Text variant="bodyMedium" align="center" color="rgba(255, 255, 255, 0.85)">
            Already have an account?{' '}
            <Text variant="bodyMedium" bold color={colors.primary[400]}>
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
    backgroundColor: '#0B1017',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logoBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 16, 23, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  logoTagDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 2,
  },
  skipBtn: {
    backgroundColor: 'rgba(11, 16, 23, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
    backgroundColor: '#0B1017',
  },
  heroImageFull: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dimVignetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 16, 23, 0.25)',
  },
  textDimmedOverlaySheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.48,
    backgroundColor: 'rgba(11, 16, 23, 0.88)',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  slideContentBox: {
    width: '100%',
  },
  slideTitle: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  slideSubtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  bottomControlsSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(11, 16, 23, 0.92)',
  },
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: spacing.lg,
    gap: 6,
  },
  dotPill: {
    height: 6,
    borderRadius: 3,
  },
  activeDotPill: {
    width: 28,
    backgroundColor: colors.primary[500],
  },
  inactiveDotPill: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryCtaPillBtn: {
    borderRadius: borderRadius.full,
    height: 54,
    marginBottom: spacing.md,
    backgroundColor: colors.primary[500],
    ...shadows.md,
  },
  secondaryLoginLink: {
    paddingVertical: spacing.sm,
  },
});
