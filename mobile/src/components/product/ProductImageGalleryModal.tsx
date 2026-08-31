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
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/Text';
import { colors, spacing, borderRadius, shadows } from '@wunabuy/design-tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PLACEHOLDER = require('../../../assets/placeholder_product.png');

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
  // false = standard fit-to-screen ('contain' with <> expand action)
  // true = expanded fill screen ('cover' with >< reduce size action)
  const [isExpandedFill, setIsExpandedFill] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const validImages = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85'];

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setIsExpandedFill(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
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
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const toggleSizeFill = () => {
    setIsExpandedFill((prev) => !prev);
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
        {/* Dark Dim Backdrop */}
        <View style={styles.backdrop} />

        {/* ─── TOP ACTION BAR ─────────────────────────────────────── */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
          {/* Left: Image Counter Badge & Product Name */}
          <View style={styles.leftInfoStack}>
            <View style={styles.counterPill}>
              <Text variant="caption" bold color="#FFFFFF" style={{ fontSize: 12 }}>
                {activeIndex + 1} / {validImages.length}
              </Text>
            </View>
            {productName && (
              <Text variant="caption" bold color="rgba(255,255,255,0.85)" numberOfLines={1} style={styles.productTitle}>
                {productName}
              </Text>
            )}
          </View>

          {/* Right Controls: (<>) Expand / (><) Reduce Size & (X) Close Button */}
          <View style={styles.rightActionsRow}>
            {/* Expand (<>) / Reduce Size (><) Toggle Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleSizeFill}
              style={[
                styles.actionBtnCircle,
                isExpandedFill && { backgroundColor: colors.primary[600] },
              ]}
            >
              <View style={styles.zoomButtonContent}>
                <Ionicons
                  name={isExpandedFill ? 'contract-outline' : 'expand-outline'}
                  size={16}
                  color="#FFFFFF"
                />
                <Text variant="caption" bold color="#FFFFFF" style={styles.zoomTextBadge}>
                  {isExpandedFill ? '><' : '<>'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* (X) Close Fullscreen Gallery Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={[styles.actionBtnCircle, styles.closeBtnCircle]}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── FULLSCREEN HORIZONTAL SWIPEABLE GALLERY STAGE ──────── */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          style={styles.galleryScrollView}
          contentContainerStyle={styles.galleryContentContainer}
        >
          {validImages.map((imageUrl, idx) => (
            <TouchableWithoutFeedback key={`gallery_img_${idx}`} onPress={toggleSizeFill}>
              <View style={styles.imageSlideContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={[
                    styles.fullscreenImage,
                    {
                      resizeMode: isExpandedFill ? 'cover' : 'contain',
                      height: isExpandedFill ? SCREEN_HEIGHT : SCREEN_HEIGHT * 0.72,
                    },
                  ]}
                  defaultSource={PLACEHOLDER}
                />
              </View>
            </TouchableWithoutFeedback>
          ))}
        </ScrollView>

        {/* ─── BOTTOM CONTROLS & THUMBNAIL SELECTOR STRIP ─────────── */}
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

          {/* Quick Double-Tap Hint */}
          <Text variant="caption" color="rgba(255,255,255,0.6)" align="center" style={styles.hintText}>
            Swipe left/right to browse • Tap <Text variant="caption" bold color="#FFFFFF">{isExpandedFill ? '>< Reduce' : '<> Expand'}</Text> to zoom
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070E',
    justifyContent: 'space-between',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
  productTitle: {
    fontSize: 12,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtnCircle: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  closeBtnCircle: {
    width: 42,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  zoomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  zoomTextBadge: {
    fontSize: 11,
    letterSpacing: -0.5,
  },
  galleryScrollView: {
    flex: 1,
  },
  galleryContentContainer: {
    alignItems: 'center',
  },
  imageSlideContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
  },
  bottomBar: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
    width: 22,
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
  hintText: {
    fontSize: 10,
    marginTop: 6,
  },
});
