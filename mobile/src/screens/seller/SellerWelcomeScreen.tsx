import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, Text, Card, Button } from '../../components/ui';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

const WUNABUY_LOGO = require('../../../assets/icon.png');

export const SellerWelcomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useThemeStore();

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
        <Text variant="h1" bold style={styles.headerTitle}>
          Become a Seller
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Animated Welcome Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#1E293B' : colors.role.seller }]}>
          <View style={styles.heroLogoRing}>
            <Image source={WUNABUY_LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>

          <Text variant="h1" bold color={colors.neutral[0]} align="center" style={styles.heroTitle}>
            Welcome to Wunabuy Seller Hub! 🏪
          </Text>

          <Text variant="bodyMedium" color="rgba(255,255,255,0.9)" align="center" style={styles.heroSubtitle}>
            Sell your products to over 50,000+ active buyers across Cameroon with 100% guaranteed escrow payouts.
          </Text>
        </View>

        {/* Value Highlights Cards Grid */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
          WHY SELL ON WUNABUY?
        </Text>

        {/* Card 1: Verified Store */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="storefront" size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Verified Merchant Badge
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Get a verified store badge &amp; dedicated catalog page trusted by local buyers.
            </Text>
          </View>
        </Card>

        {/* Card 2: Escrow Payouts */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="wallet" size={24} color={colors.accent[500]} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Guaranteed Escrow Payouts
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Receive payouts directly into MTN MoMo, Orange Money, or Bank upon delivery.
            </Text>
          </View>
        </Card>

        {/* Card 3: Express GPS Delivery */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="car" size={24} color={colors.role.seller} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Express Delivery Fleet
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Automated motorcycle rider pickup &amp; live GPS tracking to your customer's doorstep.
            </Text>
          </View>
        </Card>

        {/* Card 4: Mobile Inventory */}
        <Card style={styles.valueCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="bar-chart" size={24} color={theme.text} />
          </View>
          <View style={styles.valueTextCol}>
            <Text variant="bodyLarge" bold style={{ marginBottom: 2 }}>
              Mobile Inventory &amp; Sales
            </Text>
            <Text variant="caption" secondary numberOfLines={2}>
              Manage products, stock alerts &amp; daily revenues easily right from your smartphone.
            </Text>
          </View>
        </Card>

        {/* Primary Get Started Button */}
        <View style={styles.actionSection}>
          <Button
            title="Get Started →"
            variant="primary"
            onPress={() => navigation.navigate('StoreKYC')}
            style={styles.getStartedBtn}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
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
  headerTitle: {
    fontSize: 22,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  heroCard: {
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
    ...shadows.md,
  },
  heroLogoRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 28,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs + 2,
  },
  valueCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  valueTextCol: {
    flex: 1,
  },
  actionSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  getStartedBtn: {
    height: 52,
    backgroundColor: colors.role.seller,
  },
});
