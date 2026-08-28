import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, shadows } from '@wunabuy/design-tokens';
import { getInitials } from '@wunabuy/utils';
import { useThemeStore } from '../../stores/theme.store';
import { Text } from './Text';

export const DEFAULT_AVATAR_URI =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

export interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: number;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  name = 'User',
  size = 40,
  showBorder = false,
}) => {
  const { theme, isDark } = useThemeStore();
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const imageSourceUri = url && url.trim().length > 0 ? url : DEFAULT_AVATAR_URI;

  if (!imageError) {
    return (
      <View
        style={[
          containerStyle,
          styles.imageContainer,
          showBorder && {
            borderWidth: 2,
            borderColor: colors.primary[500],
          },
        ]}
      >
        <Image
          source={{ uri: imageSourceUri }}
          style={[containerStyle, styles.image]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  // Fallback vector person icon with initials
  return (
    <View
      style={[
        styles.fallback,
        containerStyle,
        {
          backgroundColor: isDark ? colors.neutral[800] : colors.primary[100],
          borderWidth: showBorder ? 2 : 1,
          borderColor: isDark ? colors.neutral[700] : colors.primary[200],
        },
      ]}
    >
      <Ionicons
        name="person"
        size={size * 0.52}
        color={isDark ? colors.neutral[300] : colors.primary[700]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});
