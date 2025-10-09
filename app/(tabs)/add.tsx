import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Plus, MapPin, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

export default function AddTab() {
  const { colors, theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.9);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
    iconRotation.value = withSequence(
      withSpring(360, { damping: 15, stiffness: 100 }),
      withSpring(0, { damping: 15, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const handleGetStarted = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
        >
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <BlurView intensity={20} style={styles.iconBlur}>
              <View style={styles.iconContent}>
                <Plus size={32} color="#FFFFFF" strokeWidth={3} />
              </View>
            </BlurView>
          </Animated.View>
          <Text style={styles.title}>Add New Restroom</Text>
          <Text style={styles.subtitle}>Help others find clean facilities</Text>
          <Sparkles size={20} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} style={styles.sparkle} />
        </LinearGradient>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3</Text>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, animatedStyle]}>
          <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.card}>
            <View style={[styles.cardContent, { backgroundColor: `${colors.surface}95` }]}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.cardIcon}
              >
                <MapPin size={28} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Location Information</Text>
              <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                We'll help you add location details for the restroom
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  iconContent: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: 40,
    right: 30,
  },
  progressContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  cardContent: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    gap: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
});