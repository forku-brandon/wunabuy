import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Input, Button, Card, Toast } from '../../components/ui';
import { ImagePickerGrid } from '../../components/seller/ImagePickerGrid';
import { ProductCategory, QualityTier, Product } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { formatXAF } from '@wunabuy/utils';

export const AddEditProductScreen = ({ navigation, route }: any) => {
  const existingProduct: Product | undefined = route.params?.product;
  const isEditing = Boolean(existingProduct);
  const { theme } = useThemeStore();

  const [name, setName] = useState(existingProduct?.name ?? '');
  const [description, setDescription] = useState(existingProduct?.description ?? '');
  const [category, setCategory] = useState<ProductCategory>(existingProduct?.category ?? ProductCategory.ELECTRONICS);
  const [price, setPrice] = useState(existingProduct?.price ? existingProduct.price.toString() : '');
  const [quantity, setQuantity] = useState(existingProduct?.quantity ? existingProduct.quantity.toString() : '1');
  const [qualityTier, setQualityTier] = useState<QualityTier>(existingProduct?.quality_tier ?? QualityTier.NEW);
  const [images, setImages] = useState<string[]>(existingProduct?.images ?? []);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddImage = (uri: string) => {
    if (images.length >= 5) return;
    setImages([...images, uri]);
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    const newImgs = [...images];
    newImgs.splice(index, 1);
    setImages(newImgs);
  };

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 3) {
      setError('Please enter a product title (at least 3 characters).');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Please enter a valid price in XAF.');
      return;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    if (images.length === 0) {
      setError('Please add at least 1 product image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In production API integration: productsApi.createProduct or updateProduct
      setToastMessage(isEditing ? 'Product updated successfully!' : 'Product listed successfully!');
      setTimeout(() => {
        setLoading(false);
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'SellerApp' }],
          });
        }
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to save product.');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'SellerApp' }],
              });
            }
          }}
          style={styles.backBtn}
        >
          <Text variant="h2">←</Text>
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.title}>
          {isEditing ? 'Edit Product Listing' : 'List New Product'}
        </Text>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          Set product details, stock levels, and quality condition tier.
        </Text>
      </View>

      {/* Product Images */}
      <Card style={styles.card}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          Product Images (Max 5) *
        </Text>
        <Text variant="caption" secondary style={{ marginBottom: spacing.sm }}>
          First image will be displayed as the main thumbnail in search feeds. Images are auto-compressed (1080px max width).
        </Text>

        <ImagePickerGrid
          images={images}
          maxImages={5}
          onAddImage={handleAddImage}
          onRemoveImage={handleRemoveImage}
        />
      </Card>

      {/* Basic Info */}
      <Card style={styles.card}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          Basic Information
        </Text>

        <Input
          label="Product Title *"
          placeholder="e.g. Samsung Galaxy A54 5G 128GB"
          value={name}
          onChangeText={(text) => {
            setError('');
            setName(text);
          }}
        />

        <Input
          label="Detailed Description"
          placeholder="Provide details about condition, included accessories, and warranty status."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          Category *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {Object.values(ProductCategory).map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary[500] : theme.input,
                    borderColor: isSelected ? colors.primary[500] : theme.inputBorder,
                  },
                ]}
              >
                <Text variant="bodyMedium" bold={isSelected} color={isSelected ? colors.neutral[0] : theme.text}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Card>

      {/* Price & Inventory */}
      <Card style={styles.card}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          Pricing & Inventory
        </Text>

        <Input
          label="Selling Price (XAF) *"
          placeholder="e.g. 185000"
          keyboardType="number-pad"
          value={price}
          onChangeText={(text) => {
            setError('');
            setPrice(text);
          }}
          hint={price && !isNaN(Number(price)) ? `Formatted: ${formatXAF(Number(price))}` : undefined}
        />

        <Input
          label="Available Stock Quantity *"
          placeholder="e.g. 5"
          keyboardType="number-pad"
          value={quantity}
          onChangeText={(text) => {
            setError('');
            setQuantity(text);
          }}
        />

        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          Quality Condition Tier *
        </Text>
        <View style={styles.tierRow}>
          {Object.values(QualityTier).map((tier) => {
            const isSelected = qualityTier === tier;
            return (
              <TouchableOpacity
                key={tier}
                onPress={() => setQualityTier(tier)}
                style={[
                  styles.tierChip,
                  {
                    backgroundColor: isSelected ? colors.primary[500] : theme.input,
                    borderColor: isSelected ? colors.primary[500] : theme.inputBorder,
                  },
                ]}
              >
                <Text variant="bodyMedium" bold={isSelected} color={isSelected ? colors.neutral[0] : theme.text}>
                  {tier.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {error ? (
        <Text variant="caption" color={colors.semantic.error[500]} style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <Button
        title={isEditing ? 'Save Changes' : 'Publish Product Listing'}
        variant="primary"
        loading={loading}
        onPress={handleSubmit}
        style={styles.submitBtn}
      />

      {toastMessage && <Toast message={toastMessage} type="success" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  backBtn: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  categoryScroll: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  tierRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tierChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  errorText: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  submitBtn: {
    marginBottom: spacing.xl,
  },
});

