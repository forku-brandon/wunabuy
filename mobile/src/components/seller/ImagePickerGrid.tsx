import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export interface ImagePickerGridProps {
  images: string[];
  maxImages?: number;
  onAddImage: (uri: string) => void;
  onRemoveImage: (index: number) => void;
  style?: ViewStyle;
}

// Sample stock marketplace images for simulated photo picking in dev
const SAMPLE_PICKER_PHOTOS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
];

export const ImagePickerGrid: React.FC<ImagePickerGridProps> = ({
  images,
  maxImages = 5,
  onAddImage,
  onRemoveImage,
  style,
}) => {
  const { theme } = useThemeStore();

  const handlePickPhoto = () => {
    if (images.length >= maxImages) return;
    const nextSample = SAMPLE_PICKER_PHOTOS[images.length % SAMPLE_PICKER_PHOTOS.length];
    onAddImage(nextSample);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageBox}>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onRemoveImage(index)}
              style={styles.removeBtn}
            >
              <Text variant="caption" bold color={colors.neutral[0]}>
                ✕
              </Text>
            </TouchableOpacity>
            {index === 0 && (
              <View style={styles.primaryBadge}>
                <Text variant="caption" bold color={colors.neutral[0]} style={{ fontSize: 9 }}>
                  MAIN PHOTO
                </Text>
              </View>
            )}
          </View>
        ))}

        {images.length < maxImages && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickPhoto}
            style={[
              styles.addBox,
              { backgroundColor: theme.input, borderColor: theme.inputBorder },
            ]}
          >
            <Text variant="h1" color={colors.primary[500]}>
              📷
            </Text>
            <Text variant="caption" secondary style={styles.addText}>
              Add Photo ({images.length}/{maxImages})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageBox: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    paddingVertical: 1,
  },
  addBox: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 10,
    marginTop: 2,
  },
});
