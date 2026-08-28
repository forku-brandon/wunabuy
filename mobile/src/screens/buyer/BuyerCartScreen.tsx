import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState } from '../../components/ui';
import { CartItemCard } from '../../components/cart/CartItemCard';
import { useCartStore } from '../../stores/cart.store';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors, borderRadius } from '@wunabuy/design-tokens';
import { Address } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { PromotionsService } from '../../services/api';

const MOCK_DEFAULT_ADDRESS: Address = {
  id: 'addr_1',
  label: 'Home',
  latitude: 4.0510564,
  longitude: 9.7678687,
  address_text: 'Rue Joss, Akwa',
  city: 'Douala',
  is_default: true,
};

export const BuyerCartScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getItemCount } = useCartStore();

  const [deliveryAddress] = useState<Address>(MOCK_DEFAULT_ADDRESS);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic Backend Promotion / Free Delivery notification (Hidden by default)
  const [backendPromo, setBackendPromo] = useState<{
    id: string;
    message: string;
    expiresInSeconds?: number;
  } | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      const promoData = await PromotionsService.getCartBanner();
      if (promoData && promoData.show_banner && promoData.headline) {
        setBackendPromo({
          id: promoData.promo_id || 'promo_default',
          message: promoData.headline,
          expiresInSeconds: promoData.auto_dismiss_seconds || 6,
        });
      }
    } catch {
      // Safe fallback
    }
  }, []);

  React.useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Auto-dismiss timer when a backend promo is received
  React.useEffect(() => {
    if (!backendPromo) return;
    const timeout = (backendPromo.expiresInSeconds ?? 6) * 1000;
    const timer = setTimeout(() => {
      setBackendPromo(null);
    }, timeout);
    return () => clearTimeout(timer);
  }, [backendPromo]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPromotions().finally(() => setRefreshing(false));
  }, [fetchPromotions]);

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const shippingFee = 1500; // Standard delivery fee
  const total = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const handleProceedToPayment = () => {
    navigation.navigate('CheckoutPayment', {
      subtotal,
      addressId: deliveryAddress.id,
    });
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedDiscount(2000);
      setBackendPromo({
        id: 'promo_applied',
        message: `Promo code "${promoCode.trim()}" applied: -2,000 FCFA discount!`,
        expiresInSeconds: 6,
      });
      setPromoCode('');
    }
  };

  if (items.length === 0) {
    return (
      <ScreenContainer scrollable={false}>
        <EmptyState
          title="Your Cart is Empty"
          description="Browse items from verified local stores in Douala and add them to your cart."
          actionLabel="Explore Products"
          onAction={() => navigation.navigate('BuyerSearch')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.headerRow}>
          <Text variant="h1" bold style={styles.headerTitle}>
            My Cart
          </Text>

          <TouchableOpacity onPress={clearCart}>
            <Text variant="bodyMedium" bold color={colors.semantic.error[500]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Backend Promo / Delivery Banner (Hidden by default, shown only on backend response with auto-timeout) */}
        {backendPromo && (
          <View
            style={[
              styles.shippingBanner,
              {
                backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                borderColor: colors.semantic.success[500],
              },
            ]}
          >
            <View style={styles.shippingBannerRow}>
              <Ionicons name="gift-outline" size={18} color={colors.semantic.success[700]} />
              <Text
                variant="bodyMedium"
                bold
                color={colors.semantic.success[700]}
                style={styles.shippingBannerText}
                numberOfLines={2}
              >
                {backendPromo.message}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setBackendPromo(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 'auto' }}
              >
                <Ionicons name="close" size={16} color={colors.semantic.success[700]} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        )}
        ListFooterComponent={
          <>
            {/* Promo Code Input Box (Matching Mockup Screen 3) */}
            <View style={[styles.promoRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={setPromoCode}
                placeholderTextColor={theme.placeholder}
                style={[styles.promoInput, { color: theme.text }]}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleApplyPromo}
                style={[styles.applyBtn, { backgroundColor: theme.text }]}
              >
                <Text variant="bodyMedium" bold color={theme.background}>
                  APPLY
                </Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary Calculation (Matching Mockup Screen 3) */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" secondary>
                  Subtotal
                </Text>
                <Text variant="bodyLarge" bold>
                  {formatXAF(subtotal)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" secondary>
                  Discount
                </Text>
                <Text variant="bodyLarge" bold color={colors.semantic.success[700]}>
                  -{formatXAF(appliedDiscount)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" secondary>
                  Delivery Fee
                </Text>
                <Text variant="bodyLarge" bold color={colors.semantic.success[700]}>
                  Free
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" secondary>
                  Escrow Protection
                </Text>
                <Text variant="bodyLarge" bold color={colors.semantic.success[700]}>
                  Included
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text variant="h2" bold>
                  Total
                </Text>
                <Text variant="display" bold color={colors.primary[500]}>
                  {formatXAF(total)}
                </Text>
              </View>
            </View>

            {/* Bottom Checkout Button (Matching Mockup Screen 3) */}
            <Button
              title="Proceed to Escrow Checkout →"
              variant="primary"
              onPress={handleProceedToPayment}
              style={styles.checkoutBtn}
            />
          </>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
  },
  shippingBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  shippingBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  shippingBannerText: {
    marginLeft: spacing.xs,
    fontSize: 13,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.semantic.success[500],
    borderRadius: borderRadius.full,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 14,
  },
  applyBtn: {
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    marginBottom: spacing.xl,
    gap: spacing.xs + 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: spacing.xs,
  },
  checkoutBtn: {
    height: 52,
    marginBottom: spacing.xl,
  },
});
