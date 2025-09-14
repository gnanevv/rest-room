import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Location from 'expo-location';
import { Plus, MapPin, CheckCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import StepBasicInfo from '../components/addSteps/StepBasicInfo';
import StepDetails from '../components/addSteps/StepDetails';
import { useTheme } from '../hooks/useTheme';

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
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const pulseAnimation = useSharedValue(1);
  const fadeAnimation = useSharedValue(0);

  useEffect(() => {
    // Start pulse animation
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );

    // Fade in animation
    fadeAnimation.value = withTiming(1, { duration: 800 });

    // Get current location
    getCurrentLocation();
  }, []);

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

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
    transform: [{ translateY: withSpring(fadeAnimation.value === 1 ? 0 : -20) }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <Animated.View style={[styles.iconContainer, pulseAnimatedStyle]}>
            <Plus size={32} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>
              Add New Restroom 🚻
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Help others find clean, accessible facilities
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / 2) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            Step {currentStep} of 2
          </Text>
        </View>
      </Animated.View>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, handleSubmit, isValid }) => (
          <>
            <ScrollView 
              style={styles.content}
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

            <View style={[styles.bottomNav, { backgroundColor: theme.surface }]}>
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