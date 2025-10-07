// Mock for react-native-reanimated on web platform
// This prevents native UIManager calls that cause crashes on web

import React from 'react';
import { View, Text } from 'react-native';

// Mock UI property registration functions - declared first to avoid hoisting issues
function addWhitelistedUIProps(props) {
  // No-op for web compatibility
}

function addWhitelistedNativeProps(props) {
  // No-op for web compatibility
}

// Mock Animated components
const createAnimatedComponent = (Component) => {
  return React.forwardRef((props, ref) => {
    return React.createElement(Component, { ...props, ref });
  });
};

const Animated = {
  View: createAnimatedComponent(View),
  Text: createAnimatedComponent(Text),
  ScrollView: createAnimatedComponent(require('react-native').ScrollView),
  FlatList: createAnimatedComponent(require('react-native').FlatList),
  Image: createAnimatedComponent(require('react-native').Image),
  createAnimatedComponent,
  addWhitelistedUIProps,
  addWhitelistedNativeProps,
};

// Mock hooks
const useSharedValue = (initialValue) => {
  const ref = React.useRef({ value: initialValue });
  return ref.current;
};

const useAnimatedStyle = (styleFunction) => {
  return React.useMemo(() => {
    try {
      return styleFunction() || {};
    } catch (error) {
      return {};
    }
  }, [styleFunction]);
};

const useAnimatedGestureHandler = (handlers) => {
  return React.useCallback(() => {}, [handlers]);
};

const useAnimatedScrollHandler = (handler) => {
  return React.useCallback(() => {}, [handler]);
};

const useAnimatedRef = () => {
  return React.useRef(null);
};

const useDerivedValue = (valueFunction) => {
  return useSharedValue(0);
};

const useAnimatedReaction = (prepare, react) => {
  React.useEffect(() => {
    try {
      const value = prepare();
      react(value);
    } catch (error) {
      // Ignore errors in web mock
    }
  }, [prepare, react]);
};

// Mock animation functions
const withTiming = (toValue, config, callback) => {
  if (callback) {
    setTimeout(callback, 0);
  }
  return toValue;
};

const withSpring = (toValue, config, callback) => {
  if (callback) {
    setTimeout(callback, 0);
  }
  return toValue;
};

const withDelay = (delay, animation) => {
  return animation;
};

const withRepeat = (animation, numberOfReps, reverse) => {
  return animation;
};

const withSequence = (...animations) => {
  return animations[animations.length - 1] || 0;
};

const cancelAnimation = (sharedValue) => {
  // No-op for web
};

const runOnJS = (fn) => {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      console.warn('runOnJS error:', error);
    }
  };
};

const runOnUI = (fn) => {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      console.warn('runOnUI error:', error);
    }
  };
};

// Mock interpolation functions
const interpolate = (value, inputRange, outputRange, extrapolate) => {
  if (typeof value !== 'number') return outputRange[0] || 0;
  
  // Simple linear interpolation for web
  const input = Math.max(inputRange[0], Math.min(inputRange[inputRange.length - 1], value));
  const inputIndex = inputRange.findIndex((range, index) => {
    return index === inputRange.length - 1 || (input >= range && input <= inputRange[index + 1]);
  });
  
  if (inputIndex === -1) return outputRange[0] || 0;
  if (inputIndex === inputRange.length - 1) return outputRange[inputIndex] || 0;
  
  const inputStart = inputRange[inputIndex];
  const inputEnd = inputRange[inputIndex + 1];
  const outputStart = outputRange[inputIndex] || 0;
  const outputEnd = outputRange[inputIndex + 1] || 0;
  
  const progress = (input - inputStart) / (inputEnd - inputStart);
  return outputStart + progress * (outputEnd - outputStart);
};

const interpolateColor = (value, inputRange, outputRange) => {
  return outputRange[0] || '#000000';
};

const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

