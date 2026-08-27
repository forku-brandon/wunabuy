import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.base * 2;

export interface HeroSlide {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide_1',
    badge: '100% ESCROW GUARANTEE',
    badgeColor: colors.primary[500],
    title: 'Shop Safely, ✨\nBuy Confidently',
    subtitle: 'Your money stays 100% safe in 48-hour escrow protection until delivery is signed.',
    ctaText: 'Explore Escrow',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'slide_2',
    badge: 'VERIFIED LOCAL STORES',
    badgeColor: colors.primary[600],
    title: 'Glow Naturally, ✨\nShine Beautifully',
    subtitle: 'Explore our premium beauty, electronics & verified collection from local store owners.',
    ctaText: 'Shop Now',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'slide_3',
    badge: 'EXPRESS GPS DELIVERY',
    badgeColor: colors.accent[500],
    title: 'Fast Doorstep ✨\nGPS Delivery',
    subtitle: 'Track your transport provider live with 10-second GPS breadcrumb updates.',
    ctaText: 'Track Live',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  },
];

export interface HeroCarouselProps {
  onPressBanner: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onPressBanner }) => {
  const { theme, isDark } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % HERO_SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4500);

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
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={HERO_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH,
          offset: BANNER_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.heroCard, { backgroundColor: isDark ? '#1E293B' : colors.primary[50] }]}>
            {/* Left Content Column */}
            <View style={styles.textCol}>
              <View style={styles.badgePill}>
                <Text variant="caption" bold color={item.badgeColor || colors.primary[500]} style={styles.badgeText}>
                  {item.badge}
                </Text>
              </View>

              <Text variant="h1" bold style={styles.title}>
                {item.title}
              </Text>

              <Text variant="caption" secondary numberOfLines={2} style={styles.subtitle}>
                {item.subtitle}
              </Text>

              {/* White Oval CTA Button with Teal Arrow */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPressBanner}
                style={styles.ctaBtn}
              >
                <Text variant="caption" bold color={colors.neutral[900]} style={styles.ctaText}>
                  {item.ctaText}
                </Text>
                <View style={styles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={12} color={colors.neutral[0]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Right Product Image */}
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* Pagination Indicator Dots */}
      <View style={styles.paginationDots}>
        {HERO_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? colors.primary[500] : theme.border,
                width: index === activeIndex ? 18 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    position: 'relative',
  },
  heroCard: {
    width: BANNER_WIDTH,
    borderRadius: 24,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 185,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  textCol: {
    flex: 1.2,
    paddingRight: spacing.xs,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: spacing.md,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 11,
    marginRight: spacing.xs,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 105,
    height: 125,
    borderRadius: 16,
    marginLeft: spacing.xs,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
