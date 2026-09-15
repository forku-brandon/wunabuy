import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';
import { API_BASE_URL } from '../../config/env';

export const DEFAULT_3D_AVATAR: ImageSourcePropType = require('../../../assets/avatar.png');

export interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: number;
  showBorder?: boolean;
}

import { normalizeMobileImageUrl } from '../../utils/imageUtils';
export { normalizeMobileImageUrl };

export const Avatar: React.FC<AvatarProps> = ({
  url,
  size = 40,
  showBorder = false,
}) => {
  const { isDark } = useThemeStore();
  const [imageError, setImageError] = useState(false);

  // Reset error state whenever the url prop changes
  useEffect(() => {
    setImageError(false);
  }, [url]);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const normalizedUrl = normalizeMobileImageUrl(url);
  const imageSource: ImageSourcePropType =
    !imageError && normalizedUrl ? { uri: normalizedUrl } : DEFAULT_3D_AVATAR;

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
