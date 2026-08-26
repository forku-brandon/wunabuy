import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Badge } from '../ui';
import { KYCStatus } from '@wunabuy/types';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';

export interface KYCStatusBannerProps {
  status: KYCStatus;
  rejectionReason?: string | null;
  onStartKYC: () => void;
}

export const KYCStatusBanner: React.FC<KYCStatusBannerProps> = ({
  status,
  rejectionReason,
  onStartKYC,
}) => {
  if (status === KYCStatus.APPROVED) {
    return (
      <Card style={styles.approvedCard}>
        <View style={styles.row}>
          <Text variant="h2">✅</Text>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text variant="bodyLarge" bold color={colors.semantic.success[700]}>
                Verified Merchant Store
              </Text>
              <Badge label="KYC APPROVED" variant="success" size="small" />
            </View>
            <Text variant="caption" color={colors.semantic.success[700]}>
              Your store is active. All product listings & escrow sales are enabled.
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  if (status === KYCStatus.PENDING || status === KYCStatus.UNDER_REVIEW) {
    return (
      <Card style={styles.pendingCard}>
        <View style={styles.row}>
          <Text variant="h2">⏳</Text>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text variant="bodyLarge" bold color={colors.semantic.warning[700]}>
                KYC Verification Under Review
              </Text>
              <Badge label="IN REVIEW" variant="warning" size="small" />
            </View>
            <Text variant="caption" color={colors.semantic.warning[700]}>
              Staff is verifying your ID card and storefront photos. Review takes up to 24h.
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  if (status === KYCStatus.REJECTED) {
    return (
      <Card style={styles.rejectedCard}>
        <View style={styles.row}>
          <Text variant="h2">⚠️</Text>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text variant="bodyLarge" bold color={colors.semantic.error[700]}>
                KYC Verification Rejected
              </Text>
              <Badge label="REJECTED" variant="error" size="small" />
            </View>
            <Text variant="caption" color={colors.semantic.error[700]} style={{ marginBottom: spacing.xs }}>
              {rejectionReason || 'Uploaded ID card or storefront photo was blurry. Please resubmit clear photos.'}
            </Text>
            <Button
              title="Resubmit Verification"
              variant="danger"
              size="small"
              fullWidth={false}
              onPress={onStartKYC}
            />
          </View>
        </View>
      </Card>
    );
  }

  // Default: NOT_SUBMITTED
  return (
    <Card style={styles.promptCard}>
      <View style={styles.row}>
        <Text variant="h2">🏬</Text>
        <View style={styles.textContainer}>
          <Text variant="bodyLarge" bold color={colors.primary[700]}>
            Verify Store to Start Selling
          </Text>
          <Text variant="caption" color={colors.primary[700]} style={{ marginBottom: spacing.sm }}>
            Submit government ID and storefront photos to unlock escrow product sales.
          </Text>
          <Button
            title="Complete Store KYC"
            variant="primary"
            size="small"
            fullWidth={false}
            onPress={onStartKYC}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  approvedCard: {
    backgroundColor: colors.semantic.success[50],
    borderColor: colors.semantic.success[500],
    marginBottom: spacing.lg,
  },
  pendingCard: {
    backgroundColor: colors.semantic.warning[50],
    borderColor: colors.semantic.warning[500],
    marginBottom: spacing.lg,
  },
  rejectedCard: {
    backgroundColor: colors.semantic.error[50],
    borderColor: colors.semantic.error[500],
    marginBottom: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
});
