import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors, borderRadius } from '@wunabuy/design-tokens';
import { getInitials } from '@wunabuy/utils';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from './Text';

export interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  name = 'User',
  size = 40,
}) => {
  const { theme } = useThemeStore();
  const initials = getInitials(name);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[containerStyle, styles.image]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        containerStyle,
        { backgroundColor: colors.primary[100] },
      ]}
    >
      <Text
        variant={size < 36 ? 'caption' : 'bodyMedium'}
        bold
        color={colors.primary[700]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.neutral[200],
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
