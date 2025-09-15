import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Location from 'expo-location';
import { Plus, MapPin, CircleCheck as CheckCircle, Sparkles, Crown, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

import StepBasicInfo from '../components/addSteps/StepBasicInfo';
import StepDetails from '../components/addSteps/StepDetails';
import { useTheme } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface FormValues {
  name: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  accessible: boolean;
  changingTable: boolean;
  genderNeutral: boolean;
  familyFriendly: boolean;
  requiresKey: boolean;
  fee: boolean;
  cleanliness: number;
  privacy: number;
  photos: string[];
  additionalNotes: string;
}

const initialValues: FormValues = {
  name: '',
  businessType: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  accessible: false,
  changingTable: false,
  genderNeutral: false,
  familyFriendly: false,
  requiresKey: false,
  fee: false,
  cleanliness: 3,
  privacy: 3,
  photos: [],
  additionalNotes: '',
};

export default function AddScreen() {
  const { colors, theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const pulseAnimation = useSharedValue(1);
  const fadeAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const sparkleAnimation = useSharedValue(0);
  const floatAnimation = useSharedValue(0);

  useEffect(() => {
    // Start animations
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      false
    );

    // Entrance animations
    fadeAnimation.value = withTiming(1, { duration: 1000 });
    slideAnimation.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    
    // Sparkle animation
    sparkleAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );

    // Float animation
    floatAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      false
    );

    // Get current location
    getCurrentLocation();
  }, []);

  // Update progress animation when step changes
  useEffect(() => {
    progressAnimation.value = withSpring(currentStep / 2, { damping: 15, stiffness: 100 });
  }, [currentStep]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to add a restroom.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success! 🎉',
        'Thank you for adding a new restroom! Your contribution helps the community.',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setCurrentStep(1);
              setIsSubmitting(false);
            },
          },
          {
            text: 'Done',
            style: 'default',
            onPress: () => {
              setIsSubmitting(false);
              // Navigate back or to another screen
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add restroom. Please try again.');
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
    transform: [
      { translateY: interpolate(slideAnimation.value, [0, 1], [-50, 0]) },
      { scale: interpolate(fadeAnimation.value, [0, 1], [0.9, 1]) }
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnimation.value },
      { rotate: `${interpolate(sparkleAnimation.value, [0, 1], [0, 360])}deg` }
    ],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleAnimation.value,
    transform: [
      { scale: interpolate(sparkleAnimation.value, [0, 1], [0.5, 1.2]) },
      { rotate: `${interpolate(sparkleAnimation.value, [0, 1], [0, 180])}deg` }
    ],
  }));

  const floatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnimation.value, [0, 1], [-10, 10]) },
      { translateX: interpolate(floatAnimation.value, [0, 1], [-5, 5]) }
    ],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Enhanced Header with Gradient Background */}
      <LinearGradient
        colors={
          theme === 'light'
            ? ['#667eea', '#764ba2', '#f093fb']
            : ['#0f0c29', '#302b63', '#24243e']
        }
        style={styles.headerGradient}
      >
        {/* Floating Particles */}
        <Animated.View style={[styles.particle, styles.particle1, floatAnimatedStyle]} />
        <Animated.View style={[styles.particle, styles.particle2, floatAnimatedStyle]} />
        <Animated.View style={[styles.particle, styles.particle3, floatAnimatedStyle]} />
        
        <BlurView intensity={20} style={styles.headerBlur}>
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View style={styles.headerContent}>
              <Animated.View style={[styles.iconContainer, pulseAnimatedStyle]}>
                <LinearGradient
                  colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                  style={styles.iconGradient}
                >
                  <Plus size={36} color="#FFFFFF" strokeWidth={3} />
                  <Animated.View style={[styles.sparkleIcon, sparkleAnimatedStyle]}>
                    <Sparkles size={16} color="#FFFFFF" strokeWidth={2} />
                  </Animated.View>
                </LinearGradient>
              </Animated.View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: '#FFFFFF' }]}>
                  Add Amazing Place ✨
                </Text>
                <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                  Help others discover clean, accessible facilities
                </Text>
              </View>
            </View>
            
            {/* Enhanced Progress Container */}
            <BlurView intensity={30} style={styles.progressBlur}>
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, progressAnimatedStyle]}>
                    <LinearGradient
                      colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressGradient}
                    />
                  </Animated.View>
                </View>
                <View style={styles.progressSteps}>
                  {[1, 2].map((step) => (
                    <View
                      key={step}
                      style={[
                        styles.progressStep,
                        {
                          backgroundColor: currentStep >= step ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                        },
                      ]}
                    >
                      {currentStep > step ? (
                        <CheckCircle size={16} color="#4ECDC4" strokeWidth={2} />
                      ) : currentStep === step ? (
                        <Crown size={16} color="#FF6B6B" strokeWidth={2} />
                      ) : (
                        <Text style={[styles.stepNumber, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                          {step}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
                <Text style={[styles.progressText, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                  Step {currentStep} of 2 - {currentStep === 1 ? 'Basic Info' : 'Details & Features'}
                </Text>
              </View>
            </BlurView>
          </View>
        </BlurView>
      </LinearGradient>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, handleSubmit, isValid }) => (
          <>
            <View style={styles.content}>
              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {currentStep === 1 ? (
                  <StepBasicInfo
                    values={values}
                    setFieldValue={setFieldValue}
                    location={location}
                  />
                ) : (
                  <StepDetails
                    values={values}
                    setFieldValue={setFieldValue}
                  />
                )}
              </ScrollView>
            </View>

            {/* Enhanced Bottom Navigation */}
            <BlurView intensity={95} style={styles.bottomNavBlur}>
              <LinearGradient
                colors={
                  theme === 'light'
                    ? [`${colors.surface}F0`, `${colors.background}F0`]
                    : [`${colors.surface}F0`, `${colors.background}F0`]
                }
                style={styles.bottomNavGradient}
              >
                <View style={[styles.bottomNav, { backgroundColor: 'transparent' }]}>
                  {currentStep > 1 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.backButton]}
                      onPress={prevStep}
                      activeOpacity={0.8}
                    >
                      <BlurView intensity={20} style={styles.backButtonBlur}>
                        <View style={[styles.backButtonContent, { backgroundColor: `${colors.surface}95` }]}>
                          <Text style={[styles.backButtonText, { color: colors.primary }]}>Back</Text>
                        </View>
                      </BlurView>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      styles.nextButton,
                      currentStep === 1 && styles.fullWidth,
                      (!isValid || isSubmitting) && styles.disabledButton,
                    ]}
                    onPress={currentStep === 2 ? handleSubmit : nextStep}
                    disabled={!isValid || isSubmitting}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        (!isValid || isSubmitting)
                          ? ['#C7C7CC', '#C7C7CC']
                          : currentStep === 2
                          ? ['#10B981', '#34D399', '#6EE7B7']
                          : ['#667eea', '#764ba2', '#f093fb']
                      }
                      style={styles.nextButtonGradient}
                    >
                      {isSubmitting ? (
                        <Animated.View style={[styles.loadingContainer, pulseAnimatedStyle]}>
                          <Zap size={20} color="#FFFFFF" strokeWidth={2} />
                          <Text style={styles.nextButtonText}>Adding Magic...</Text>
                        </Animated.View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.nextButtonText}>
                            {currentStep === 2 ? 'Add Amazing Place' : 'Continue Journey'}
                          </Text>
                          {currentStep === 2 ? (
                            <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
                          ) : (
                            <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
                          )}
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </BlurView>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  particle1: {
    top: '20%',
    left: '15%',
  },
  particle2: {
    top: '60%',
    right: '20%',
  },
  particle3: {
    top: '80%',
    left: '70%',
  },
  headerBlur: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 20,
  },
  iconContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  progressBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 3,
  },
  progressSteps: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  progressText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
  },
  bottomNavBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavGradient: {
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  navButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    flex: 0.4,
  },
  backButtonBlur: {
    flex: 1,
    borderRadius: 20,
  },
  backButtonContent: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  nextButton: {
    flex: 1,
  },
  fullWidth: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  nextButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
              {currentStep > 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.backButton]}
                  onPress={prevStep}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.nextButton,
                  currentStep === 1 && styles.fullWidth,
                  (!isValid || isSubmitting) && styles.disabledButton,
                ]}
                onPress={currentStep === 2 ? handleSubmit : nextStep}
                disabled={!isValid || isSubmitting}
              >
                <Text style={styles.nextButtonText}>
                  {isSubmitting ? 'Adding...' : currentStep === 2 ? 'Add Restroom' : 'Next'}
                </Text>
                {currentStep === 2 && !isSubmitting && (
                  <CheckCircle size={20} color="#FFFFFF" style={styles.buttonIcon} />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fullWidth: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});