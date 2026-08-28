/**
 * TransporterKYCScreen.tsx
 *
 * Wunabuy Multi-Stage Transporter & Driver KYC Verification Form.
 * Matches the exact high-converting UX pattern established in StoreKYCScreen:
 * - 80% scrollable form container / 20% navigation action button split
 * - Animated progress bar tracking stages (25% -> 50% -> 75% -> 100%)
 * - High-contrast Error Callout Alert Banner on missing inputs
 * - 4-stage driver credential collection (Personal Details, Vehicle & Base, ID & License, Vehicle Docs)
 * - Stage 5 Completion Celebration Modal with 24-hour compliance queue notice
 *
 * @author   Wunabuy Engineering Team
 * @version  1.0.0
 */

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
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { KYCService } from '../../services/api';
import { UserRole } from '@wunabuy/types';

const WUNABUY_LOGO = require('../../../assets/icon.png');

export type VehicleType = 'motorcycle' | 'car' | 'van' | 'bicycle' | 'truck';

export interface VehicleOption {
  type: VehicleType;
  label: string;
  icon: string;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  { type: 'motorcycle', label: 'Motorcycle / Moto-Taxi', icon: '🏍️' },
  { type: 'car', label: 'Passenger Car / Sedan', icon: '🚗' },
  { type: 'van', label: 'Delivery Van / Pickup', icon: '🚐' },
  { type: 'bicycle', label: 'Bicycle / E-Bike', icon: '🚲' },
  { type: 'truck', label: 'Light Cargo Truck', icon: '🚚' },
];

