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

/**
 * Normalizes an avatar/image URL for mobile devices.
 * Replaces localhost:8000/127.0.0.1:8000 or relative paths with the reachable API base server.
 */
export function normalizeMobileImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string' || url.trim().length === 0) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('file://') || trimmed.startsWith('content://')) return trimmed;

  const serverBase = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, '');

  // If it's a relative path starting with /uploads or uploads/
  if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    return `${serverBase}${cleanPath}`;
  }
  if (trimmed.startsWith('/storage') || trimmed.startsWith('storage/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    return `${serverBase}${cleanPath}`;
  }

  // If pointing to localhost:8000 or 127.0.0.1:8000, substitute with serverBase host
  if (trimmed.includes('localhost:8000') || trimmed.includes('127.0.0.1:8000')) {
    return trimmed
      .replace('http://localhost:8000', serverBase)
      .replace('http://127.0.0.1:8000', serverBase);
  }

  return trimmed;
}

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
