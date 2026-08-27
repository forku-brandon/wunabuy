import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface PartnerItem {
  id: string;
  name: string;
  category: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  badge: string;
}

const PARTNERS: PartnerItem[] = [
  {
    id: 'partner_1',
    name: 'MTN MoMo',
    category: 'Mobile Money Escrow',
    iconName: 'phone-portrait-outline',
    iconColor: '#F59E0B',
    badge: '1-Tap Cashout',
  },
  {
    id: 'partner_2',
    name: 'Orange Money',
    category: 'Mobile Wallet Partner',
    iconName: 'wallet-outline',
    iconColor: '#F97316',
    badge: 'Instant Transfer',
  },
  {
    id: 'partner_3',
    name: 'Flutterwave',
    category: 'PCI-DSS Escrow Gateway',
    iconName: 'card-outline',
    iconColor: '#0D9488',
    badge: 'Verified Gateway',
  },
  {
    id: 'partner_4',
    name: 'DHL Logistics',
    category: 'Regional Express Freight',
    iconName: 'airplane-outline',
    iconColor: '#E11D48',
    badge: 'Freight Partner',
  },
  {
    id: 'partner_5',
    name: 'Ecobank Cameroon',
    category: 'Bank Settlement Partner',
    iconName: 'business-outline',
    iconColor: '#2563EB',
    badge: 'Bank Partner',
  },
];

export const PartnersCarousel: React.FC = () => {
  const { theme, isDark } = useThemeStore();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Text variant="h2" bold style={styles.title}>
            Official Partners
          </Text>
          <Text variant="caption" secondary>
            Trusted escrow payment &amp; logistics partners
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.8}>
          <Text variant="caption" bold color={colors.primary[500]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={PARTNERS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.88}
            style={[
              styles.partnerCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              !isDark && shadows.sm,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
              <Ionicons name={item.iconName} size={22} color={item.iconColor} />
            </View>

            <View style={styles.infoCol}>
              <View style={styles.titleRow}>
                <Text variant="bodyLarge" bold numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={[styles.badgePill, { backgroundColor: isDark ? colors.neutral[700] : '#F1F5F9' }]}>
                  <Text variant="caption" bold color={colors.primary[500]} style={{ fontSize: 9 }}>
                    {item.badge}
                  </Text>
                </View>
              </View>

              <Text variant="caption" secondary numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  partnerCard: {
    width: 210,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'column',
    marginBottom: 2,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    marginTop: 2,
  },
});

