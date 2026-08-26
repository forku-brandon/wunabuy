import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { CartItem } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text, Card } from '../ui';

export interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  style?: ViewStyle;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  style,
}) => {
  const { theme } = useThemeStore();
  const itemTotal = item.price * item.quantity;

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.row}>
        {/* Product Image */}
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Info & Quantity Controls */}
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text variant="bodyLarge" bold numberOfLines={1} style={styles.name}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => onRemove(item.product_id)} style={styles.removeBtn}>
              <Text variant="bodyMedium" color={colors.semantic.error[500]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <Text variant="bodyMedium" bold color={colors.primary[500]} style={styles.unitPrice}>
            {formatXAF(item.price)}
          </Text>

          <View style={styles.footerRow}>
            {/* Stepper Controls */}
            <View style={[styles.stepper, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                style={styles.stepBtn}
              >
                <Text variant="bodyLarge" bold>
                  -
                </Text>
              </TouchableOpacity>

              <Text variant="bodyMedium" bold style={styles.quantityText}>
                {item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                disabled={item.quantity >= item.max_quantity}
                style={[styles.stepBtn, item.quantity >= item.max_quantity && { opacity: 0.4 }]}
              >
                <Text variant="bodyLarge" bold>
                  +
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row Subtotal */}
            <Text variant="h3" bold>
              {formatXAF(itemTotal)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  unitPrice: {
    marginBottom: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    height: 32,
  },
  stepBtn: {
    width: 32,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    paddingHorizontal: spacing.sm,
  },
});
