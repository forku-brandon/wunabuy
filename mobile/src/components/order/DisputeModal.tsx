import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheet, Text, Button, Input } from '../ui';
import { DisputeReason } from '@wunabuy/types';
import { ImagePickerGrid } from '../seller/ImagePickerGrid';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface DisputeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitDispute: (reason: DisputeReason, description: string, evidencePhotos: string[]) => void;
}

const REASON_LABELS: Record<DisputeReason, string> = {
  [DisputeReason.WRONG_ITEM]: 'Wrong Item Received',
  [DisputeReason.DAMAGED]: 'Item Damaged / Broken',
  [DisputeReason.NOT_AS_DESCRIBED]: 'Item Not As Described',
  [DisputeReason.NON_DELIVERY]: 'Non-Delivery / Missing Package',
};

export const DisputeModal: React.FC<DisputeModalProps> = ({
  visible,
  onClose,
  onSubmitDispute,
}) => {
  const { theme } = useThemeStore();
  const [reason, setReason] = useState<DisputeReason>(DisputeReason.WRONG_ITEM);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }

    onSubmitDispute(reason, description.trim(), photos);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Open Escrow Dispute">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text variant="bodyMedium" secondary style={styles.subtitle}>
          Opening a dispute freezes escrow funds until Wunabuy support staff resolves the issue.
        </Text>

        {/* Dispute Reason Selector */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          SELECT DISPUTE REASON *
        </Text>
        <View style={styles.reasonsList}>
          {Object.values(DisputeReason).map((r) => {
            const isSelected = reason === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setReason(r)}
                style={[
                  styles.reasonItem,
                  { borderColor: isSelected ? colors.semantic.error[500] : theme.border },
                  isSelected && { backgroundColor: colors.semantic.error[50] },
                ]}
              >
                <Text variant="bodyMedium" bold={isSelected} color={isSelected ? colors.semantic.error[700] : theme.text}>
                  {REASON_LABELS[r]}
                </Text>
                <View
                  style={[
                    styles.radio,
                    { borderColor: isSelected ? colors.semantic.error[500] : theme.border },
                    isSelected && { backgroundColor: colors.semantic.error[500] },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <Input
          label="Detailed Explanation *"
          placeholder="Explain clearly what went wrong with your delivery or item..."
          value={description}
          onChangeText={(text) => {
            setError('');
            setDescription(text);
          }}
          multiline
          numberOfLines={4}
          error={error}
        />

        {/* Evidence Photos */}
        <Text variant="caption" bold color={theme.textSecondary} style={styles.label}>
          ATTACH EVIDENCE PHOTOS (OPTIONAL)
        </Text>
        <ImagePickerGrid
          images={photos}
          maxImages={3}
          onAddImage={(uri) => setPhotos([...photos, uri])}
          onRemoveImage={(index) => {
            const newImgs = [...photos];
            newImgs.splice(index, 1);
            setPhotos(newImgs);
          }}
        />

        <Button
          title="Submit Dispute & Freeze Escrow"
          variant="danger"
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  subtitle: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  label: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  reasonsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});
