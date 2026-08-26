import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge, EmptyState } from '../../components/ui';
import { CartItemCard } from '../../components/cart/CartItemCard';
import { OrderSummaryCard } from '../../components/cart/OrderSummaryCard';
import { useCartStore } from '../../stores/cart.store';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors } from '@wunabuy/design-tokens';
import { Address } from '@wunabuy/types';

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
  const { theme } = useThemeStore();
  const { items, updateQuantity, removeItem, getSubtotal, getItemCount } = useCartStore();

  const [deliveryAddress] = useState<Address>(MOCK_DEFAULT_ADDRESS);

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  const handleProceedToPayment = () => {
    navigation.navigate('CheckoutPayment', {
      subtotal,
      addressId: deliveryAddress.id,
    });
  };

  if (items.length === 0) {
    return (
      <ScreenContainer scrollable={false}>
        <EmptyState
          title="Your Escrow Cart is Empty"
          description="Browse items from verified local stores in Douala and add them to your cart."
          actionLabel="Explore Products"
          onAction={() => navigation.navigate('BuyerSearch')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text variant="h1" bold>
          Escrow Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </Text>
        <Text variant="caption" secondary>
          Items from Douala Tech Hub (Akwa)
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Selected Delivery Address Card */}
            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
              DELIVERY DESTINATION
            </Text>
            <Card style={styles.addressCard}>
              <View style={styles.addressRow}>
                <View style={styles.addressInfo}>
                  <View style={styles.labelRow}>
                    <Text variant="bodyLarge" bold>
                      📍 {deliveryAddress.label}
                    </Text>
                    <Badge label="DEFAULT" variant="primary" size="small" />
                  </View>
                  <Text variant="bodyMedium" secondary>
                    {deliveryAddress.address_text}, {deliveryAddress.city}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('AddressManager')}>
                  <Text variant="bodyMedium" bold color={colors.primary[500]}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionLabel}>
              ORDER ITEMS
            </Text>
          </>
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
            <OrderSummaryCard subtotal={subtotal} />

            <Button
              title="Proceed to Escrow Payment →"
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  addressCard: {
    marginBottom: spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  checkoutBtn: {
    marginBottom: spacing.xl,
  },
});
