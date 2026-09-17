import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet, Text, Button } from '../ui';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { AuthService } from '../../services/api/authService';

export interface DigitalSignaturePayload {
  /** Base64 encoded signature blob */
  signature_data: string;
  /** Full name of the signing buyer, pulled from their live profile */
  buyer_name: string;
  /** UUID of the authenticated buyer */
  buyer_id: string;
  /** ISO-8601 timestamp of when the signature was applied */
  signed_at: string;
}

export interface DigitalSignatureModalProps {
  visible: boolean;
  onClose: () => void;
  /** Called with a rich payload object instead of a raw mock string */
  onConfirmSignature: (payload: DigitalSignaturePayload) => void;
  /** Show a loading spinner on the Confirm button while the parent submits to the API */
  submitting?: boolean;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  visible,
  onClose,
  onConfirmSignature,
  submitting = false,
}) => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<Date | null>(null);
  const [buyerName, setBuyerName] = useState<string>('');

  // On mount / when modal opens, refresh the user profile so the name is always live
  useEffect(() => {
    if (!visible) return;
    setSigned(false);
    setSignedAt(null);

    // Start with local cached name immediately (no flicker)
    const localName = user?.full_name || '';
    setBuyerName(localName);

    // Then silently refresh from server in background
    AuthService.getCurrentUser()
      .then((freshUser) => {
        if (freshUser?.full_name) {
          setBuyerName(freshUser.full_name);
        }
      })
      .catch(() => {
        // Keep the locally cached name if offline
      });
  }, [visible]);

  const handleSign = () => {
    setSigned(true);
    setSignedAt(new Date());
  };

  const handleClear = () => {
    setSigned(false);
    setSignedAt(null);
  };

  const handleConfirm = () => {
    if (!signed || submitting) return;

    const now = signedAt || new Date();

    // Build a deterministic but non-trivial signature token:
    // base64( userId:buyerName:isoTimestamp )
    const rawToken = `${user?.id ?? 'anonymous'}:${buyerName}:${now.toISOString()}`;
    const signatureData = `data:application/vnd.wunabuy.signature;base64,${btoa(unescape(encodeURIComponent(rawToken)))}`;

    onConfirmSignature({
      signature_data: signatureData,
      buyer_name: buyerName,
      buyer_id: user?.id ?? '',
      signed_at: now.toISOString(),
    });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Buyer Digital Signature">
      <Text variant="bodyMedium" secondary style={styles.subtitle}>
        Please sign in the box below to confirm receipt of your delivery in good condition.
        This will authorize instant escrow release to the seller.
      </Text>

      {/* Live buyer name chip */}
      {buyerName ? (
        <View style={[styles.buyerChip, { backgroundColor: theme.inputBorder }]}>
          <Text variant="caption" secondary>Signing as </Text>
          <Text variant="caption" bold color={colors.primary[600]}>
            {buyerName}
          </Text>
        </View>
      ) : null}

      {/* Signature Canvas Box */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleSign}
        style={[
          styles.canvasBox,
          {
            backgroundColor: theme.input,
            borderColor: signed ? colors.primary[500] : theme.inputBorder,
          },
        ]}
      >
        {signed ? (
          <View style={styles.signedView}>
            <Text variant="display" color={colors.primary[600]} style={styles.signatureScript}>
              ✍️ {buyerName || 'Buyer'}
            </Text>
            <Text variant="caption" secondary style={styles.signedMeta}>
              Digital Signature Captured •{' '}
              {signedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
            {user?.id ? (
              <Text variant="caption" secondary style={{ marginTop: 2, fontSize: 10 }}>
                User ID: {user.id.slice(0, 8)}…
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.placeholderView}>
            <Text variant="h1">✍️</Text>
            <Text variant="bodyMedium" secondary style={{ marginTop: 4 }}>
              Tap or draw here to sign
            </Text>
            {buyerName ? (
              <Text variant="caption" secondary style={{ marginTop: 2 }}>
                Will sign as: {buyerName}
              </Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.btnRow}>
        <Button
          title="Clear"
          variant="ghost"
          fullWidth={false}
          onPress={handleClear}
          disabled={submitting}
          style={{ minWidth: 90 }}
        />
        <Button
          title={submitting ? 'Releasing Escrow…' : 'Confirm & Release Escrow'}
          variant="primary"
          disabled={!signed || submitting}
          fullWidth={false}
          onPress={handleConfirm}
          style={{ flex: 1 }}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  buyerChip: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  canvasBox: {
    height: 170,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  signedView: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  signatureScript: {
    fontStyle: 'italic',
  },
  signedMeta: {
    marginTop: 4,
  },
  placeholderView: {
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});
