import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PLACEHOLDER = require('../../../assets/placeholder_product.png');

interface ZoomableImageProps {
  uri: string;
  onZoomChange?: (isZoomed: boolean) => void;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ uri, onZoomChange }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Mutable refs to track active scale and pan values during gestures
  const currentScaleRef = useRef(1);
  const currentPanRef = useRef({ x: 0, y: 0 });
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef(1);
  const initialPanRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);

  const calcDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.hypot(x2 - x1, y2 - y1);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches.length >= 2;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Accept gesture if multi-touch pinch OR if single-touch pan while zoomed in
        if (evt.nativeEvent.touches.length >= 2) return true;
        if (currentScaleRef.current > 1.05 && (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3)) {
          return true;
        }
        return false;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          initialDistanceRef.current = calcDistance(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY
          );
          initialScaleRef.current = currentScaleRef.current;
        }
        initialPanRef.current = { ...currentPanRef.current };
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        // ── 2-Finger Pinch-to-Zoom ──
        if (touches.length >= 2 && initialDistanceRef.current) {
          const currentDistance = calcDistance(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY
          );

          if (currentDistance > 0) {
            const factor = currentDistance / initialDistanceRef.current;
            const newScale = Math.min(Math.max(1, initialScaleRef.current * factor), 5);
            currentScaleRef.current = newScale;
            scale.setValue(newScale);
            onZoomChange?.(newScale > 1.05);
          }
        }
        // ── 1-Finger Pan (when already zoomed in) ──
        else if (touches.length === 1 && currentScaleRef.current > 1.05) {
          const maxPanX = (SCREEN_WIDTH * (currentScaleRef.current - 1)) / 2;
          const maxPanY = (SCREEN_HEIGHT * 0.75 * (currentScaleRef.current - 1)) / 2;

          const newX = Math.min(Math.max(-maxPanX, initialPanRef.current.x + gestureState.dx), maxPanX);
          const newY = Math.min(Math.max(-maxPanY, initialPanRef.current.y + gestureState.dy), maxPanY);

          currentPanRef.current = { x: newX, y: newY };
          pan.setValue({ x: newX, y: newY });
        }
      },
      onPanResponderRelease: () => {
        initialDistanceRef.current = null;

        // If scale is near 1, snap cleanly back to 1.0 and (0,0)
        if (currentScaleRef.current <= 1.08) {
          currentScaleRef.current = 1;
          currentPanRef.current = { x: 0, y: 0 };
          onZoomChange?.(false);

          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              bounciness: 4,
            }),
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              bounciness: 4,
            }),
          ]).start();
        } else {
          // Keep zoomed, ensure within boundaries
          const maxPanX = (SCREEN_WIDTH * (currentScaleRef.current - 1)) / 2;
          const maxPanY = (SCREEN_HEIGHT * 0.75 * (currentScaleRef.current - 1)) / 2;

          const clampedX = Math.min(Math.max(-maxPanX, currentPanRef.current.x), maxPanX);
          const clampedY = Math.min(Math.max(-maxPanY, currentPanRef.current.y), maxPanY);

          currentPanRef.current = { x: clampedX, y: clampedY };
          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        initialDistanceRef.current = null;
        if (currentScaleRef.current <= 1.08) {
          currentScaleRef.current = 1;
          currentPanRef.current = { x: 0, y: 0 };
          onZoomChange?.(false);
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  // Double-tap handler to quickly toggle zoom between 1x and 2.5x
  const handleTouchStart = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected!
      if (currentScaleRef.current > 1.2) {
        // Zoom out
        currentScaleRef.current = 1;
        currentPanRef.current = { x: 0, y: 0 };
        onZoomChange?.(false);
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6 }),
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true, bounciness: 6 }),
        ]).start();
      } else {
        // Zoom in to 2.5x
        currentScaleRef.current = 2.5;
        onZoomChange?.(true);
        Animated.spring(scale, {
          toValue: 2.5,
          useNativeDriver: true,
          bounciness: 6,
        }).start();
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouchStart}
      {...panResponder.panHandlers}
    >
      <Animated.Image
        source={{ uri }}
        style={[
          styles.image,
          {
            transform: [
              { scale },
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
        resizeMode="contain"
        defaultSource={PLACEHOLDER}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.78,
  },
});
