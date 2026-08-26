import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheet, Text } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../stores/theme.store';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';

export interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili', flag: '🇰🇪' },
];

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { i18n } = useTranslation();
  const { theme } = useThemeStore();

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Select Language">
      <View style={styles.list}>
        {LANGUAGES.map((lang) => {
          const isSelected = i18n.language === lang.code;

          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.7}
              onPress={() => handleSelectLanguage(lang.code)}
              style={[
                styles.item,
                { borderColor: isSelected ? colors.primary[500] : theme.border },
                isSelected && { backgroundColor: colors.primary[50] },
              ]}
            >
              <Text variant="h2" style={styles.flag}>
                {lang.flag}
              </Text>

              <View style={styles.textContainer}>
                <Text variant="bodyLarge" bold color={isSelected ? colors.primary[700] : theme.text}>
                  {lang.label}
                </Text>
                <Text variant="caption" secondary>
                  {lang.native}
                </Text>
              </View>

              {isSelected && (
                <Text variant="bodyLarge" color={colors.primary[500]}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  flag: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
});
