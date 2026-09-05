import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from './Text';
import { Button } from './Button';

export interface QuantityInputModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  currentQuantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  title?: string;
  itemName?: string;
  unitLabel?: string;
}

export const QuantityInputModal: React.FC<QuantityInputModalProps> = ({
  visible,
  onClose,
  onConfirm,
  currentQuantity,
  minQuantity = 1,
  maxQuantity = 99999,
  title = 'Enter Quantity',
  itemName,
  unitLabel = 'items',
}) => {
  const { theme, isDark } = useThemeStore();
  const [inputValue, setInputValue] = useState<string>(currentQuantity.toString());
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setInputValue(currentQuantity.toString());
      setErrorText(null);
    }
  }, [visible, currentQuantity]);

  const handleTextChange = (text: string) => {
    // Only allow numbers
    const sanitized = text.replace(/[^0-9]/g, '');
    setInputValue(sanitized);

    if (sanitized.length > 0) {
      const num = parseInt(sanitized, 10);
      if (num < minQuantity) {
        setErrorText(`Minimum required is ${minQuantity}`);
      } else if (num > maxQuantity) {
        setErrorText(`Maximum available is ${maxQuantity}`);
      } else {
        setErrorText(null);
      }
    } else {
      setErrorText(null);
    }
  };

  const handleConfirm = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < minQuantity) {
      onConfirm(minQuantity);
    } else if (num > maxQuantity) {
      onConfirm(maxQuantity);
    } else {
      onConfirm(num);
    }
    onClose();
  };

  const handleApplyPreset = (value: number) => {
    const clamped = Math.min(Math.max(value, minQuantity), maxQuantity);
    setInputValue(clamped.toString());
    setErrorText(null);
  };

  const handleQuickAdd = (delta: number) => {
    const current = parseInt(inputValue, 10) || currentQuantity;
    const nextVal = Math.min(Math.max(current + delta, minQuantity), maxQuantity);
    setInputValue(nextVal.toString());
    setErrorText(null);
  };

  if (!visible) return null;

  const numericVal = parseInt(inputValue, 10) || 0;
  const isValid = numericVal >= minQuantity && numericVal <= maxQuantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF',
                  borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                },
              ]}
            >
              {/* Header with Title and Close Button */}
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  <Text variant="h3" bold style={styles.titleText}>
                    {title}
                  </Text>
                  {itemName ? (
                    <Text variant="caption" secondary numberOfLines={1} style={{ marginTop: 2 }}>
                      {itemName}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' }]}
                >
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Range Badge Info */}
              <View style={styles.rangeInfoRow}>
                <View style={[styles.rangeBadge, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.primary[600]} style={{ marginRight: 4 }} />
                  <Text variant="caption" bold color={colors.primary[700]}>
                    Range: {minQuantity} – {maxQuantity < 99999 ? maxQuantity : '∞'} {unitLabel}
                  </Text>
                </View>
              </View>

              {/* Big Input Stepper Row */}
              <View style={styles.inputStepperRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuickAdd(-1)}
                  disabled={numericVal <= minQuantity}
                  style={[
                    styles.stepperActionBtn,
                    { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' },
                    numericVal <= minQuantity && { opacity: 0.3 },
                  ]}
                >
                  <Ionicons name="remove" size={22} color={theme.text} />
                </TouchableOpacity>

                <TextInput
                  style={[
                    styles.qtyTextInput,
                    {
                      color: theme.text,
                      backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC',
                      borderColor: errorText
                        ? colors.semantic.error[500]
                        : colors.primary[500],
                    },
                  ]}
                  value={inputValue}
                  onChangeText={handleTextChange}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  autoFocus
                  maxLength={6}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuickAdd(1)}
                  disabled={numericVal >= maxQuantity}
                  style={[
                    styles.stepperActionBtn,
                    { backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9' },
                    numericVal >= maxQuantity && { opacity: 0.3 },
                  ]}
                >
                  <Ionicons name="add" size={22} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Error Callout */}
              {errorText ? (
                <Text variant="caption" color={colors.semantic.error[500]} bold style={styles.errorLabel}>
                  {errorText}
                </Text>
              ) : null}

              {/* Alibaba-Style Quick Preset Pills */}
              <Text variant="caption" bold secondary style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
                Quick Quantity Presets:
              </Text>
              <View style={styles.presetsRow}>
                {[1, 5, 10, 20, 50, 100].map((preset) => {
                  const isSelected = numericVal === preset;
                  const isOverflow = preset > maxQuantity || preset < minQuantity;
                  return (
                    <TouchableOpacity
                      key={preset}
                      activeOpacity={0.7}
                      disabled={isOverflow}
                      onPress={() => handleApplyPreset(preset)}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: isSelected
                            ? colors.primary[500]
                            : isDark
                            ? colors.neutral[800]
                            : '#F1F5F9',
                          borderColor: isSelected
                            ? colors.primary[600]
                            : isDark
                            ? colors.neutral[700]
                            : colors.neutral[200],
                        },
                        isOverflow && { opacity: 0.3 },
                      ]}
                    >
                      <Text
                        variant="caption"
                        bold
                        color={isSelected ? '#FFFFFF' : theme.text}
                      >
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[
                    styles.cancelBtn,
                    {
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                >
                  <Text variant="bodyMedium" bold style={{ color: theme.textSecondary }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Confirm Quantity"
                  onPress={handleConfirm}
                  disabled={!isValid || inputValue.trim() === ''}
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  keyboardAvoid: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeInfoRow: {
    marginVertical: spacing.sm,
    flexDirection: 'row',
  },
  rangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  inputStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  stepperActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyTextInput: {
    width: 120,
    height: 52,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  errorLabel: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minWidth: 42,
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    flex: 1.5,
    height: 46,
  },
});

