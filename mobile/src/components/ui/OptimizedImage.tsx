import React, { useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageProps, ImageContentFit } from 'expo-image';
import { normalizeMobileImageUrl } from '../../utils/imageUtils';

const DEFAULT_LOCAL_PLACEHOLDER = require('../../../assets/placeholder_product.png');

export interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  source?: ImageProps['source'];
  contentFit?: ImageContentFit;
  style?: ImageProps['style'];
  fallbackSource?: any;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Enterprise-grade Optimized Image Component for Wunabuy Mobile.
 * - Hardware-accelerated native rendering via expo-image (Glide/SDWebImage).
 * - Aggressive disk and memory caching (cachePolicy="memory-disk") for instant 0ms loads.
 * - Zero network stalling: instantly falls back to bundled asset placeholder on network failure.
 * - Automatic URL normalization for dynamic LAN host and relative upload endpoints.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  source,
  contentFit = 'cover',
  style,
  fallbackSource = DEFAULT_LOCAL_PLACEHOLDER,
  priority = 'normal',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  // Determine final image source
  let resolvedSource: any = fallbackSource;

  if (source) {
    resolvedSource = source;
  } else if (uri && typeof uri === 'string' && uri.trim().length > 0 && !hasError) {
    const normalized = normalizeMobileImageUrl(uri);
    resolvedSource = {
      uri: normalized,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    };
  }

  return (
    <Image
      source={hasError ? fallbackSource : resolvedSource}
      placeholder={fallbackSource}
      contentFit={hasError ? 'contain' : contentFit}
      transition={150}
      cachePolicy="memory-disk"
      priority={priority}
      onError={() => setHasError(true)}
      style={style}
      {...rest}
    />
  );
};
