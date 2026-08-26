/**
 * Motion and animation tokens
 */

/**
 * Animation durations in milliseconds
 */
export const durations = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * Easing curves as cubic bezier arrays [x1, y1, x2, y2]
 */
export const easings = {
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
} as const;

/**
 * React Native Reanimated-compatible easing string references
 * Useful if you use strings or import from reanimated in components.
 */
export const reanimatedEasings = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'spring', // May map to Reanimated's withSpring
} as const;
