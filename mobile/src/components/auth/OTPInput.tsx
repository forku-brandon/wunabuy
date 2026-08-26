import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { colors, borderRadius, spacing } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChangeOTP: (otp: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChangeOTP,
  disabled = false,
}) => {
  const { theme } = useThemeStore();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));

  useEffect(() => {
    // Sync internal digits with value prop
    const newDigits = Array(length).fill('');
    for (let i = 0; i < Math.min(value.length, length); i++) {
      newDigits[i] = value[i];
    }
    setDigits(newDigits);
  }, [value, length]);

  const handleChangeText = (text: string, index: number) => {
    // Handle paste of full 6-digit OTP
    if (text.length > 1) {
      const cleanDigits = text.replace(/[^0-9]/g, '').slice(0, length);
      onChangeOTP(cleanDigits);
      if (cleanDigits.length === length) {
        inputRefs.current[length - 1]?.blur();
      }
      return;
    }

    const digit = text.replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    onChangeOTP(newDigits.join(''));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.box,
              {
                backgroundColor: theme.input,
                borderColor: isFilled ? colors.primary[500] : theme.inputBorder,
                color: theme.text,
              },
            ]}
            keyboardType="number-pad"
            maxLength={length} // Allow paste of full code
            value={digits[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={!disabled}
            selectTextOnFocus
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  box: {
    width: 46,
    height: 56,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
  },
});

