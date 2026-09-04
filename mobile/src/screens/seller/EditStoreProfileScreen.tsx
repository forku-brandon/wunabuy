import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer, Text, Card, Button, Badge, Toast } from '../../components/ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useSellerStore } from '../../stores/seller.store';
import { ProductCategory } from '@wunabuy/types';

const CATEGORIES = [
  ProductCategory.ELECTRONICS,
  ProductCategory.FASHION,
  ProductCategory.FOOD_GROCERIES,
  ProductCategory.HOME_GARDEN,
  ProductCategory.HEALTH_BEAUTY,
  ProductCategory.AUTOMOTIVE,
  ProductCategory.SERVICES,
  ProductCategory.OTHER,
];

export const EditStoreProfileScreen = ({ navigation }: any) => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  const sellerStore = useSellerStore();

  // Local Form State initialized from seller store
  const [storeName, setStoreName] = useState(sellerStore.storeName || '');
  const [category, setCategory] = useState(sellerStore.category || ProductCategory.ELECTRONICS);
  const [tagline, setTagline] = useState(sellerStore.tagline || '');
  const [description, setDescription] = useState(sellerStore.description || '');
  const [address, setAddress] = useState(sellerStore.address || '');
  const [landmarkDirections, setLandmarkDirections] = useState(sellerStore.landmarkDirections || '');
  const [primaryPhone, setPrimaryPhone] = useState(sellerStore.primaryPhone || sellerStore.storePhone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(sellerStore.secondaryPhone || '');
  const [email, setEmail] = useState(sellerStore.email || '');
  const [operatingHours, setOperatingHours] = useState(sellerStore.operatingHours || '');
  const [riderPickupInstructions, setRiderPickupInstructions] = useState(
    sellerStore.riderPickupInstructions || ''
  );
  const [latitude, setLatitude] = useState(sellerStore.latitude ? sellerStore.latitude.toString() : '4.0510');
  const [longitude, setLongitude] = useState(sellerStore.longitude ? sellerStore.longitude.toString() : '9.7679');
  const [logoUrl, setLogoUrl] = useState(
    sellerStore.logoUrl || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400'
  );
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(
    sellerStore.coverPhotoUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'
  );

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePickImage = async (target: 'logo' | 'cover') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Permission to access photo library is required to upload store images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: target === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        if (target === 'logo') setLogoUrl(result.assets[0].uri);
        else setCoverPhotoUrl(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image from library.');
    }
  };

  const handleSaveProfile = () => {
    if (!storeName.trim()) {
      Alert.alert('Missing Field', 'Please enter your Store Name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Missing Field', 'Please enter your Physical Store Address.');
      return;
    }

    setSaving(true);

    sellerStore.updateStoreProfile({
      storeName: storeName.trim(),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      address: address.trim(),
      landmarkDirections: landmarkDirections.trim(),
      primaryPhone: primaryPhone.trim(),
      secondaryPhone: secondaryPhone.trim(),
      email: email.trim(),
      operatingHours: operatingHours.trim(),
      riderPickupInstructions: riderPickupInstructions.trim(),
      latitude: parseFloat(latitude) || 4.0510,
      longitude: parseFloat(longitude) || 9.7679,
      logoUrl,
      coverPhotoUrl,
    });

    setTimeout(() => {
      setSaving(false);
      setToastMessage('Store Profile updated successfully! 🏬✓');
    }, 400);
  };

  const handlePreviewPublicStore = () => {
    // Save state first
    handleSaveProfile();

    // Navigate to StoreDetailScreen with updated values
    navigation.navigate('StoreDetail', {
      storeId: 'store_1',
      storeName: storeName.trim() || sellerStore.storeName,
      store: {
        id: 'store_1',
        name: storeName.trim() || sellerStore.storeName,
        category,
        location: address.trim() || sellerStore.address,
        rating_avg: sellerStore.ratingAvg,
        total_reviews: sellerStore.totalReviews,
        followers_count: sellerStore.followersCount,
        is_verified: sellerStore.isVerified,
        avatar_url: logoUrl,
        cover_url: coverPhotoUrl,
        tagline,
        description,
        landmarkDirections,
        primaryPhone,
        secondaryPhone,
        operatingHours,
        riderPickupInstructions,
      },
    });
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: insets.top + 6,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('SellerProfile');
          }}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text variant="bodyLarge" bold numberOfLines={1}>
            Edit Store Profile
          </Text>
          <Text variant="caption" color={colors.primary[600]} bold style={{ fontSize: 11 }}>
            Public Store Info for Buyers &amp; Riders
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSaveProfile}
          style={[styles.saveHeaderBtn, { backgroundColor: colors.primary[500] }]}
        >
          <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text variant="caption" bold color="#FFFFFF">
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* ── 1. Store Media Branding Pickers ─────────────────────────────── */}
        <View style={styles.mediaSection}>
          {/* Cover Photo Banner */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handlePickImage('cover')}
            style={styles.coverBannerBox}
          >
            <Image source={{ uri: coverPhotoUrl }} style={styles.coverImage} resizeMode="cover" />
            <View style={styles.coverOverlay} />
            <View style={styles.coverChangePill}>
              <Ionicons name="camera" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text variant="caption" bold color="#FFFFFF">
                Change Store Banner
              </Text>
            </View>
          </TouchableOpacity>

          {/* Store Logo Avatar */}
          <View style={styles.logoPositionWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePickImage('logo')}
              style={styles.logoImageWrapper}
            >
              <Image source={{ uri: logoUrl }} style={styles.logoImage} />
              <View style={styles.logoCameraBadge}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContent}>
          {/* Status Indicator Banner */}
          <View style={[styles.kycStatusCard, { backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#ECFDF5', borderColor: colors.primary[400] }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary[600]} />
            <View style={{ flex: 1, marginLeft: spacing.xs }}>
              <Text variant="caption" bold color={colors.primary[700]}>
                VERIFIED OFFICIAL STORE PROFILE
              </Text>
              <Text variant="caption" secondary style={{ fontSize: 11, marginTop: 1 }}>
                All information entered here is displayed to buyers on your Store Page and sent to riders for parcel pickup.
              </Text>
            </View>
          </View>

          {/* ── 2. Store Identity & Branding ────────────────────────────── */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="storefront" size={18} color={colors.primary[500]} />
              <Text variant="bodyLarge" bold style={{ marginLeft: 6 }}>
                Store Identity &amp; Branding
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Store Name *
              </Text>
              <TextInput
                value={storeName}
                onChangeText={setStoreName}
                placeholder="e.g. Douala Tech Hub"
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Primary Business Category *
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsRow}>
                {CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: selected ? colors.primary[500] : (isDark ? colors.neutral[800] : colors.neutral[100]),
                          borderColor: selected ? colors.primary[500] : theme.border,
                        },
                      ]}
                    >
                      <Text variant="caption" bold color={selected ? '#FFFFFF' : theme.text}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Short Tagline / Slogan
              </Text>
              <TextInput
                value={tagline}
                onChangeText={setTagline}
                placeholder="e.g. Premier Electronics Importer & Original Smartphone Hub"
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Full Store Overview / Bio
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your business, warranty options, and products..."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={3}
                style={[
                  styles.multilineInput,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>
          </Card>

          {/* ── 3. Physical Store Address & Rider Navigation Details ──── */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="location" size={18} color={colors.primary[500]} />
              <Text variant="bodyLarge" bold style={{ marginLeft: 6 }}>
                Physical Location &amp; Rider Specs
              </Text>
            </View>
            <Text variant="caption" secondary style={{ marginBottom: spacing.xs, fontSize: 11 }}>
              Crucial for riders picking up parcels and buyers choosing self-pickup.
            </Text>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Physical Street Address *
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. Rue Joss, Quartier Akwa, Douala, Cameroon"
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Landmark Directions for Drivers &amp; Buyers *
              </Text>
              <TextInput
                value={landmarkDirections}
                onChangeText={setLandmarkDirections}
                placeholder="e.g. Opposite Place du Gouvernement, Next to Akwa Mall (1st Floor Suite 104)"
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={2}
                style={[
                  styles.multilineInput,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Rider / Personal Courier Handover Instructions
              </Text>
              <TextInput
                value={riderPickupInstructions}
                onChangeText={setRiderPickupInstructions}
                placeholder="e.g. Tell courier to present 5-digit PIN at counter #2. Dedicated motorcycle parking available in rear alley."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={2}
                style={[
                  styles.multilineInput,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.gpsRow}>
              <View style={{ flex: 1, marginRight: spacing.xs }}>
                <Text variant="caption" bold secondary style={styles.label}>
                  Latitude Coordinate
                </Text>
                <TextInput
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                  placeholder="4.0510"
                  placeholderTextColor={theme.textTertiary}
                  style={[
                    styles.input,
                    { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                  ]}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <Text variant="caption" bold secondary style={styles.label}>
                  Longitude Coordinate
                </Text>
                <TextInput
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                  placeholder="9.7679"
                  placeholderTextColor={theme.textTertiary}
                  style={[
                    styles.input,
                    { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                  ]}
                />
              </View>
            </View>
          </Card>

          {/* ── 4. Contact & Operating Hours ────────────────────────────── */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="call" size={18} color={colors.primary[500]} />
              <Text variant="bodyLarge" bold style={{ marginLeft: 6 }}>
                Store Contact &amp; Business Hours
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Primary Phone Number *
              </Text>
              <TextInput
                value={primaryPhone}
                onChangeText={setPrimaryPhone}
                keyboardType="phone-pad"
                placeholder="+237 670 123 456"
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Secondary / WhatsApp Contact Number
              </Text>
              <TextInput
                value={secondaryPhone}
                onChangeText={setSecondaryPhone}
                keyboardType="phone-pad"
                placeholder="+237 699 876 543"
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Public Support Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="contact@doualatechhub.cm"
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" bold secondary style={styles.label}>
                Operating Hours *
              </Text>
              <TextInput
                value={operatingHours}
                onChangeText={setOperatingHours}
                placeholder="e.g. Mon - Sat: 8:00 AM - 6:30 PM (Closed Sundays)"
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: theme.border },
                ]}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Actions ────────────────────────────────────────── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePreviewPublicStore}
          style={[styles.previewBtn, { borderColor: colors.primary[500], backgroundColor: isDark ? 'rgba(13,148,136,0.15)' : '#ECFDF5' }]}
        >
          <Ionicons name="eye-outline" size={18} color={colors.primary[600]} />
          <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 4 }}>
            Preview Store
          </Text>
        </TouchableOpacity>

        <Button
          title="Save &amp; Publish Profile ✓"
          variant="primary"
          loading={saving}
          onPress={handleSaveProfile}
          style={{ flex: 1, backgroundColor: colors.primary[500] }}
        />
      </View>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          visible={!!toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  mediaSection: {
    position: 'relative',
    marginBottom: 44,
  },
  coverBannerBox: {
    height: 140,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  coverChangePill: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  logoPositionWrapper: {
    position: 'absolute',
    bottom: -36,
    left: spacing.base,
  },
  logoImageWrapper: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...shadows.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  logoCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  formContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  kycStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  inputGroup: {
    marginTop: spacing.sm,
  },
  label: {
    marginBottom: 4,
    fontSize: 11,
  },
  input: {
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 68,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  categoryChipsRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  gpsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
});

