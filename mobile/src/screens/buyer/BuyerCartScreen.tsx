import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState } from '../../components/ui';
import { CartItemCard } from '../../components/cart/CartItemCard';
import { useCartStore } from '../../stores/cart.store';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors, borderRadius, shadows } from '@wunabuy/design-tokens';
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

  // Delivery & Pickup Choice State (User Request #10)
  const [deliveryMethod, setDeliveryMethod] = useState<'wunabuy_transporter' | 'self_pickup'>('wunabuy_transporter');
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [pickupPin] = useState('84920'); // 5-digit verification code for personal rider

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
  const shippingFee = deliveryMethod === 'self_pickup' ? 0 : 1500;
  const total = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const handleProceedToPayment = () => {
    navigation.navigate('CheckoutPayment', {
      subtotal,
      deliveryFee: shippingFee,
      deliveryMethod,
      pickupPin,
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

            {/* Order Summary Calculation */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" secondary>
                  Subtotal
                </Text>
                <Text variant="bodyLarge" bold>
                  {formatXAF(subtotal)}
                </Text>
              </View>

              {appliedDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" secondary>
                    Discount
                  </Text>
                  <Text variant="bodyLarge" bold color={colors.semantic.success[700]}>
                    -{formatXAF(appliedDiscount)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <View style={styles.deliveryLabelRow}>
                  <Text variant="bodyMedium" secondary>
                    Delivery
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsDeliveryModalOpen(true)}
                    style={styles.editDeliveryBtn}
                  >
                    <Ionicons name="pencil" size={12} color={colors.primary[600]} />
                    <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 3, fontSize: 11 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsDeliveryModalOpen(true)}>
                  <Text
                    variant="bodyLarge"
                    bold
                    color={deliveryMethod === 'self_pickup' ? colors.semantic.success[700] : theme.text}
                  >
                    {deliveryMethod === 'self_pickup' ? '0 FCFA (Self-Pickup)' : formatXAF(shippingFee)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <View>
                  <Text variant="h2" bold>
                    Total
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                    <Text variant="caption" color="#10B981" bold style={{ marginLeft: 3, fontSize: 11 }}>
                      Escrow Protected
                    </Text>
                  </View>
                </View>
                <Text variant="display" bold color={colors.primary[500]}>
                  {formatXAF(total)}
                </Text>
              </View>
            </View>

            {/* Bottom Checkout Button */}
            <Button
              title="Proceed to Escrow Checkout →"
              variant="primary"
              onPress={handleProceedToPayment}
              style={styles.checkoutBtn}
            />
          </>
        }
      />

      {/* ─── Delivery Method Selection Modal ─────────────────────────────── */}
      <Modal
        visible={isDeliveryModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDeliveryModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDeliveryModalOpen(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="car-sport" size={20} color={colors.primary[600]} style={{ marginRight: 6 }} />
                <Text variant="h2" bold>
                  Delivery & Pickup Option
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsDeliveryModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Option 1: Wunabuy Express Transporter */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setDeliveryMethod('wunabuy_transporter')}
              style={[
                styles.deliveryOptionCard,
                {
                  borderColor: deliveryMethod === 'wunabuy_transporter' ? colors.primary[500] : theme.border,
                  backgroundColor:
                    deliveryMethod === 'wunabuy_transporter'
                      ? isDark
                        ? colors.neutral[800]
                        : '#F0FDFA'
                      : 'transparent',
                },
              ]}
            >
              <View style={styles.optionRadioCircle}>
                {deliveryMethod === 'wunabuy_transporter' && <View style={styles.optionRadioInner} />}
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm, marginRight: spacing.xs }}>
                <Text variant="bodyLarge" bold color={deliveryMethod === 'wunabuy_transporter' ? colors.primary[600] : theme.text}>
                  🏍️ Wunabuy Express Transporter
                </Text>
                <Text variant="caption" secondary style={{ marginTop: 2 }}>
                  Standard platform rider dispatch with live GPS tracking
                </Text>
              </View>
              {/* Grid-Safe Amount Badge */}
              <View style={[styles.modalAmountBadge, { backgroundColor: '#CCFBF1' }]}>
                <Text variant="bodyMedium" bold color={colors.primary[700]}>
                  {formatXAF(1500)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Self Pickup / Personal Courier */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setDeliveryMethod('self_pickup')}
              style={[
                styles.deliveryOptionCard,
                {
                  borderColor: deliveryMethod === 'self_pickup' ? colors.primary[500] : theme.border,
                  backgroundColor:
                    deliveryMethod === 'self_pickup'
                      ? isDark
                        ? colors.neutral[800]
                        : '#F0FDFA'
                      : 'transparent',
                  marginTop: spacing.xs + 4,
                },
              ]}
            >
              <View style={styles.optionRadioCircle}>
                {deliveryMethod === 'self_pickup' && <View style={styles.optionRadioInner} />}
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm, marginRight: spacing.xs }}>
                <Text variant="bodyLarge" bold color={deliveryMethod === 'self_pickup' ? colors.semantic.success[700] : theme.text}>
                  🚶 Personal Courier / Self-Pickup
                </Text>
                <Text variant="caption" secondary style={{ marginTop: 2 }}>
                  Send your rider or pick up at store using 5-digit PIN
                </Text>
              </View>
              {/* Grid-Safe Amount Badge */}
              <View style={[styles.modalAmountBadge, { backgroundColor: '#D1FAE5' }]}>
                <Text variant="bodyMedium" bold color={colors.semantic.success[700]}>
                  0 FCFA (Free)
                </Text>
              </View>
            </TouchableOpacity>

            {/* If Self-Pickup Selected: Detailed Seller Store Address & Rider PIN Card */}
            {deliveryMethod === 'self_pickup' && (
              <View style={[styles.pickupDetailsCard, { backgroundColor: isDark ? colors.neutral[800] : '#ECFDF5', borderColor: colors.primary[400] }]}>
                {/* Rider Verification PIN Header */}
                <View style={styles.pinCardHeader}>
                  <Ionicons name="key" size={18} color={colors.primary[600]} />
                  <Text variant="caption" bold color={colors.primary[700]} style={{ marginLeft: 6 }}>
                    YOUR PERSONAL RIDER VERIFICATION PIN
                  </Text>
                </View>

                <View style={styles.pinBadgeContainer}>
                  <Text variant="h1" bold color={colors.primary[600]} style={{ letterSpacing: 4 }}>
                    #{pickupPin}
                  </Text>
                </View>

                <Text variant="caption" secondary style={{ fontSize: 11, marginBottom: spacing.xs }}>
                  Give code <Text bold color={theme.text}>#{pickupPin}</Text> to your courier to present at the store counter upon arrival.
                </Text>

                {/* Detailed Seller Store Address Specs */}
                <View style={[styles.storeSpecsBox, { backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF', borderColor: theme.border }]}>
                  <Text variant="caption" bold color={colors.primary[600]} style={{ marginBottom: 4 }}>
                    🏬 DETAILED STORE PICKUP LOCATION:
                  </Text>

                  <View style={styles.specRow}>
                    <Ionicons name="storefront-outline" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                    <Text variant="caption" bold color={theme.text}>
                      Store Name:
                    </Text>
                    <Text variant="caption" secondary style={{ marginLeft: 4, flex: 1 }}>
                      Douala Tech Hub (Akwa Branch)
                    </Text>
                  </View>

                  <View style={styles.specRow}>
                    <Ionicons name="location-outline" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                    <Text variant="caption" bold color={theme.text}>
                      Physical Address:
                    </Text>
                    <Text variant="caption" secondary style={{ marginLeft: 4, flex: 1 }}>
                      Rue Joss, Quartier Akwa, Douala, Cameroon
                    </Text>
                  </View>

                  <View style={styles.specRow}>
                    <Ionicons name="compass-outline" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                    <Text variant="caption" bold color={theme.text}>
                      Landmark Directions:
                    </Text>
                    <Text variant="caption" secondary style={{ marginLeft: 4, flex: 1 }}>
                      Opposite Place du Gouvernement, Next to Akwa Mall (1st Floor, Suite 104)
                    </Text>
                  </View>

                  <View style={styles.specRow}>
                    <Ionicons name="call-outline" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                    <Text variant="caption" bold color={theme.text}>
                      Store Contacts:
                    </Text>
                    <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 4, flex: 1 }}>
                      +237 670 123 456 / +237 699 876 543
                    </Text>
                  </View>

                  <View style={styles.specRow}>
                    <Ionicons name="time-outline" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                    <Text variant="caption" bold color={theme.text}>
                      Operating Hours:
                    </Text>
                    <Text variant="caption" secondary style={{ marginLeft: 4, flex: 1 }}>
                      Mon - Sat: 8:00 AM - 6:30 PM
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Button
              title="Save Preference & Confirm ✓"
              variant="primary"
              onPress={() => setIsDeliveryModalOpen(false)}
              style={{ marginTop: spacing.md, backgroundColor: colors.primary[500] }}
            />
          </View>
        </View>
      </Modal>
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
  deliveryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editDeliveryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#CCFBF1',
    borderRadius: borderRadius.sm,
  },
  selfPickupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.xs,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    borderWidth: 1,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    ...shadows.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
  },
  optionRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
  },
  pickupDetailsCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  pinCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pinBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: '#CCFBF1',
    borderRadius: borderRadius.lg,
  },
  storeSpecsBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.xs,
    gap: 6,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAmountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupPinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinBadgeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: '#CCFBF1',
    borderRadius: borderRadius.lg,
  },
  storeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pinNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
});
