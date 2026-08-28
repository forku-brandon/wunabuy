import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export const DEFAULT_3D_AVATAR: ImageSourcePropType = require('../../../assets/avatar.png');

export interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: number;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  size = 40,
  showBorder = false,
}) => {
  const { isDark } = useThemeStore();
  const [imageError, setImageError] = useState(false);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const imageSource: ImageSourcePropType =
    url && url.trim().length > 0 ? { uri: url } : DEFAULT_3D_AVATAR;

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
          source={imageSource}
          style={[containerStyle, styles.image]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  // Fallback vector person icon if custom remote URL fails
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
    backgroundColor: '#E2E8F0',
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