// Mock gesture handler
const Gesture = {
  Pan: () => ({
    onStart: () => ({}),
    onUpdate: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    shouldCancelWhenOutside: () => ({}),
    activeOffsetX: () => ({}),
    activeOffsetY: () => ({}),
    failOffsetX: () => ({}),
    failOffsetY: () => ({}),
    minDistance: () => ({}),
    minPointers: () => ({}),
    maxPointers: () => ({}),
    avgTouches: () => ({}),
    runOnJS: () => ({}),
  }),
  Tap: () => ({
    onStart: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    numberOfTaps: () => ({}),
    maxDuration: () => ({}),
    maxDistance: () => ({}),
    maxDelayBetweenTaps: () => ({}),
    runOnJS: () => ({}),
  }),
  LongPress: () => ({
    onStart: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    minDuration: () => ({}),
    maxDistance: () => ({}),
    runOnJS: () => ({}),
  }),
  Pinch: () => ({
    onStart: () => ({}),
    onUpdate: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    runOnJS: () => ({}),
  }),
  Rotation: () => ({
    onStart: () => ({}),
    onUpdate: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    runOnJS: () => ({}),
  }),
  Fling: () => ({
    onStart: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    direction: () => ({}),
    numberOfPointers: () => ({}),
    runOnJS: () => ({}),
  }),
  Native: () => ({
    onStart: () => ({}),
    onUpdate: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    runOnJS: () => ({}),
  }),
  Manual: () => ({
    onStart: () => ({}),
    onUpdate: () => ({}),
    onEnd: () => ({}),
    enabled: () => ({}),
    runOnJS: () => ({}),
  }),
  Race: (...gestures) => ({}),
  Simultaneous: (...gestures) => ({}),
  Exclusive: (...gestures) => ({}),
};

// Mock layout animation
const Layout = {
  duration: () => ({}),
  delay: () => ({}),
  easing: () => ({}),
  damping: () => ({}),
  mass: () => ({}),
  stiffness: () => ({}),
  overshootClamping: () => ({}),
  restDisplacementThreshold: () => ({}),
  restSpeedThreshold: () => ({}),
  springify: () => ({}),
};

const FadeIn = Layout;
const FadeOut = Layout;
const SlideInLeft = Layout;
const SlideInRight = Layout;
const SlideInUp = Layout;
const SlideInDown = Layout;
const SlideOutLeft = Layout;
const SlideOutRight = Layout;
const SlideOutUp = Layout;
const SlideOutDown = Layout;
const ZoomIn = Layout;
const ZoomOut = Layout;
const BounceIn = Layout;
const BounceOut = Layout;
const FlipInXUp = Layout;
const FlipInXDown = Layout;
const FlipInYLeft = Layout;
const FlipInYRight = Layout;
const FlipOutXUp = Layout;
const FlipOutXDown = Layout;
const FlipOutYLeft = Layout;
const FlipOutYRight = Layout;
const StretchInX = Layout;
const StretchInY = Layout;
const StretchOutX = Layout;
const StretchOutY = Layout;
const FadeInLeft = Layout;
const FadeInRight = Layout;
const FadeInUp = Layout;
const FadeInDown = Layout;
const FadeOutLeft = Layout;
const FadeOutRight = Layout;
const FadeOutUp = Layout;
const FadeOutDown = Layout;

// Mock easing functions
const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  poly: (n) => (t) => Math.pow(t, n),
  sin: (t) => 1 - Math.cos((t * Math.PI) / 2),
  circle: (t) => 1 - Math.sqrt(1 - t * t),
  exp: (t) => Math.pow(2, 10 * (t - 1)),
  elastic: (bounciness = 1) => (t) => t,
  back: (s = 1.70158) => (t) => t,
  bounce: (t) => t,
  bezier: (x1, y1, x2, y2) => (t) => t,
  in: (easing) => easing,
  out: (easing) => (t) => 1 - easing(1 - t),
  inOut: (easing) => (t) => (t < 0.5 ? easing(t * 2) / 2 : (2 - easing((1 - t) * 2)) / 2),
};

// Export all the mocked functionality
export default Animated;

export {
  Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useDerivedValue,
  useAnimatedReaction,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  cancelAnimation,
  runOnJS,
  runOnUI,
  interpolate,
  interpolateColor,
  Extrapolate,
  Gesture,
  Layout,
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  SlideInDown,
  SlideOutLeft,
  SlideOutRight,
  SlideOutUp,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInXUp,
  FlipInXDown,
  FlipInYLeft,
  FlipInYRight,
  FlipOutXUp,
  FlipOutXDown,
  FlipOutYLeft,
  FlipOutYRight,
  StretchInX,
  StretchInY,
  StretchOutX,
  StretchOutY,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeInDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
  FadeOutDown,
  Easing,
  addWhitelistedUIProps,
  addWhitelistedNativeProps,
};