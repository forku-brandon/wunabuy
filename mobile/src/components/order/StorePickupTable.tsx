import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from '../ui/Text';
import { Badge } from '../ui/Badge';

export interface StorePickupTableProps {
  pickupPin: string;
  storeName?: string;
  addressText?: string;
  landmarkDirections?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  operatingHours?: string;
  riderInstructions?: string;
  latitude?: number;
  longitude?: number;
  maxHeight?: number;
  style?: ViewStyle;
}

const COL1_WIDTH = 140;
const COL2_WIDTH = 340;
const TABLE_TOTAL_WIDTH = COL1_WIDTH + COL2_WIDTH;

export const StorePickupTable: React.FC<StorePickupTableProps> = ({
  pickupPin = '84920',
  storeName = 'Douala Tech Hub (Akwa Branch)',
  addressText = 'Rue Joss, Quartier Akwa, Douala, Cameroon',
  landmarkDirections = 'Opposite Place du Gouvernement, Next to Akwa Mall (1st Floor, Suite 104)',
  primaryPhone = '+237 670 123 456',
  secondaryPhone = '+237 699 876 543',
  operatingHours = 'Mon - Sat: 8:00 AM - 6:30 PM',
  riderInstructions = 'Present 5-digit PIN at counter #2 for parcel release.',
  latitude = 4.0510,
  longitude = 9.7679,
  maxHeight = 220,
  style,
}) => {
  const { theme, isDark } = useThemeStore();

  const handleCall = (phoneNum: string) => {
    const digits = phoneNum.replace(/[^+\d]/g, '');
    if (digits) {
      Linking.openURL(`tel:${digits}`).catch(() => {});
    }
  };

  const handleOpenMap = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(mapsUrl).catch(() => {});
  };

  const contactString = `${primaryPhone}${secondaryPhone ? ' / ' + secondaryPhone : ''}`;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC', borderColor: isDark ? colors.neutral[800] : colors.neutral[200] }, style]}>
      {/* Rider Verification PIN Hero Header */}
      <View style={[styles.pinHeroBox, { backgroundColor: isDark ? colors.neutral[800] : '#ECFDF5', borderColor: colors.primary[400] }]}>
        <View style={styles.pinHeaderRow}>
          <Ionicons name="key" size={18} color={colors.primary[600]} />
          <Text variant="caption" bold color={colors.primary[700]} style={styles.pinHeaderText}>
            PERSONAL RIDER VERIFICATION PIN
          </Text>
        </View>

        <View style={styles.pinNumberContainer}>
          <Text variant="h1" bold color={colors.primary[600]} style={styles.pinText}>
            #{pickupPin}
          </Text>
        </View>

        <Text variant="caption" secondary style={styles.pinInstruction}>
          Give code <Text bold color={theme.text}>#{pickupPin}</Text> to your courier to present at the store counter upon arrival.
        </Text>
      </View>

      {/* Section Header */}
      <View style={styles.tableSectionTitleRow}>
        <Ionicons name="location" size={16} color={colors.primary[600]} />
        <Text variant="caption" bold color={colors.primary[600]} style={{ marginLeft: 6 }}>
          DETAILED STORE PICKUP SPECIFICATIONS:
        </Text>
      </View>

      {/* Bidirectional 2D Scrollable Table Container (Up/Down + Left/Right) */}
      <View style={[styles.tableOuterWrapper, { maxHeight, borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            persistentScrollbar={true}
            contentContainerStyle={{ width: TABLE_TOTAL_WIDTH }}
          >
            <View style={{ width: TABLE_TOTAL_WIDTH }}>
              {/* Table Header Row */}
              <View style={[styles.tableHeaderRow, { backgroundColor: isDark ? colors.neutral[800] : '#E2E8F0', borderBottomColor: isDark ? colors.neutral[700] : '#CBD5E1' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Text variant="caption" bold style={{ color: theme.textSecondary, fontSize: 10 }}>
                    SPECIFICATION
                  </Text>
                </View>
                <View style={[styles.cellVal, { width: COL2_WIDTH }]}>
                  <Text variant="caption" bold style={{ color: theme.textSecondary, fontSize: 10 }}>
                    DETAILS & DIRECTIONS
                  </Text>
                </View>
              </View>

              {/* Row 1: Store Name */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="storefront-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    Store Name
                  </Text>
                </View>
                <View style={[styles.cellVal, { width: COL2_WIDTH }]}>
                  <Text variant="caption" bold color={colors.primary[600]}>
                    {storeName}
                  </Text>
                </View>
              </View>

              {/* Row 2: Physical Address */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? colors.neutral[800] : '#F1F5F9', backgroundColor: isDark ? 'transparent' : '#FAFAFA' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="location-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    Physical Address
                  </Text>
                </View>
                <View style={[styles.cellVal, { width: COL2_WIDTH }]}>
                  <Text variant="caption" secondary>
                    {addressText}
                  </Text>
                </View>
              </View>

              {/* Row 3: Landmark Directions */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="compass-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    Landmarks
                  </Text>
                </View>
                <View style={[styles.cellVal, { width: COL2_WIDTH }]}>
                  <Text variant="caption" secondary>
                    {landmarkDirections}
                  </Text>
                </View>
              </View>

              {/* Row 4: Store Contacts (Tap to Call) */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? colors.neutral[800] : '#F1F5F9', backgroundColor: isDark ? 'transparent' : '#FAFAFA' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="call-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    Store Phone
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleCall(primaryPhone)}
                  style={[styles.cellVal, { width: COL2_WIDTH }]}
                >
                  <Text variant="caption" bold color={colors.primary[600]} style={{ textDecorationLine: 'underline' }}>
                    {contactString} 📞
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Row 5: Operating Hours */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="time-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    Counter Hours
                  </Text>
                </View>
                <View style={[styles.cellVal, { width: COL2_WIDTH }]}>
                  <Text variant="caption" secondary>
                    {operatingHours}
                  </Text>
                </View>
              </View>

              {/* Row 6: GPS Directions (Tap for Maps) */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? colors.neutral[800] : '#F1F5F9', backgroundColor: isDark ? 'transparent' : '#FAFAFA' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="map-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    GPS Location
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOpenMap}
                  style={[styles.cellVal, { width: COL2_WIDTH }]}
                >
                  <Text variant="caption" bold color={colors.primary[600]} style={{ textDecorationLine: 'underline' }}>
                    {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E (Open Maps 🗺️)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Row 7: Rider Instructions */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="document-text-outline" size={14} color={colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    Counter Specs
                  </Text>
                </View>
                <View style={[styles.cellVal, { width: COL2_WIDTH }]}>
                  <Text variant="caption" secondary>
                    {riderInstructions}
                  </Text>
                </View>
              </View>

              {/* Row 8: Verified Merchant Status */}
              <View style={[styles.tableRow, { borderBottomWidth: 0, backgroundColor: isDark ? 'transparent' : '#FAFAFA' }]}>
                <View style={[styles.cellKey, { width: COL1_WIDTH }]}>
                  <Ionicons name="checkmark-seal-outline" size={14} color={colors.semantic.success[500]} style={{ marginRight: 6 }} />
                  <Text variant="caption" bold color={theme.text} numberOfLines={1}>
                    Verification
                  </Text>
                </View>
                <View style={[styles.cellVal, { width: COL2_WIDTH }]}>
                  <Badge label="Verified Store 🏬✓" variant="success" size="small" />
                </View>
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  pinHeroBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  pinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinHeaderText: {
    marginLeft: 6,
    fontSize: 11,
    flex: 1,
  },
  pinNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  pinText: {
    letterSpacing: 4,
    fontSize: 26,
  },
  pinInstruction: {
    fontSize: 11,
    textAlign: 'center',
  },
  tableSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: 2,
  },
  tableOuterWrapper: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 3,
    borderBottomWidth: 1,
  },
  cellKey: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xs,
  },
  cellVal: {
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },
});
