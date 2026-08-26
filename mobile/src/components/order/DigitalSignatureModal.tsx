import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet, Text, Button } from '../ui';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface DigitalSignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmSignature: (signatureData: string) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  visible,
  onClose,
  onConfirmSignature,
}) => {
  const { theme } = useThemeStore();
  const [signed, setSigned] = useState(false);

  const handleSign = () => {
    setSigned(true);
  };

  const handleClear = () => {
    setSigned(false);
  };

  const handleConfirm = () => {
    if (!signed) return;
    onConfirmSignature('data:image/svg+xml;base64,mock_buyer_digital_signature_blob');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Buyer Digital Signature">
      <Text variant="bodyMedium" secondary style={styles.subtitle}>
        Please sign in the box below to confirm receipt of your delivery in good condition. This will authorize instant escrow release to the seller.
      </Text>

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
              ✍️ Jean Dupont
            </Text>
            <Text variant="caption" secondary style={{ marginTop: 4 }}>
              Digital Signature Captured • {new Date().toLocaleTimeString()}
            </Text>
          </View>
        ) : (
          <View style={styles.placeholderView}>
            <Text variant="h1">✍️</Text>
            <Text variant="bodyMedium" secondary style={{ marginTop: 4 }}>
              Tap or draw here to sign
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.btnRow}>
        <Button
          title="Clear Signature"
          variant="ghost"
          fullWidth={false}
          onPress={handleClear}
          style={{ minWidth: 100 }}
        />
        <Button
          title="Confirm & Release Escrow"
          variant="primary"
          disabled={!signed}
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
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  canvasBox: {
    height: 160,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  signedView: {
    alignItems: 'center',
  },
  signatureScript: {
    fontStyle: 'italic',
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
