import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, type, onHide, duration = 3000 }: ToastProps) {
  const { colors, theme } = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }

    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 300 });

    const timer = setTimeout(() => {
      translateY.value = withSpring(-100, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onHide)();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          gradient: [colors.success, '#059669'] as const,
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          icon: XCircle,
          gradient: [colors.error, '#DC2626'] as const,
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          gradient: [colors.warning, '#D97706'] as const,
          iconColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          icon: Info,
          gradient: [colors.info, '#2563EB'] as const,
          iconColor: '#FFFFFF',
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView intensity={theme === 'light' ? 95 : 80} style={styles.blur}>
        <View
          style={[
            styles.content,
            { backgroundColor: `${colors.surface}95` },
          ]}
        >
          <LinearGradient colors={config.gradient} style={styles.iconContainer}>
            <IconComponent
              size={20}
              color={config.iconColor}
              strokeWidth={2.5}
            />
          </LinearGradient>
          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  blur: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
  },
});
