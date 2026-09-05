import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '@wunabuy/types';
import { formatXAF } from '@wunabuy/utils';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text, Card, QuantityInputModal } from '../ui';

const PLACEHOLDER = require('../../../assets/placeholder_product.png');

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
  const { theme, isDark } = useThemeStore();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Card style={[styles.card, style]}>
        <View style={styles.row}>
          {/* Product Image Thumbnail */}
          <Image
            source={item.image_url ? { uri: item.image_url } : PLACEHOLDER}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Info, Price, Trash Icon & Quantity Stepper */}
          <View style={styles.infoCol}>
            <View style={styles.headerRow}>
              <Text variant="bodyLarge" bold numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>

              {/* Trash Delete Icon Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onRemove(item.product_id)}
                style={styles.trashBtn}
              >
                <Ionicons name="trash-outline" size={18} color={theme.placeholder} />
              </TouchableOpacity>
            </View>

            <Text variant="caption" secondary style={styles.storeName}>
              Douala Tech Hub (Akwa)
            </Text>

            <View style={styles.footerRow}>
              <Text variant="h3" bold color={colors.primary[500]}>
                {formatXAF(item.price)}
              </Text>

              {/* Stepper Pill (Clicking number opens Alibaba-style Quantity Modal) */}
              <View style={[styles.stepperPill, { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
                <TouchableOpacity
                  onPress={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                  style={styles.stepBtn}
                >
                  <Text variant="bodyLarge" bold>-</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setModalVisible(true)}
                  style={styles.qtyTouchBtn}
                >
                  <Text variant="bodyMedium" bold style={styles.qtyText}>
                    {item.quantity}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                  disabled={item.quantity >= item.max_quantity}
                  style={[styles.stepBtn, item.quantity >= item.max_quantity && { opacity: 0.3 }]}
                >
                  <Text variant="bodyLarge" bold>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Card>

      <QuantityInputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={(newQty) => onUpdateQuantity(item.product_id, newQty)}
        currentQuantity={item.quantity}
        minQuantity={1}
        maxQuantity={item.max_quantity}
        title="Edit Item Quantity"
        itemName={item.name}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    paddingRight: spacing.xs,
    fontSize: 15,
  },
  trashBtn: {
    padding: 2,
  },
  storeName: {
    marginBottom: spacing.xs,
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    height: 32,
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyTouchBtn: {
    paddingHorizontal: spacing.xs + 2,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
