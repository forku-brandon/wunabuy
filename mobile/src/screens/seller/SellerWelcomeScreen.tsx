import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.base * 2;
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
    subtitle: 'Get a verified merchant store badge & list your products directly to active buyers across Cameroon.',
    iconName: 'storefront',
  },
  {
    id: 'slide_seller_2',
    badge: '100% GUARANTEED ESCROW PAYOUTS',
    badgeColor: colors.accent[500],
    title: 'Get Paid Safely, ✨\nDirect to MoMo & Bank',
    subtitle: 'Receive payouts directly into MTN MoMo, Orange Money, or Bank upon customer delivery confirmation.',
    iconName: 'wallet',
  },
  {
    id: 'slide_seller_3',
    badge: 'EXPRESS GPS LOGISTICS FLEET',
    badgeColor: colors.primary[500],
    title: 'Fast Doorstep ✨\nMotorcycle Pickup',
    subtitle: 'Automated transport riders pick up orders from your shop with live 10-second GPS tracking.',
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
      {/* Top Header Bar */}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Expanded Automated Motion Slideshow Hero Banner */}
        <View style={styles.carouselContainer}>
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
              <View style={[styles.expandedHeroSlideCard, { backgroundColor: isDark ? '#1E293B' : colors.role.seller }]}>
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

                {/* Title */}
                <Text variant="h1" bold color={colors.neutral[0]} align="center" style={styles.heroTitle}>
                  {item.title}
                </Text>

                {/* Subtitle */}
                <Text variant="bodyMedium" color="rgba(255,255,255,0.92)" align="center" style={styles.heroSubtitle}>
                  {item.subtitle}
                </Text>

                {/* Corner Icon Pill */}
                <View style={[styles.slideIconCircle, { backgroundColor: item.badgeColor }]}>
                  <Ionicons name={item.iconName} size={22} color={colors.neutral[0]} />
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
                    width: index === activeIndex ? 26 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Advanced Capsule Action Button: Get Started */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('StoreKYC')}
            style={styles.advancedGetStartedCapsule}
          >
            <View style={styles.capsuleLeftGroup}>
              <Text variant="bodyLarge" bold color={colors.neutral[0]} style={styles.capsuleBtnText}>
                Get Started Now
              </Text>
              <Text variant="caption" color="rgba(255,255,255,0.8)" style={styles.capsuleSubText}>
                4-Stage Quick Verification
              </Text>
            </View>

            <View style={styles.arrowIconCircle}>
              <Ionicons name="arrow-forward" size={20} color={colors.role.seller} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
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
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  carouselContainer: {
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  expandedHeroSlideCard: {
    width: BANNER_WIDTH,
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 320,
    position: 'relative',
    justifyContent: 'center',
    ...shadows.lg,
  },
  heroLogoRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  badgePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing.xs,
  },
  slideIconCircle: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
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
  actionSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  advancedGetStartedCapsule: {
    width: '100%',
    height: 62,
    backgroundColor: colors.role.seller,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    ...shadows.md,
  },
  capsuleLeftGroup: {
    justifyContent: 'center',
  },
  capsuleBtnText: {
    fontSize: 17,
  },
  capsuleSubText: {
    fontSize: 11,
    marginTop: 1,
  },
  arrowIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});
