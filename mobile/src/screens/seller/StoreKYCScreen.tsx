import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, Text, Input, Button, Card, Toast, Badge } from '../../components/ui';
import { ImagePickerGrid } from '../../components/seller/ImagePickerGrid';
import { ProductCategory, KYCStatus } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const StoreKYCScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.ELECTRONICS);
  const [addressText, setAddressText] = useState('');
  const [city, setCity] = useState('Douala');

  // Photo state
  const [idFront, setIdFront] = useState<string[]>([]);
  const [idBack, setIdBack] = useState<string[]>([]);
  const [storefrontPhoto, setStorefrontPhoto] = useState<string[]>([]);
  const [businessRegDoc, setBusinessRegDoc] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!storeName.trim() || storeName.trim().length < 3) {
      setError('Please enter a valid store name (at least 3 characters).');
      return;
    }

    if (!addressText.trim()) {
      setError('Please enter your store physical street address in Douala.');
      return;
    }

    if (idFront.length === 0 || idBack.length === 0) {
      setError('Please upload clear photos of both Front and Back of your National ID Card.');
      return;
    }

    if (storefrontPhoto.length === 0) {
      setError('Please upload a photo of your physical storefront / workshop.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In production API integration: await kycApi.submitKYC({...});
      setToastMessage('Store KYC submitted successfully! Staff will review within 24h.');
      setTimeout(() => {
        setLoading(false);
        navigation.goBack();
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to submit KYC documents. Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="h2">←</Text>
        </TouchableOpacity>
        <Text variant="h1" bold style={styles.title}>
          Store KYC Verification
        </Text>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          Submit official documents to get your merchant store verified on Wunabuy.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          1. Store Business Details
        </Text>

        <Input
          label="Store / Business Name *"
          placeholder="e.g. Douala Tech Hub"
          value={storeName}
          onChangeText={(text) => {
            setError('');
            setStoreName(text);
          }}
        />

        <Input
          label="Short Business Description"
          placeholder="e.g. Quality electronics, laptops, and original phone accessories."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          Primary Store Category *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {Object.values(ProductCategory).map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryChip,
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

      <Card style={styles.card}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          2. Physical Location Pin
        </Text>

        <Input
          label="Physical Street Address *"
          placeholder="e.g. Rue Joss, Bonanjo"
          value={addressText}
          onChangeText={setAddressText}
        />

        <Input label="City" value={city} onChangeText={setCity} />
      </Card>

      <Card style={styles.card}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          3. Government ID Card Documents *
        </Text>

        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          National ID Card (Front Photo) *
        </Text>
        <ImagePickerGrid
          images={idFront}
          maxImages={1}
          onAddImage={(uri) => setIdFront([uri])}
          onRemoveImage={() => setIdFront([])}
        />

        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          National ID Card (Back Photo) *
        </Text>
        <ImagePickerGrid
          images={idBack}
          maxImages={1}
          onAddImage={(uri) => setIdBack([uri])}
          onRemoveImage={() => setIdBack([])}
        />
      </Card>

      <Card style={styles.card}>
        <Text variant="h3" bold style={styles.sectionTitle}>
          4. Storefront & Business Verification *
        </Text>

        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          Physical Storefront / Workshop Photo *
        </Text>
        <ImagePickerGrid
          images={storefrontPhoto}
          maxImages={1}
          onAddImage={(uri) => setStorefrontPhoto([uri])}
          onRemoveImage={() => setStorefrontPhoto([])}
        />

        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          Business Registration or Ownership Affidavit (Optional)
        </Text>
        <ImagePickerGrid
          images={businessRegDoc}
          maxImages={1}
          onAddImage={(uri) => setBusinessRegDoc([uri])}
          onRemoveImage={() => setBusinessRegDoc([])}
        />
      </Card>

      {error ? (
        <Text variant="caption" color={colors.semantic.error[500]} style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <Button
        title="Submit KYC Documents"
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
  categoryChip: {
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

