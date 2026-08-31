import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/Text';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { ZoomableImage } from './ZoomableImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ProductImageGalleryModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  productName?: string;
  onClose: () => void;
}

export const ProductImageGalleryModal: React.FC<ProductImageGalleryModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  productName,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const outerScrollViewRef = useRef<ScrollView>(null);

  const validImages =
    images && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85'];

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setIsZoomed(false);
      setTimeout(() => {
        outerScrollViewRef.current?.scrollTo({
          x: initialIndex * SCREEN_WIDTH,
          animated: false,
        });
      }, 50);
    }
  }, [visible, initialIndex]);

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / SCREEN_WIDTH);
    if (currentIndex >= 0 && currentIndex < validImages.length && currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  };

  const handleSelectThumbnail = (index: number) => {
    setActiveIndex(index);
    outerScrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" translucent />

      <View style={styles.container}>
        {/* Dark OLED Backdrop */}
        <View style={styles.backdrop} />

        {/* ─── TOP ACTION BAR ─────────────────────────────────────── */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
          {/* Left: Image Counter Badge & Optional Product Name */}
          <View style={styles.leftInfoStack}>
            <View style={styles.counterPill}>
              <Text variant="caption" bold color="#FFFFFF" style={styles.counterText}>
                {activeIndex + 1} / {validImages.length}
              </Text>
            </View>
            {productName && (
              <Text variant="caption" bold color="rgba(255,255,255,0.85)" numberOfLines={1} style={styles.productTitle}>
                {productName}
              </Text>
            )}
          </View>

          {/* Right: Clean (X) Close Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeBtnCircle}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ─── HORIZONTAL SWIPEABLE STAGE WITH ZOOMABLE IMAGES ────── */}
        <ScrollView
          ref={outerScrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={!isZoomed}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          style={styles.outerScrollView}
        >
          {validImages.map((imageUrl, idx) => (
            <ZoomableImage
              key={`zoom_img_${idx}`}
              uri={imageUrl}
              onZoomChange={setIsZoomed}
            />
          ))}
        </ScrollView>

        {/* ─── BOTTOM THUMBNAILS & PAGINATION ─────────────────────── */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + spacing.xs, spacing.md) }]}>
          {/* Pagination Dots */}
          {validImages.length > 1 && (
            <View style={styles.paginationDotsRow}>
              {validImages.map((_, idx) => (
                <View
                  key={`dot_${idx}`}
                  style={[
                    styles.dot,
                    idx === activeIndex
                      ? [styles.activeDot, { backgroundColor: colors.primary[500] }]
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Thumbnail Selector Strip */}
          {validImages.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailStrip}
            >
              {validImages.map((thumbUrl, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <TouchableOpacity
                    key={`thumb_${idx}`}
                    activeOpacity={0.8}
                    onPress={() => handleSelectThumbnail(idx)}
                    style={[
                      styles.thumbnailWrapper,
                      isActive && {
                        borderColor: colors.primary[500],
                        borderWidth: 2,
                        transform: [{ scale: 1.08 }],
                      },
                    ]}
                  >
                    <Image source={{ uri: thumbUrl }} style={styles.thumbnailImage} resizeMode="cover" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    zIndex: 100,
  },
  leftInfoStack: {
    flex: 1,
    marginRight: spacing.md,
  },
  counterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  counterText: {
    fontSize: 12,
  },
  productTitle: {
    fontSize: 12,
  },
  closeBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  outerScrollView: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'center',
  },
  thumbnailWrapper: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
