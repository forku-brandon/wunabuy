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
import { ScreenContainer, Text, Card, Button } from '../../components/ui';
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
    badge: '100% VERIFIED MERCHANT STORE',
    badgeColor: colors.role.seller,
    title: 'Grow Your Store, ✨\nReach 50,000+ Buyers',
    subtitle: 'Get a verified merchant badge & list your products directly to active buyers across Cameroon.',
    iconName: 'storefront',
  },
  {
    id: 'slide_seller_2',
    badge: 'GUARANTEED ESCROW PAYOUTS',
    badgeColor: colors.accent[500],
    title: 'Get Paid Safely, ✨\nDirect to MoMo & Bank',
    subtitle: 'Your funds are 100% protected in escrow and cashed out directly to MTN MoMo, Orange Money or Bank.',
    iconName: 'wallet',
  },
  {
    id: 'slide_seller_3',
    badge: 'EXPRESS LOGISTICS FLEET',
    badgeColor: colors.primary[500],
    title: 'Fast Doorstep ✨\nMotorcycle Pickup',
    subtitle: 'Automated transport riders pick up orders from your shop with live 10s GPS tracking.',
    iconName: 'car',
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
        {/* Animated Motion Hero Slideshow Carousel (Automated 3.5s Rotation) */}
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
              <View style={[styles.heroSlideCard, { backgroundColor: isDark ? '#1E293B' : colors.role.seller }]}>
                {/* Top Logo Ring */}
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
                <Text variant="bodyMedium" color="rgba(255,255,255,0.9)" align="center" style={styles.heroSubtitle}>
                  {item.subtitle}
                </Text>

                {/* Floating Graphic Badge */}
                <View style={[styles.slideIconFloatingCircle, { backgroundColor: item.badgeColor }]}>
                  <Ionicons name={item.iconName} size={20} color={colors.neutral[0]} />
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
                    width: index === activeIndex ? 22 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Value Highlights Cards Section */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
          WHY SELL ON WUNABUY?
        </Text>

        {/* Card 1: Verified Store */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="storefront" size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Verified Merchant Badge
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Get a verified store badge &amp; dedicated catalog page trusted by local buyers.
            </Text>
          </View>
        </Card>

        {/* Card 2: Escrow Payouts */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="wallet" size={24} color={colors.accent[500]} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Guaranteed Escrow Payouts
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Receive payouts directly into MTN MoMo, Orange Money, or Bank upon delivery.
            </Text>
          </View>
        </Card>

        {/* Card 3: Express Delivery Fleet */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="car" size={24} color={colors.role.seller} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Express Delivery Fleet
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Automated motorcycle rider pickup &amp; live GPS tracking to your customer's doorstep.
            </Text>
          </View>
        </Card>

        {/* Card 4: Mobile Inventory */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="bar-chart" size={24} color={theme.text} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Mobile Inventory &amp; Sales
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Manage products, stock alerts &amp; daily revenues easily right from your smartphone.
            </Text>
          </View>
        </Card>

        {/* Action Button: Get Started */}
        <View style={styles.actionSection}>
          <Button
            title="Get Started →"
            variant="primary"
            onPress={() => navigation.navigate('StoreKYC')}
            style={styles.getStartedBtn}
          />
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
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  heroSlideCard: {
    width: BANNER_WIDTH,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 220,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
  },
  heroLogoRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
    ...shadows.sm,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  badgePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
  },
  slideIconFloatingCircle: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
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
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs + 2,
  },
  valueCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  valueTextCol: {
    flex: 1,
  },
  actionSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  getStartedBtn: {
    height: 52,
    backgroundColor: colors.role.seller,
  },
});
