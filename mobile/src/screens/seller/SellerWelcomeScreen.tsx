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

export interface SellerSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
}

const SELLER_SLIDES: SellerSlide[] = [
  {
    id: 'slide_seller_1',
    badge: 'VERIFIED MERCHANT BADGE',
    badgeColor: colors.role.seller,
    title: 'Grow Your Store, ✨\nReach 50,000+ Buyers',
    subtitle: 'Get a verified merchant store badge & list your products directly to active buyers across Cameroon with guaranteed trust.',
    iconName: 'storefront',
  },
  {
    id: 'slide_seller_2',
    badge: '100% GUARANTEED ESCROW PAYOUTS',
    badgeColor: colors.accent[500],
    title: 'Get Paid Safely, ✨\nDirect to MoMo & Bank',
    subtitle: 'Receive instant payouts directly into MTN MoMo, Orange Money, or Bank upon customer delivery confirmation.',
    iconName: 'wallet',
  },
  {
    id: 'slide_seller_3',
    badge: 'EXPRESS GPS LOGISTICS FLEET',
    badgeColor: colors.primary[500],
    title: 'Fast Doorstep ✨\nMotorcycle Pickup',
    subtitle: 'Automated transport riders pick up orders from your shop with live 10-second GPS tracking to your customer.',
    iconName: 'car',
  },
  {
    id: 'slide_seller_4',
    badge: 'MOBILE INVENTORY & REVENUE ANALYTICS',
    badgeColor: '#6366F1',
    title: 'Smart Mobile ✨\nStock & Sales Tracking',
    subtitle: 'Manage products, stock alerts, order tracking & daily revenues easily right from your smartphone.',
    iconName: 'bar-chart',
  },
];

export const SellerWelcomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Automated Slideshow Motion Effect (Rotates every 3.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SELLER_SLIDES.length;
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
        <Text variant="h1" bold style={styles.headerTitle}>
          Become a Seller
        </Text>
      </View>

      <View style={styles.bodyContainer}>
        {/* Expanded Automated Motion Slideshow Hero Banner (70% Height Section) */}
        <View style={styles.slideshowSection70}>
          <FlatList
            ref={flatListRef}
            data={SELLER_SLIDES}
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
              <View
                style={[
                  styles.expanded70HeroSlideCard,
                  { backgroundColor: isDark ? '#1E293B' : colors.role.seller, height: SLIDESHOW_HEIGHT },
                ]}
              >
                {/* Logo Ring Header */}
                <View style={styles.heroLogoRing}>
                  <Image source={WUNABUY_LOGO} style={styles.logoImage} resizeMode="contain" />
                </View>

                {/* Badge Pill */}
                <View style={styles.badgePill}>
                  <Text variant="caption" bold color={item.badgeColor} style={styles.badgeText}>
                    {item.badge}
                  </Text>
                </View>

                {/* Slide Title */}
                <Text variant="h1" bold color={colors.neutral[0]} align="center" style={styles.heroTitle}>
                  {item.title}
                </Text>

                {/* Slide Subtitle */}
                <Text variant="bodyMedium" color="rgba(255,255,255,0.92)" align="center" style={styles.heroSubtitle}>
                  {item.subtitle}
                </Text>

                {/* Top Corner Icon Badge */}
                <View style={[styles.slideIconCircle, { backgroundColor: item.badgeColor }]}>
                  <Ionicons name={item.iconName} size={24} color={colors.neutral[0]} />
                </View>
              </View>
            )}
          />

          {/* Animated Slide Pagination Indicators */}
          <View style={styles.paginationDots}>
            {SELLER_SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === activeIndex ? colors.role.seller : theme.border,
                    width: index === activeIndex ? 28 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Advanced Capsule Action Button (20% Height Section) */}
        <View style={styles.actionSection20}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('StoreKYC')}
            style={styles.advancedGetStartedCapsule}
          >
            <View style={styles.capsuleLeftGroup}>
              <Text variant="bodyLarge" bold color={colors.neutral[0]} style={styles.capsuleBtnText}>
                Get Started Now
              </Text>
              <Text variant="caption" color="rgba(255,255,255,0.85)" style={styles.capsuleSubText}>
                4-Stage Quick Verification
              </Text>
            </View>

            <View style={styles.arrowIconCircle}>
              <Ionicons name="arrow-forward" size={22} color={colors.role.seller} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: 22,
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: spacing.base,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  slideshowSection70: {
    flex: 0.72,
    justifyContent: 'center',
  },
  expanded70HeroSlideCard: {
    width: BANNER_WIDTH,
    borderRadius: 32,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.xl,
  },
  heroLogoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  badgePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  slideIconCircle: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  actionSection20: {
    flex: 0.22,
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  advancedGetStartedCapsule: {
    width: '100%',
    height: 66,
    backgroundColor: colors.role.seller,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    ...shadows.lg,
  },
  capsuleLeftGroup: {
    justifyContent: 'center',
  },
  capsuleBtnText: {
    fontSize: 18,
  },
  capsuleSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  arrowIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});
