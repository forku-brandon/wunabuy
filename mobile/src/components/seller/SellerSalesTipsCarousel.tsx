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
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.base * 2;

export interface SalesTipSlide {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  imageUrl: string;
  actionScreen?: string;
}

const SALES_TIP_SLIDES: SalesTipSlide[] = [
  {
    id: 'tip_1',
    badge: '📸 +45% CONVERSION',
    badgeColor: '#10B981',
    title: 'Multi-Angle Photos, ✨\nSell 3.5x Faster',
    subtitle: 'List items with 3+ clear photos in good lighting to attract more buyers in Douala.',
    ctaText: 'Add Photos',
    iconName: 'camera-outline',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    actionScreen: 'AddEditProduct',
  },
  {
    id: 'tip_2',
    badge: '⚡ SEARCH BOOST',
    badgeColor: colors.primary[500],
    title: '2-Hour Acceptance, 🚀\nRank on Top Page',
    subtitle: 'Accept customer orders promptly. Fast responsive stores receive prioritized marketplace ranking.',
    ctaText: 'View Queue',
    iconName: 'flash-outline',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    actionScreen: 'SellerOrders',
  },
  {
    id: 'tip_3',
    badge: '🛡️ ZERO DISPUTES',
    badgeColor: '#8B5CF6',
    title: 'Accurate Grading, 💎\nInstant Escrow Release',
    subtitle: 'Honestly declare item condition (NEW, LIKE NEW, GOOD) to eliminate returns and get paid faster.',
    ctaText: 'Check Stock',
    iconName: 'shield-checkmark-outline',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    actionScreen: 'SellerProducts',
  },
  {
    id: 'tip_4',
    badge: '🏍️ 45-MIN DISPATCH',
    badgeColor: colors.accent[500],
    title: 'Express Handover, 📦\nSwift City Delivery',
    subtitle: 'Mark packages "Ready for Pickup" quickly so verified riders can pick up & deliver on time.',
    ctaText: 'Dispatch Order',
    iconName: 'bicycle-outline',
    imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
    actionScreen: 'SellerOrders',
  },
  {
    id: 'tip_5',
    badge: '💳 24/7 CASHOUT',
    badgeColor: '#EC4899',
    title: 'Instant Payouts, 🟡\nMTN & Orange MoMo',
    subtitle: 'Withdraw your available merchant earnings directly to your mobile money wallet anytime.',
    ctaText: 'Open Wallet',
    iconName: 'wallet-outline',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    actionScreen: 'SellerWallet',
  },
];

export interface SellerSalesTipsCarouselProps {
  onPressTip?: (slide: SalesTipSlide) => void;
}

export const SellerSalesTipsCarousel: React.FC<SellerSalesTipsCarouselProps> = ({
  onPressTip,
}) => {
  const { theme, isDark } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SALES_TIP_SLIDES.length;
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
        data={SALES_TIP_SLIDES}
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
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => onPressTip?.(item)}
            style={[
              styles.slideCard,
              { backgroundColor: isDark ? '#1E293B' : colors.primary[50] },
            ]}
          >
            {/* Left Content Column */}
            <View style={styles.textCol}>
              <View style={styles.badgePill}>
                <Text
                  variant="caption"
                  bold
                  color={item.badgeColor || colors.primary[500]}
                  style={styles.badgeText}
                >
                  {item.badge}
                </Text>
              </View>

              <Text variant="h2" bold style={styles.title}>
                {item.title}
              </Text>

              <Text variant="caption" secondary numberOfLines={2} style={styles.subtitle}>
                {item.subtitle}
              </Text>

              <View style={[styles.ctaButton, { backgroundColor: colors.primary[500] }]}>
                <Text variant="caption" bold color={colors.neutral[0]} style={styles.ctaText}>
                  {item.ctaText}
                </Text>
                <Ionicons name="arrow-forward" size={12} color={colors.neutral[0]} style={{ marginLeft: 4 }} />
              </View>
            </View>

            {/* Right Product/Lifestyle Photography */}
            <View style={styles.imageCol}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Slide Pagination Dots */}
      <View style={styles.paginationRow}>
        {SALES_TIP_SLIDES.map((slide, idx) => (
          <View
            key={slide.id}
            style={[
              styles.dot,
              activeIndex === idx
                ? [styles.activeDot, { backgroundColor: colors.primary[500] }]
                : [styles.inactiveDot, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300] }],
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BANNER_WIDTH,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  slideCard: {
    width: BANNER_WIDTH,
    borderRadius: borderRadius['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    overflow: 'hidden',
    minHeight: 154,
    ...shadows.sm,
  },
  textCol: {
    flex: 1.3,
    paddingRight: spacing.sm,
    justifyContent: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
    ...shadows.sm,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 11,
  },
  imageCol: {
    flex: 0.9,
    height: 126,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
  },
  inactiveDot: {
    width: 6,
  },
});

