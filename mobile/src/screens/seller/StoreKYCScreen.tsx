import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Input, Button, Card, Toast } from '../../components/ui';
import { ImagePickerGrid } from '../../components/seller/ImagePickerGrid';
import { ProductCategory } from '@wunabuy/types';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

const WUNABUY_LOGO = require('../../../assets/icon.png');

export const StoreKYCScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();

  const [currentStage, setCurrentStage] = useState<number>(1); // 1, 2, 3, 4, 5 (completed)

  // Form States
  // Stage 1
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([
    ProductCategory.ELECTRONICS,
  ]);

  // Stage 2
  const [addressText, setAddressText] = useState('');
  const [city, setCity] = useState('Douala');

  // Stage 3
  const [cniNumber, setCniNumber] = useState('');
  const [idFront, setIdFront] = useState<string[]>([]);
  const [idBack, setIdBack] = useState<string[]>([]);

  // Stage 4
  const [storefrontPhoto, setStorefrontPhoto] = useState<string[]>([]);
  const [businessRegDoc, setBusinessRegDoc] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category toggle handler for multi-select horizontal slider
  const toggleCategory = (cat: ProductCategory) => {
    setError('');
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) {
        setError('Please keep at least one category selected.');
        return;
      }
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Progress percentage calculation
  const getProgressPercentage = () => {
    switch (currentStage) {
      case 1:
        return '25%';
      case 2:
        return '50%';
      case 3:
        return '75%';
      case 4:
      case 5:
        return '100%';
      default:
        return '25%';
    }
  };

  const handleNextStage = () => {
    setError('');

    if (currentStage === 1) {
      if (!storeName.trim() || storeName.trim().length < 3) {
        setError('Please enter a valid store name (at least 3 characters).');
        return;
      }
      if (!description.trim() || description.trim().length < 10) {
        setError('Please provide a short business description (at least 10 characters).');
        return;
      }
      if (selectedCategories.length === 0) {
        setError('Please select at least one primary store category.');
        return;
      }
      setCurrentStage(2);
    } else if (currentStage === 2) {
      if (!addressText.trim()) {
        setError('Please enter your store physical street address in Douala/Yaoundé.');
        return;
      }
      setCurrentStage(3);
    } else if (currentStage === 3) {
      if (!cniNumber.trim()) {
        setError('Please enter your National ID / CNI Number.');
        return;
      }
      if (idFront.length === 0 || idBack.length === 0) {
        setError('Please upload clear photos of both Front and Back of your National ID Card.');
        return;
      }
      setCurrentStage(4);
    } else if (currentStage === 4) {
      if (storefrontPhoto.length === 0) {
        setError('Please upload a photo of your physical storefront / workshop.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setCurrentStage(5); // Completion celebration stage!
      }, 800);
    }
  };

  const handlePrevStage = () => {
    setError('');
    if (currentStage > 1 && currentStage < 5) {
      setCurrentStage((prev) => prev - 1);
    }
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <KeyboardAvoidingView
        style={styles.flexWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header Bar */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: theme.card }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text variant="h1" bold style={styles.headerTitle}>
              Store KYC Verification
            </Text>
            <Text variant="caption" secondary>
              {currentStage === 5 ? 'Application Submitted' : `Stage ${currentStage} of 4`}
            </Text>
          </View>
        </View>

        {/* Main Body Split: Top 80% Form Section + Bottom 20% Action Button Section */}
        <View style={styles.bodySplitContainer}>
          {/* Top 80% Form Section */}
          <View style={styles.formSection80}>
            {/* Animated Top Progress Bar & Step Indicators */}
            {currentStage < 5 && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: getProgressPercentage() as any, backgroundColor: colors.role.seller },
                    ]}
                  />
                </View>

                <View style={styles.stepLabelsRow}>
                  <Text
                    variant="caption"
                    bold={currentStage === 1}
                    color={currentStage >= 1 ? colors.role.seller : theme.textSecondary}
                  >
                    1. Basic
                  </Text>
                  <Text
                    variant="caption"
                    bold={currentStage === 2}
                    color={currentStage >= 2 ? colors.role.seller : theme.textSecondary}
                  >
                    2. Address
                  </Text>
                  <Text
                    variant="caption"
                    bold={currentStage === 3}
                    color={currentStage >= 3 ? colors.role.seller : theme.textSecondary}
                  >
                    3. Identity
                  </Text>
                  <Text
                    variant="caption"
                    bold={currentStage === 4}
                    color={currentStage >= 4 ? colors.role.seller : theme.textSecondary}
                  >
                    4. Storefront
                  </Text>
                </View>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* STAGE 1: Store Basic Details */}
              {currentStage === 1 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.seller }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        1
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="h2" bold>
                        Store Basic Details
                      </Text>
                      <Text variant="caption" secondary>
                        Enter official store details and select categories
                      </Text>
                    </View>
                  </View>

                  <Input
                    label="Store / Business Name *"
                    placeholder="e.g. Douala Tech Hub"
                    value={storeName}
                    onChangeText={(text) => {
                      setError('');
                      setStoreName(text);
                    }}
                    autoFocus
                    containerStyle={styles.inputSpacing}
                  />

                  {/* Flexible Multi-Line Business Description Textarea with Short Placeholder */}
                  <View style={styles.descriptionContainer}>
                    <View style={styles.descriptionHeaderRow}>
                      <Text variant="caption" bold color={theme.textSecondary}>
                        Short Business Description *
                      </Text>
                      <Text variant="caption" secondary style={styles.charCountText}>
                        {description.length}/300
                      </Text>
                    </View>
                    <Input
                      placeholder="Describe what your store sells..."
                      value={description}
                      onChangeText={(text) => {
                        setError('');
                        if (text.length <= 300) {
                          setDescription(text);
                        }
                      }}
                      multiline
                      numberOfLines={3}
                      style={styles.flexibleDescriptionInput}
                      containerStyle={styles.descriptionInputWrapper}
                    />
                  </View>

                  {/* Horizontal Category Slider with Multi-Select Checked State */}
                  <View style={styles.categorySection}>
                    <View style={styles.categorySectionHeader}>
                      <Text variant="caption" bold color={theme.textSecondary}>
                        Primary Store Categories *
                      </Text>
                      <Text variant="caption" color={colors.role.seller} bold>
                        {selectedCategories.length} Selected
                      </Text>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categorySliderContent}
                    >
                      {Object.values(ProductCategory).map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <TouchableOpacity
                            key={cat}
                            activeOpacity={0.8}
                            onPress={() => toggleCategory(cat)}
                            style={[
                              styles.categorySliderChip,
                              {
                                backgroundColor: isSelected
                                  ? colors.role.seller
                                  : (isDark ? colors.neutral[800] : theme.input),
                                borderColor: isSelected ? colors.role.seller : theme.border,
                              },
                            ]}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.neutral[0]}
                                style={{ marginRight: 5 }}
                              />
                            )}
                            <Text
                              variant="bodyMedium"
                              bold={isSelected}
                              color={isSelected ? colors.neutral[0] : theme.text}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </Card>
              )}

              {/* STAGE 2: Physical Location & Address */}
              {currentStage === 2 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.seller }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        2
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="h2" bold>
                        Location &amp; Address
                      </Text>
                      <Text variant="caption" secondary>
                        Provide your store street address in Cameroon
                      </Text>
                    </View>
                  </View>

                  <Input
                    label="Physical Street Address *"
                    placeholder="e.g. Rue Joss, Akwa, Bonanjo"
                    value={addressText}
                    onChangeText={(text) => {
                      setError('');
                      setAddressText(text);
                    }}
                    autoFocus
                    containerStyle={styles.inputSpacingLarge}
                  />

                  <Input
                    label="City *"
                    placeholder="Douala / Yaoundé"
                    value={city}
                    onChangeText={setCity}
                    containerStyle={styles.inputSpacingLarge}
                  />

                  <View style={[styles.gpsCardNotice, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                    <Ionicons name="location" size={24} color={colors.primary[500]} style={{ marginRight: spacing.md }} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyLarge" bold color={colors.primary[600]}>
                        GPS Location Auto-Pin Active
                      </Text>
                      <Text variant="caption" secondary style={{ marginTop: 2 }}>
                        Lat: 4.0510564, Lng: 9.7678687 (Akwa Merchant Hub)
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              {/* STAGE 3: Legal & Identity Verification */}
              {currentStage === 3 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.seller }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        3
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="h2" bold>
                        Government ID Verification
                      </Text>
                      <Text variant="caption" secondary>
                        Upload clear photos of your National ID Card
                      </Text>
                    </View>
                  </View>

                  <Input
                    label="National ID / CNI Number *"
                    placeholder="e.g. 1092849201"
                    value={cniNumber}
                    onChangeText={(text) => {
                      setError('');
                      setCniNumber(text);
                    }}
                    autoFocus
                    containerStyle={styles.inputSpacingLarge}
                  />

                  <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
                    National ID Card (Front Photo) *
                  </Text>
                  <ImagePickerGrid
                    images={idFront}
                    maxImages={1}
                    onAddImage={(uri) => {
                      setError('');
                      setIdFront([uri]);
                    }}
                    onRemoveImage={() => setIdFront([])}
                  />

                  <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
                    National ID Card (Back Photo) *
                  </Text>
                  <ImagePickerGrid
                    images={idBack}
                    maxImages={1}
                    onAddImage={(uri) => {
                      setError('');
                      setIdBack([uri]);
                    }}
                    onRemoveImage={() => setIdBack([])}
                  />
                </Card>
              )}

              {/* STAGE 4: Storefront & Ownership Proof */}
              {currentStage === 4 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.seller }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        4
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="h2" bold>
                        Storefront Verification
                      </Text>
                      <Text variant="caption" secondary>
                        Upload your physical storefront photo
                      </Text>
                    </View>
                  </View>

                  <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
                    Physical Storefront / Workshop Photo *
                  </Text>
                  <ImagePickerGrid
                    images={storefrontPhoto}
                    maxImages={1}
                    onAddImage={(uri) => {
                      setError('');
                      setStorefrontPhoto([uri]);
                    }}
                    onRemoveImage={() => setStorefrontPhoto([])}
                  />

                  <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
                    Business Registration or Affidavit (Optional)
                  </Text>
                  <ImagePickerGrid
                    images={businessRegDoc}
                    maxImages={1}
                    onAddImage={(uri) => setBusinessRegDoc([uri])}
                    onRemoveImage={() => setBusinessRegDoc([])}
                  />
                </Card>
              )}

              {/* STAGE 5: Completion Celebration & Verification Notice */}
              {currentStage === 5 && (
                <View style={styles.celebrationContainer}>
                  {/* Thank You Celebration Card */}
                  <View style={[styles.thankYouCard, { backgroundColor: isDark ? '#1E293B' : colors.role.seller }]}>
                    <View style={styles.celebrationLogoCircle}>
                      <Image source={WUNABUY_LOGO} style={styles.celebrationLogo} resizeMode="contain" />
                    </View>

                    <Text variant="h1" bold color={colors.neutral[0]} align="center" style={styles.thankYouTitle}>
                      Thank You for Becoming Part of Wunabuy Family! 🎉
                    </Text>

                    <Text variant="bodyMedium" color="rgba(255,255,255,0.9)" align="center" style={styles.thankYouSub}>
                      Your store registration documents have been successfully received and submitted to our verification team.
                    </Text>
                  </View>

                  {/* Status Notice Card */}
                  <Card style={styles.statusNoticeCard}>
                    <View style={styles.statusNoticeHeader}>
                      <View style={styles.timeIconCircle}>
                        <Ionicons name="time" size={24} color={colors.accent[500]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyLarge" bold color={colors.neutral[900]}>
                          KYC Verification Under Review
                        </Text>
                        <Text variant="caption" secondary style={{ marginTop: 2 }}>
                          Our compliance team will verify your documents within 24 hours. You will receive an instant notification &amp; SMS once approved.
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
              )}

              {/* High-End Error Callout Alert Banner */}
              {error ? (
                <View style={styles.errorCalloutCard}>
                  <Ionicons name="alert-circle-sharp" size={22} color={colors.semantic.error[500]} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" bold color={colors.semantic.error[700]}>
                      Validation Notice
                    </Text>
                    <Text variant="caption" color={colors.semantic.error[700]} style={{ marginTop: 1 }}>
                      {error}
                    </Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>

          {/* Bottom 20% Action Button Section */}
          <View style={[styles.actionSection20, { paddingBottom: Math.max(insets.bottom + spacing.xs, spacing.md) }]}>
            {currentStage < 5 ? (
              <View style={styles.actionRow}>
                {currentStage > 1 && (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={handlePrevStage}
                    style={[styles.advancedBackBtn, { borderColor: theme.border }]}
                  >
                    <Ionicons name="arrow-back-outline" size={18} color={theme.text} style={{ marginRight: 4 }} />
                    <Text variant="bodyLarge" bold color={theme.text}>
                      Back
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleNextStage}
                  style={[
                    styles.advancedContinueBtn,
                    currentStage === 1 && { flex: 1 },
                  ]}
                >
                  <Text variant="bodyLarge" bold color={colors.neutral[0]} style={{ marginRight: 6 }}>
                    {currentStage === 4 ? 'Submit Documents' : 'Continue to Next Stage'}
                  </Text>
                  <View style={styles.continueArrowCircle}>
                    <Ionicons name="arrow-forward-outline" size={18} color={colors.role.seller} />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                title="Go Back to Home Page →"
                variant="primary"
                onPress={() => navigation.navigate('BuyerHome')}
                style={styles.homeBtn}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {toastMessage && <Toast message={toastMessage} type="success" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flexWrapper: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
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
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
  },
  bodySplitContainer: {
    flex: 1,
    paddingHorizontal: spacing.base,
    justifyContent: 'space-between',
  },
  formSection80: {
    flex: 0.8,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  stageCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  stageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stageBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  inputSpacing: {
    marginBottom: spacing.sm,
  },
  inputSpacingLarge: {
    marginBottom: spacing.lg,
  },
  descriptionContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  descriptionHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  charCountText: {
    fontSize: 10,
  },
  descriptionInputWrapper: {
    width: '100%',
    marginBottom: 4,
  },
  flexibleDescriptionInput: {
    width: '100%',
    minHeight: 84,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  categorySection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  categorySliderContent: {
    gap: spacing.xs + 4,
    paddingVertical: spacing.xs,
  },
  categorySliderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  label: {
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  gpsCardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginTop: spacing.sm,
  },
  celebrationContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  thankYouCard: {
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  celebrationLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  celebrationLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  thankYouTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  thankYouSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  statusNoticeCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  errorCalloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.error[50],
    borderWidth: 1,
    borderColor: colors.semantic.error[500],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  actionSection20: {
    flex: 0.2,
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  advancedBackBtn: {
    flex: 1,
    height: 54,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedContinueBtn: {
    flex: 2,
    height: 54,
    borderRadius: borderRadius.full,
    backgroundColor: colors.role.seller,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    ...shadows.md,
  },
  continueArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtn: {
    width: '100%',
    height: 54,
    backgroundColor: colors.primary[500],
  },
});