export const TransporterKYCScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();
  const { setActiveRole } = useAuthStore();

  const [currentStage, setCurrentStage] = useState<number>(1); // 1, 2, 3, 4, 5 (completed)

  // Form States
  // Stage 1: Personal Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+237 6');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [driverBio, setDriverBio] = useState('');

  // Stage 2: Vehicle & Operating Base
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('motorcycle');
  const [vehicleModel, setVehicleModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [city, setCity] = useState('Douala');
  const [baseQuarter, setBaseQuarter] = useState('Akwa / Bonanjo');

  // Stage 3: National ID & Driver's License
  const [cniNumber, setCniNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [idFront, setIdFront] = useState<string[]>([]);
  const [idBack, setIdBack] = useState<string[]>([]);
  const [driverLicensePhoto, setDriverLicensePhoto] = useState<string[]>([]);

  // Stage 4: Vehicle Documentation & Photos
  const [vehicleRegDoc, setVehicleRegDoc] = useState<string[]>([]);
  const [vehicleInsuranceDoc, setVehicleInsuranceDoc] = useState<string[]>([]);
  const [vehiclePhoto, setVehiclePhoto] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      if (!fullName.trim() || fullName.trim().length < 3) {
        setError('Please enter your full legal driver name (at least 3 characters).');
        return;
      }
      if (!phone.trim() || phone.trim().length < 9) {
        setError('Please enter a valid driver phone number.');
        return;
      }
      if (!emergencyPhone.trim() || emergencyPhone.trim().length < 9) {
        setError('Please enter an emergency contact phone number.');
        return;
      }
      if (!driverBio.trim() || driverBio.trim().length < 10) {
        setError('Please provide a brief driver experience summary (at least 10 characters).');
        return;
      }
      setCurrentStage(2);
    } else if (currentStage === 2) {
      if (!vehicleModel.trim()) {
        setError('Please specify your vehicle make & model (e.g. Yamaha Crypton, Toyota Yaris).');
        return;
      }
      if (!licensePlate.trim() && selectedVehicleType !== 'bicycle') {
        setError('Please enter your vehicle license plate number.');
        return;
      }
      if (!baseQuarter.trim()) {
        setError('Please specify your primary quarter / base operating station.');
        return;
      }
      setCurrentStage(3);
    } else if (currentStage === 3) {
      if (!cniNumber.trim()) {
        setError('Please enter your National ID / CNI Number.');
        return;
      }
      if (selectedVehicleType !== 'bicycle' && !licenseNumber.trim()) {
        setError('Please enter your valid Driver’s License Number.');
        return;
      }
      if (idFront.length === 0 || idBack.length === 0) {
        setError('Please upload clear photos of both Front and Back of your National ID Card.');
        return;
      }
      if (selectedVehicleType !== 'bicycle' && driverLicensePhoto.length === 0) {
        setError('Please upload a clear photo of your Driver’s License.');
        return;
      }
      setCurrentStage(4);
    } else if (currentStage === 4) {
      if (selectedVehicleType !== 'bicycle' && vehicleRegDoc.length === 0) {
        setError('Please upload your Vehicle Registration / Carte Grise document.');
        return;
      }
      if (selectedVehicleType !== 'bicycle' && vehicleInsuranceDoc.length === 0) {
        setError('Please upload your active Vehicle Insurance / Assurance photo.');
        return;
      }
      if (vehiclePhoto.length === 0) {
        setError('Please upload a clear photo of your delivery vehicle showing the license plate.');
        return;
      }

      // Submit Form to Stage 5
      setLoading(true);
      KYCService.submitTransporterKYC({
        driver_name: fullName.trim(),
        phone: phone.trim(),
        bio: driverBio.trim(),
        vehicle_type: selectedVehicleType === 'bicycle' ? 'bike' : (selectedVehicleType as any),
        license_plate: licensePlate.trim(),
        base_station_quarter: baseQuarter.trim(),
        city: city || 'Douala',
        cni_number: cniNumber.trim(),
        id_card_front: idFront[0] || '',
        id_card_back: idBack[0] || '',
        drivers_license_photo: driverLicensePhoto[0] || '',
        carte_grise_photo: vehicleRegDoc[0] || '',
        vehicle_assurance_photo: vehicleInsuranceDoc[0] || '',
        vehicle_exterior_photo: vehiclePhoto[0] || '',
      }).finally(() => {
        setLoading(false);
        setCurrentStage(5);
      });
    }
  };

  const handlePrevStage = () => {
    setError('');
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  const handleHeaderBack = () => {
    if (currentStage > 1 && currentStage < 5) {
      handlePrevStage();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      setActiveRole(UserRole.BUYER);
      navigation.reset({
        index: 0,
        routes: [{ name: 'BuyerApp' }],
      });
    }
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Top Header Bar (~10% Height) — Logo-Free & Modern */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleHeaderBack}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text variant="h2" bold style={styles.headerTitleText}>
            Driver KYC Verification
          </Text>
          <Text variant="caption" secondary>
            {currentStage < 5 ? `Stage ${currentStage} of 4` : 'Verification Complete'}
          </Text>
        </View>

        <View
          style={[
            styles.headerStatusBadge,
            {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={13} color={colors.role.transporter} />
          <Text variant="caption" bold color={colors.role.transporter} style={{ marginLeft: 4 }}>
            VERIFIED
          </Text>
        </View>
      </View>

      {/* Animated Stage Progress Bar */}
      {currentStage < 5 && (
        <View style={styles.progressSection}>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? colors.neutral[800] : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: getProgressPercentage(), backgroundColor: colors.role.transporter },
              ]}
            />
          </View>

          {/* Stage Indicators */}
          <View style={styles.stagesRow}>
            <Text
              variant="caption"
              bold={currentStage === 1}
              color={currentStage >= 1 ? colors.role.transporter : theme.textSecondary}
            >
              1. Driver Info
            </Text>
            <Text
              variant="caption"
              bold={currentStage === 2}
              color={currentStage >= 2 ? colors.role.transporter : theme.textSecondary}
            >
              2. Vehicle &amp; Base
            </Text>
            <Text
              variant="caption"
              bold={currentStage === 3}
              color={currentStage >= 3 ? colors.role.transporter : theme.textSecondary}
            >
              3. ID &amp; License
            </Text>
            <Text
              variant="caption"
              bold={currentStage === 4}
              color={currentStage >= 4 ? colors.role.transporter : theme.textSecondary}
            >
              4. Vehicle Docs
            </Text>
          </View>
        </View>
      )}

      {/* Main Content Layout: 80% Form Container / 20% Action Button Split */}
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.bodySplitLayout}>
          {/* ── 80% Form Card Container ────────────────────────────────────────── */}
          <View style={styles.formOuterContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formScrollContent}
            >
              {/* STAGE 1: Driver Personal Details */}
              {currentStage === 1 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.transporter }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        1
                      </Text>
                    </View>
                    <View style={styles.stageHeaderTextCol}>
                      <Text variant="h2" bold>
                        Personal Driver Details
                      </Text>
                      <Text variant="caption" secondary>
                        Enter official driver identity and contact information
                      </Text>
                    </View>
                  </View>

                  {/* High-Contrast Error Callout Alert Banner */}
                  {error ? (
                    <View style={styles.errorAlertBanner}>
                      <Ionicons name="alert-circle-sharp" size={18} color="#EF4444" style={styles.errorAlertIcon} />
                      <Text variant="caption" bold color="#B91C1C" style={styles.errorAlertText}>
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* Full Driver Name Input */}
                  <Input
                    label="Full Legal Driver Name *"
                    placeholder="e.g. Jean-Pierre Manga"
                    value={fullName}
                    onChangeText={(text) => {
                      setError('');
                      setFullName(text);
                    }}
                    containerStyle={styles.inputSpacing}
                  />

                  {/* Driver Contact Phone */}
                  <Input
                    label="Active Phone Number (SMS / WhatsApp) *"
                    placeholder="+237 6XX XXX XXX"
                    value={phone}
                    keyboardType="phone-pad"
                    onChangeText={(text) => {
                      setError('');
                      setPhone(text);
                    }}
                    containerStyle={styles.inputSpacing}
                  />

                  {/* Emergency Contact Phone */}
                  <Input
                    label="Emergency Contact Phone Number *"
                    placeholder="+237 6XX XXX XXX (Kin / Contact)"
                    value={emergencyPhone}
                    keyboardType="phone-pad"
                    onChangeText={(text) => {
                      setError('');
                      setEmergencyPhone(text);
                    }}
                    containerStyle={styles.inputSpacing}
                  />

                  {/* Driver Experience Summary Textarea */}
                  <View style={styles.descriptionContainer}>
                    <View style={styles.descriptionHeaderRow}>
                      <Text variant="caption" bold color={theme.textSecondary}>
                        Driver Experience &amp; City Knowledge *
                      </Text>
                      <Text variant="caption" secondary style={styles.charCountText}>
                        {driverBio.length}/300
                      </Text>
                    </View>
                    <Input
                      placeholder="Describe your delivery experience and quarters you know best..."
                      value={driverBio}
                      onChangeText={(text) => {
                        setError('');
                        if (text.length <= 300) {
                          setDriverBio(text);
                        }
                      }}
                      multiline
                      numberOfLines={4}
                      inputContainerStyle={styles.descriptionInputContainer}
                      style={styles.flexibleDescriptionInput}
                      containerStyle={styles.descriptionInputWrapper}
                    />
                  </View>
                </Card>
              )}

              {/* STAGE 2: Vehicle Type & Operating Base */}
              {currentStage === 2 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.transporter }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        2
                      </Text>
                    </View>
                    <View style={styles.stageHeaderTextCol}>
                      <Text variant="h2" bold>
                        Vehicle &amp; Operating Base
                      </Text>
                      <Text variant="caption" secondary>
                        Select your vehicle category and base dispatch location
                      </Text>
                    </View>
                  </View>

                  {/* High-Contrast Error Callout Alert Banner */}
                  {error ? (
                    <View style={styles.errorAlertBanner}>
                      <Ionicons name="alert-circle-sharp" size={18} color="#EF4444" style={styles.errorAlertIcon} />
                      <Text variant="caption" bold color="#B91C1C" style={styles.errorAlertText}>
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* Vehicle Type Selection Slider */}
                  <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
                    Delivery Vehicle Class *
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.vehicleSlider}
                  >
                    {VEHICLE_OPTIONS.map((v) => {
                      const isSelected = selectedVehicleType === v.type;
                      return (
                        <TouchableOpacity
                          key={v.type}
                          activeOpacity={0.8}
                          onPress={() => {
                            setError('');
                            setSelectedVehicleType(v.type);
                          }}
                          style={[
                            styles.vehicleOptionCard,
                            {
                              backgroundColor: isSelected
                                ? colors.role.transporter
                                : isDark
                                ? colors.neutral[800]
                                : '#F8FAFC',
                              borderColor: isSelected ? colors.role.transporter : theme.border,
                            },
                          ]}
                        >
                          <Text style={styles.vehicleEmoji}>{v.icon}</Text>
                          <Text
                            variant="caption"
                            bold
                            color={isSelected ? colors.neutral[0] : theme.text}
                            style={styles.vehicleOptionLabel}
                          >
                            {isSelected ? `✓ ${v.label}` : v.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Vehicle Make & Model */}
                  <Input
                    label="Vehicle Make & Model *"
                    placeholder="e.g. Yamaha Crypton 115 / Senke 125"
                    value={vehicleModel}
                    onChangeText={(text) => {
                      setError('');
                      setVehicleModel(text);
                    }}
                    containerStyle={styles.inputSpacing}
                  />

                  {/* License Plate Number */}
                  {selectedVehicleType !== 'bicycle' && (
                    <Input
                      label="Vehicle License Plate Number *"
                      placeholder="e.g. LT 4821 C / CE 9022 D"
                      value={licensePlate}
                      autoCapitalize="characters"
                      onChangeText={(text) => {
                        setError('');
                        setLicensePlate(text);
                      }}
                      containerStyle={styles.inputSpacing}
                    />
                  )}

                  {/* City Selector */}
                  <Input
                    label="Primary Operating City *"
                    placeholder="Douala"
                    value={city}
                    onChangeText={setCity}
                    containerStyle={styles.inputSpacing}
                  />

                  {/* Base Quarter / Station */}
                  <Input
                    label="Primary Quarter / Base Station *"
                    placeholder="e.g. Akwa / Bonanjo / Deido"
                    value={baseQuarter}
                    onChangeText={(text) => {
                      setError('');
                      setBaseQuarter(text);
                    }}
                    containerStyle={styles.inputSpacing}
                  />
                </Card>
              )}

              {/* STAGE 3: National ID & Driver's License */}
              {currentStage === 3 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.transporter }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        3
                      </Text>
                    </View>
                    <View style={styles.stageHeaderTextCol}>
                      <Text variant="h2" bold>
                        National ID &amp; License
                      </Text>
                      <Text variant="caption" secondary>
                        Upload government-issued CNI and driver's license
                      </Text>
                    </View>
                  </View>

                  {/* High-Contrast Error Callout Alert Banner */}
                  {error ? (
                    <View style={styles.errorAlertBanner}>
                      <Ionicons name="alert-circle-sharp" size={18} color="#EF4444" style={styles.errorAlertIcon} />
                      <Text variant="caption" bold color="#B91C1C" style={styles.errorAlertText}>
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* National ID Number */}
                  <Input
                    label="National ID Card (CNI) Number *"
                    placeholder="e.g. 10892019482019"
                    value={cniNumber}
                    keyboardType="number-pad"
                    onChangeText={(text) => {
                      setError('');
                      setCniNumber(text);
                    }}
                    containerStyle={styles.inputSpacing}
                  />

                  {/* Driver's License Number */}
                  {selectedVehicleType !== 'bicycle' && (
                    <Input
                      label="Driver’s License (Permis de Conduire) Number *"
                      placeholder="e.g. PC-2024-LT-9482"
                      value={licenseNumber}
                      onChangeText={(text) => {
                        setError('');
                        setLicenseNumber(text);
                      }}
                      containerStyle={styles.inputSpacing}
                    />
                  )}

                  {/* Photo of CNI Front */}
                  <Text variant="caption" bold color={theme.textSecondary} style={styles.uploadLabel}>
                    National ID Card (CNI) — FRONT PHOTO *
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

                  {/* Photo of CNI Back */}
                  <Text variant="caption" bold color={theme.textSecondary} style={styles.uploadLabel}>
                    National ID Card (CNI) — BACK PHOTO *
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

                  {/* Photo of Driver's License */}
                  {selectedVehicleType !== 'bicycle' && (
                    <>
                      <Text variant="caption" bold color={theme.textSecondary} style={styles.uploadLabel}>
                        Driver's License (Permis de Conduire) PHOTO *
                      </Text>
                      <ImagePickerGrid
                        images={driverLicensePhoto}
                        maxImages={1}
                        onAddImage={(uri) => {
                          setError('');
                          setDriverLicensePhoto([uri]);
                        }}
                        onRemoveImage={() => setDriverLicensePhoto([])}
                      />
                    </>
                  )}
                </Card>
              )}

              {/* STAGE 4: Vehicle Documentation & Vehicle Photo */}
              {currentStage === 4 && (
                <Card style={styles.stageCard}>
                  <View style={styles.stageCardHeader}>
                    <View style={[styles.stageBadgeCircle, { backgroundColor: colors.role.transporter }]}>
                      <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                        4
                      </Text>
                    </View>
                    <View style={styles.stageHeaderTextCol}>
                      <Text variant="h2" bold>
                        Vehicle Papers &amp; Photo
                      </Text>
                      <Text variant="caption" secondary>
                        Upload registration, insurance &amp; vehicle exterior photo
                      </Text>
                    </View>
                  </View>

                  {/* High-Contrast Error Callout Alert Banner */}
                  {error ? (
                    <View style={styles.errorAlertBanner}>
                      <Ionicons name="alert-circle-sharp" size={18} color="#EF4444" style={styles.errorAlertIcon} />
                      <Text variant="caption" bold color="#B91C1C" style={styles.errorAlertText}>
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* Vehicle Registration / Carte Grise */}
                  {selectedVehicleType !== 'bicycle' && (
                    <>
                      <Text variant="caption" bold color={theme.textSecondary} style={styles.uploadLabel}>
                        Vehicle Registration (Carte Grise) PHOTO *
                      </Text>
                      <ImagePickerGrid
                        images={vehicleRegDoc}
                        maxImages={1}
                        onAddImage={(uri) => {
                          setError('');
                          setVehicleRegDoc([uri]);
                        }}
                        onRemoveImage={() => setVehicleRegDoc([])}
                      />

                      {/* Vehicle Insurance Photo */}
                      <Text variant="caption" bold color={theme.textSecondary} style={styles.uploadLabel}>
                        Vehicle Insurance (Assurance) PHOTO *
                      </Text>
                      <ImagePickerGrid
                        images={vehicleInsuranceDoc}
                        maxImages={1}
                        onAddImage={(uri) => {
                          setError('');
                          setVehicleInsuranceDoc([uri]);
                        }}
                        onRemoveImage={() => setVehicleInsuranceDoc([])}
                      />
                    </>
                  )}

                  {/* Exterior Photo of Vehicle */}
                  <Text variant="caption" bold color={theme.textSecondary} style={styles.uploadLabel}>
                    Photo of Delivery Vehicle (License Plate Visible) *
                  </Text>
                  <ImagePickerGrid
                    images={vehiclePhoto}
                    maxImages={1}
                    onAddImage={(uri) => {
                      setError('');
                      setVehiclePhoto([uri]);
                    }}
                    onRemoveImage={() => setVehiclePhoto([])}
                  />
                </Card>
              )}

              {/* STAGE 5: Completion Celebration Notice */}
              {currentStage === 5 && (
                <Card style={[styles.stageCard, styles.celebrationCard]}>
                  <View style={[styles.celebrationIconCircle, { backgroundColor: colors.role.transporter + '20' }]}>
                    <Ionicons name="checkmark-done-circle" size={72} color={colors.role.transporter} />
                  </View>

                  <Text variant="h1" bold style={styles.celebrationTitle}>
                    Driver Verification Submitted! 🎉
                  </Text>

                  <Text variant="bodyMedium" secondary style={styles.celebrationText}>
                    Your transporter application, vehicle papers, and driver's license have been securely submitted to Wunabuy Fleet Operations in Douala.
                  </Text>

                  <View style={[styles.reviewNoticeBox, { backgroundColor: isDark ? colors.neutral[800] : '#FFFBEB' }]}>
                    <Ionicons name="time-outline" size={20} color={colors.accent[500]} />
                    <View style={styles.reviewNoticeTextCol}>
                      <Text variant="caption" bold color={colors.accent[500]}>
                        24-Hour Review Window
                      </Text>
                      <Text variant="caption" secondary>
                        You will receive an automated SMS &amp; push alert once your driver badge is approved for dispatch.
                      </Text>
                    </View>
                  </View>

                  <Button
                    title="Back to Home Dashboard ➔"
                    variant="primary"
                    onPress={() => {
                      setActiveRole(UserRole.BUYER);
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'BuyerApp' }],
                      });
                    }}
                    style={[styles.celebrationActionBtn, { backgroundColor: colors.role.transporter }]}
                  />
                </Card>
              )}
            </ScrollView>
          </View>

          {/* ── 20% Action Button Container ───────────────────────────────────── */}
          {currentStage < 5 && (
            <View
              style={[
                styles.actionButtonsContainer,
                {
                  backgroundColor: theme.background,
                  paddingBottom: Math.max(insets.bottom + spacing.xs, spacing.md),
                },
              ]}
            >
              {currentStage > 1 ? (
                <View style={styles.dualActionRow}>
                  {/* Previous Stage Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePrevStage}
                    style={[styles.prevStageBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  >
                    <Ionicons name="arrow-back" size={18} color={theme.text} />
                    <Text variant="bodyMedium" bold style={{ marginLeft: 6 }}>
                      Back
                    </Text>
                  </TouchableOpacity>

                  {/* Next / Submit Stage Button */}
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleNextStage}
                    disabled={loading}
                    style={[
                      styles.nextStageBtn,
                      { backgroundColor: colors.role.transporter },
                    ]}
                  >
                    <Text variant="bodyLarge" bold color={colors.neutral[0]}>
                      {currentStage === 4 ? (loading ? 'Submitting...' : 'Submit Verification ➔') : 'Continue to Next Stage'}
                    </Text>
                    {currentStage < 4 && (
                      <View style={styles.nextArrowCircle}>
                        <Ionicons name="arrow-forward" size={16} color={colors.role.transporter} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                /* Stage 1 Single Capsule Continue Button */
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleNextStage}
                  style={[styles.singleCapsuleBtn, { backgroundColor: colors.role.transporter }]}
                >
                  <Text variant="bodyLarge" bold color={colors.neutral[0]} style={styles.singleCapsuleBtnText}>
                    Continue to Next Stage
                  </Text>
                  <View style={styles.singleArrowCircle}>
                    <Ionicons name="arrow-forward" size={18} color={colors.role.transporter} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {toastMessage && <Toast message={toastMessage} type="info" />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitleText: {
    fontSize: 18,
  },
  headerStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  progressSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bodySplitLayout: {
    flex: 1,
    justifyContent: 'space-between',
  },
  formOuterContainer: {
    flex: 0.80, // Takes 80% height of the body split
  },
  formScrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  stageCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  stageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stageBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stageHeaderTextCol: {
    flex: 1,
  },
  errorAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  errorAlertIcon: {
    marginRight: spacing.xs + 2,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  inputSpacing: {
    marginBottom: spacing.sm,
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
  descriptionInputContainer: {
    minHeight: 110,
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  flexibleDescriptionInput: {
    width: '100%',
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  vehicleSlider: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  vehicleOptionCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vehicleEmoji: {
    fontSize: 18,
  },
  vehicleOptionLabel: {
    fontSize: 12,
  },
  uploadLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  celebrationCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  celebrationIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  celebrationTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  celebrationText: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  reviewNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    width: '100%',
  },
  reviewNoticeTextCol: {
    flex: 1,
  },
  celebrationActionBtn: {
    width: '100%',
    height: 52,
    marginBottom: spacing.sm,
  },
  returnHomeBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsContainer: {
    flex: 0.20, // Takes 20% height of the body split
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  singleCapsuleBtn: {
    height: 54,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    ...shadows.md,
  },
  singleCapsuleBtnText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  singleArrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prevStageBtn: {
    height: 52,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStageBtn: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  nextArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
