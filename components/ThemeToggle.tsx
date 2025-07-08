import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function ThemeToggle({ size = 'medium', style }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isDarkMode]);

  const sizes = {
    small: { width: 44, height: 24, iconSize: 14 },
    medium: { width: 56, height: 32, iconSize: 18 },
    large: { width: 68, height: 40, iconSize: 22 },
  };

  const currentSize = sizes[size];

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, currentSize.width - currentSize.height + 2],
  });

  return (
    <TouchableOpacity
      style={[styles.container, { width: currentSize.width, height: currentSize.height }, style]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={styles.blur}>
        <LinearGradient
          colors={isDarkMode 
            ? ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)']
            : ['rgba(248, 250, 252, 0.8)', 'rgba(241, 245, 249, 0.8)']
          }
          style={[styles.track, { borderColor: colors.border }]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: currentSize.height - 4,
                height: currentSize.height - 4,
                transform: [{ translateX }],
                backgroundColor: colors.background,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <LinearGradient
              colors={isDarkMode ? [colors.primary, colors.primaryDark] : [colors.warning, '#F59E0B']}
              style={styles.thumbGradient}
            >
              {isDarkMode ? (
                <Moon size={currentSize.iconSize} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Sun size={currentSize.iconSize} color="#FFFFFF" strokeWidth={2} />
              )}
            </LinearGradient>
          </Animated.View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blur: {
    flex: 1,
  },
  track: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    borderRadius: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  thumbGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
});