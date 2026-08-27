import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Input, Button, Card, Toast, Badge } from '../../components/ui';
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
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.ELECTRONICS);

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

  // Progress percentage
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
      setCurrentStage(2);
    } else if (currentStage === 2) {
      if (!addressText.trim()) {
        setError('Please enter your store physical street address.');
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* STAGE 1: Store Basic Details */}
        {currentStage === 1 && (
          <Card style={styles.stageCard}>
            <View style={styles.stageCardHeader}>
              <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.seller }]}>
                <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                  1
                </Text>
              </View>
              <View>
                <Text variant="h2" bold>
                  Store Basic Details
                </Text>
                <Text variant="caption" secondary>
                  Enter your official store name and category
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

            <Input
              label="Short Business Description"
              placeholder="e.g. Quality electronics, laptops, and original phone accessories."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              containerStyle={styles.inputSpacing}
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
                        backgroundColor: isSelected ? colors.role.seller : theme.input,
                        borderColor: isSelected ? colors.role.seller : theme.border,
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
              <View>
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
              containerStyle={styles.inputSpacing}
            />

            <Input
              label="City"
              placeholder="Douala / Yaoundé"
              value={city}
              onChangeText={setCity}
              containerStyle={styles.inputSpacing}
            />

            <View style={[styles.gpsCardNotice, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
              <Ionicons name="location" size={20} color={colors.primary[500]} style={{ marginRight: spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" bold color={colors.primary[600]}>
                  GPS Location Auto-Pin
                </Text>
                <Text variant="caption" secondary style={{ fontSize: 10 }}>
                  Lat: 4.0510564, Lng: 9.7678687 (Douala Hub)
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
              <View>
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
              containerStyle={styles.inputSpacing}
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
              <View>
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

            {/* Primary Go Back to Home Button */}
            <Button
              title="Go Back to Home Page →"
              variant="primary"
              onPress={() => navigation.navigate('BuyerHome')}
              style={styles.homeBtn}
            />
          </View>
        )}

        {/* Error Notice */}
        {error ? (
          <Text variant="caption" color={colors.semantic.error[500]} align="center" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        {/* Navigation Action Buttons (Stages 1-4) */}
        {currentStage < 5 && (
          <View style={styles.actionRow}>
            {currentStage > 1 && (
              <Button
                title="← Back"
                variant="outline"
                onPress={handlePrevStage}
                style={styles.prevBtn}
              />
            )}

            <Button
              title={currentStage === 4 ? 'Submit KYC Documents ➔' : 'Continue to Next Stage →'}
              variant="primary"
              loading={loading}
              onPress={handleNextStage}
              style={[styles.nextBtn, currentStage === 1 && { width: '100%' }]}
            />
          </View>
        )}
      </ScrollView>

      {toastMessage && <Toast message={toastMessage} type="success" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
  progressContainer: {
    paddingHorizontal: spacing.base,
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
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  stageCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stageBadgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSpacing: {
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
  gpsCardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
  },
  celebrationContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
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
    marginBottom: spacing.xl,
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
  homeBtn: {
    height: 52,
    backgroundColor: colors.primary[500],
  },
  errorText: {
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  prevBtn: {
    flex: 1,
    height: 48,
  },
  nextBtn: {
    flex: 1.5,
    height: 48,
    backgroundColor: colors.role.seller,
  },
});
