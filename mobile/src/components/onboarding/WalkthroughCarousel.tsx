import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
} from 'react-native';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text, Button } from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  iconName: string;
}

const ONBOARDING_SLIDES: SlideItem[] = [
  {
    id: '1',
    badge: '100% Escrow Protection',
    badgeColor: colors.semantic.success[500],
    title: 'Your Money Stays Safe Until Delivery Is Verified',
    subtitle:
      'Payment is locked in escrow until you receive your order, inspect the goods, and sign the delivery proof.',
    iconName: 'shield-checkmark',
  },
  {
    id: '2',
    badge: 'Verified Merchants',
    badgeColor: colors.primary[500],
    title: 'Browse Thousands of Storefront Items Near You',
    subtitle:
      'Search electronics, fashion, food, and home goods from KYC-verified local stores in your city.',
    iconName: 'storefront',
  },
  {
    id: '3',
    badge: 'Real-Time Delivery',
    badgeColor: colors.accent[500],
    title: 'Track Your Driver Live on Google Maps',
    subtitle:
      'Watch your transport provider in real-time with 10-second GPS breadcrumb updates from store to doorstep.',
    iconName: 'navigate',
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
  const { theme } = useThemeStore();
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
    <View style={styles.container}>
      <View style={styles.topBar}>
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
            <View
              style={[
                styles.illustrationBox,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: item.badgeColor },
                ]}
              >
                <Text variant="caption" bold color={colors.neutral[0]}>
                  {item.badge}
                </Text>
              </View>
            </View>

            <Text variant="h1" bold align="center" style={styles.title}>
              {item.title}
            </Text>

            <Text
              variant="bodyMedium"
              secondary
              align="center"
              style={styles.subtitle}
            >
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex ? colors.primary[500] : theme.border,
                  width: index === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={
            activeIndex === ONBOARDING_SLIDES.length - 1
              ? 'Get Started'
              : 'Next'
          }
          variant="primary"
          onPress={handleNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationBox: {
    width: SCREEN_WIDTH - 80,
    height: 220,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  badgePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    lineHeight: 22,
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
});
