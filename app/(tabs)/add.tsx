import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { MapPin, Camera, Star, Euro, Accessibility, Clock, Building, Phone, Globe, Plus, X, Locate, CircleCheck as CheckCircle, ArrowRight, ArrowLeft, Sparkles, Award, Target, Coffee, Utensils, ShoppingBag, Fuel, Users, Wifi, Car, Baby, Droplets, Wind, Music, Shield, Upload, Eye, Send, ChevronRight, Info, Zap, Wand2, Crown, Gem, Rocket } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

interface FormData {
  name: string;
  address: string;
  city: string;
  businessType: string;
  isPaid: boolean;
  price: string;
  accessibility: boolean;
  description: string;
  amenities: string[];
  photos: string[];
  phone: string;
  website: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
}

const businessTypes = [
  {
    key: 'public',
    label: 'Обществено',
    icon: Building,
    gradient: ['#10B981', '#34D399'],
    description: 'Паркове, площади, обществени сгради',
  },
  {
    key: 'restaurant',
    label: 'Ресторант',
    icon: Utensils,
    gradient: ['#F59E0B', '#FBBF24'],
    description: 'Ресторанти и заведения за хранене',
  },
  {
    key: 'cafe',
    label: 'Кафе',
    icon: Coffee,
    gradient: ['#8B5CF6', '#A78BFA'],
    description: 'Кафенета и бистра',
  },
  { 
    key: 'bar', 
    label: 'Бар', 
    icon: Users, 
    gradient: ['#EF4444', '#F87171'],
    description: 'Барове и нощни заведения',
  },
  {
    key: 'gas_station',
    label: 'Бензиностанция',
    icon: Fuel,
    gradient: ['#06B6D4', '#22D3EE'],
    description: 'Бензиностанции и сервизи',
  },
  {
    key: 'mall',
    label: 'Мол',
    icon: ShoppingBag,
    gradient: ['#EC4899', '#F472B6'],
    description: 'Търговски центрове и молове',
  },
];

const availableAmenities = [
  { name: 'Тоалетна хартия', icon: Droplets, color: '#06B6D4' },
  { name: 'Сапун', icon: Droplets, color: '#10B981' },
  { name: 'Дезинфектант', icon: Shield, color: '#8B5CF6' },
  { name: 'Сешоар', icon: Wind, color: '#F59E0B' },
  { name: 'Огледало', icon: Eye, color: '#6B7280' },
  { name: 'Пеленачка', icon: Baby, color: '#EC4899' },
  { name: 'Климатик', icon: Wind, color: '#06B6D4' },
  { name: 'Музика', icon: Music, color: '#8B5CF6' },
  { name: 'WiFi', icon: Wifi, color: '#10B981' },
  { name: 'Паркинг', icon: Car, color: '#F59E0B' },
];

export default function AddRestroomScreen() {
  const { colors, theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: 'София',
    businessType: 'public',
    isPaid: false,
    price: '',
    accessibility: false,
    description: '',
    amenities: [],
    photos: [],
    phone: '',
    website: '',
    openingHours: '',
    latitude: null,
    longitude: null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;

  // Animation values
  const progressAnimation = useSharedValue(1 / totalSteps);
  const stepAnimation = useSharedValue(0);
  const headerAnimation = useSharedValue(0);
  const cardAnimations = Array.from({ length: 6 }, () => useSharedValue(0));
  const floatingAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  // Start animations on mount
  React.useEffect(() => {
    headerAnimation.value = withSpring(1, { damping: 20, stiffness: 100 });
    floatingAnimation.value = withSequence(
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 2000 })
    );
    pulseAnimation.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0.8, { duration: 1000 }),
      withTiming(1, { duration: 1000 })
    );
  }, []);

  // Animate cards when business type section is visible
  React.useEffect(() => {
    if (currentStep === 1) {
      cardAnimations.forEach((animation, index) => {
        animation.value = withDelay(
          index * 100,
          withSpring(1, { damping: 15, stiffness: 200 })
        );
      });
    }
  }, [currentStep]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities;
    if (currentAmenities.includes(amenity)) {
      updateFormData(
        'amenities',
        currentAmenities.filter((a) => a !== amenity)
      );
    } else {
      updateFormData('amenities', [...currentAmenities, amenity]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData('photos', [...formData.photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    updateFormData(
      'photos',
      formData.photos.filter((_, i) => i !== index)
    );
  };

  const getCurrentLocation = () => {
    updateFormData('latitude', 42.6977);
    updateFormData('longitude', 23.3219);
    updateFormData('address', 'Текуща локация');
    Alert.alert('Локация', 'Локацията беше получена успешно!');
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Animate out current step
      stepAnimation.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(() => setCurrentStep(currentStep + 1))();
        stepAnimation.value = withSpring(1, { damping: 20, stiffness: 100 });
      });
      progressAnimation.value = withSpring(currentStep + 1 / totalSteps);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      stepAnimation.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(() => setCurrentStep(currentStep - 1))();
        stepAnimation.value = withSpring(1, { damping: 20, stiffness: 100 });
      });
      progressAnimation.value = withSpring((currentStep - 1) / totalSteps);
    }
  };

  const submitToSupabase = async () => {
    try {
      setIsSubmitting(true);

      let photoUrls: string[] = [];
      if (formData.photos && formData.photos.length > 0) {
        const bucket = supabase.storage.from('restroom-photos');

        for (const uri of formData.photos) {
          try {
            const filename = `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}.jpg`;
            
            let blob;
            if (uri.startsWith('data:')) {
              const response = await fetch(uri);
              blob = await response.blob();
            } else if (uri.startsWith('file:')) {
              const response = await fetch(uri);
              blob = await response.blob();
            } else {
              console.warn('Unexpected URI format:', uri);
              continue;
            }

            const { error: uploadError } = await bucket.upload(filename, blob, {
              contentType: blob.type || 'image/jpeg',
              upsert: false,
              cacheControl: '3600',
            });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              continue;
            }

            const { data } = bucket.getPublicUrl(filename);
            if (data?.publicUrl) {
              photoUrls.push(data.publicUrl);
            }
          } catch (e) {
            console.error('Error processing photo:', e);
          }
        }
      }

      const restroomData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        business_type: formData.businessType,
        is_paid: formData.isPaid,
        price: formData.isPaid ? parseFloat(formData.price) || 0 : null,
        accessibility: formData.accessibility,
        description: formData.description,
        amenities: formData.amenities,
        phone: formData.phone || null,
        website: formData.website || null,
        opening_hours: formData.openingHours || null,
        latitude: formData.latitude || 42.6977,
        longitude: formData.longitude || 23.3219,
        rating: 5.0,
        cleanliness: 5,
        availability: 'available',
        is_open: true,
        photos: photoUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('restrooms')
        .insert(restroomData);

      if (insertError) throw insertError;

      Alert.alert('Успех!', 'Тоалетната беше добавена успешно!');
      resetForm();
    } catch (error: any) {
      console.error('Submit error:', error.message || error);
      Alert.alert('Грешка', 'Възникна грешка при изпращането на данните. Моля, опитайте отново.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: 'София',
      businessType: 'public',
      isPaid: false,
      price: '',
      accessibility: false,
      description: '',
      amenities: [],
      photos: [],
      phone: '',
      website: '',
      openingHours: '',
      latitude: null,
      longitude: null,
    });
    setCurrentStep(1);
    progressAnimation.value = withSpring(1 / totalSteps);
  };

  // Animated styles
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  const stepStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 400 }),
    transform: [
      {
        translateX: withSpring(stepAnimation.value * 10, {
          damping: 20,
          stiffness: 100,
        }),
      },
    ],
  }));

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View style={[progressStyle]}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.progressFill}
          />
        </Animated.View>
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        Стъпка {currentStep} от {totalSteps}
      </Text>
    </View>
  );

  const BusinessTypeCard = ({ type }: { type: typeof businessTypes[0] }) => {
    const isSelected = formData.businessType === type.key;
    const scaleAnimation = useSharedValue(1);
    const borderAnimation = useSharedValue(0);
    const glowAnimation = useSharedValue(0);
    const cardIndex = businessTypes.findIndex(t => t.key === type.key);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnimation.value }],
      borderColor: interpolateColor(
        borderAnimation.value,
        [0, 1],
        [colors.border, type.gradient[0]]
      ),
      shadowOpacity: withTiming(isSelected ? 0.4 : 0.1, { duration: 300 }),
      elevation: withTiming(isSelected ? 12 : 4, { duration: 300 }),
      shadowColor: type.gradient[0],
    }));

    const gradientStyle = useAnimatedStyle(() => ({
      opacity: withTiming(isSelected ? 1 : 0, { duration: 400 }),
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowAnimation.value * 0.6,
      transform: [{ scale: 1 + glowAnimation.value * 0.1 }],
    }));

    const contentStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: withTiming(isSelected ? 1.05 : 1, { duration: 300 }),
        },
      ],
    }));

    const cardAnimationStyle = useAnimatedStyle(() => ({
      opacity: cardAnimations[cardIndex]?.value || 0,
      transform: [
        {
          translateY: interpolate(
            cardAnimations[cardIndex]?.value || 0,
            [0, 1],
            [50, 0]
          ),
        },
      ],
    }));

    React.useEffect(() => {
      if (isSelected) {
        scaleAnimation.value = withSpring(1.05, { damping: 15, stiffness: 200 });
        borderAnimation.value = withTiming(1, { duration: 400 });
        glowAnimation.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.7, { duration: 500 }),
          withTiming(1, { duration: 300 })
        );
      } else {
        scaleAnimation.value = withSpring(1, { damping: 15, stiffness: 200 });
        borderAnimation.value = withTiming(0, { duration: 400 });
        glowAnimation.value = withTiming(0, { duration: 200 });
      }
    }, [isSelected]);

    const handlePress = () => {
      scaleAnimation.value = withSequence(
        withTiming(0.92, { duration: 100 }),
        withSpring(isSelected ? 1.05 : 1, { damping: 15, stiffness: 200 })
      );
      updateFormData('businessType', type.key);
    };

    return (
      <Animated.View style={[cardAnimationStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={styles.businessCardWrapper}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.businessCardGlow,
              {
                backgroundColor: `${type.gradient[0]}30`,
              },
              glowStyle,
            ]}
          />
          
          <Animated.View
            style={[
              styles.businessCard,
              {
                backgroundColor: colors.surface,
                borderWidth: 3,
                shadowColor: type.gradient[0],
              },
              animatedStyle,
            ]}
          >
            <Animated.View style={[styles.businessCardGradientOverlay, gradientStyle]}>
              <LinearGradient
                colors={type.gradient as [string, string]}
                style={styles.businessCardGradient}
              />
            </Animated.View>
            
            <Animated.View style={[styles.businessCardContent, contentStyle]}>
              <View
                style={[
                  styles.businessIcon,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.25)'
                      : `${type.gradient[0]}15`,
                    borderWidth: 2,
                    borderColor: isSelected ? 'rgba(255,255,255,0.3)' : type.gradient[0],
                  },
                ]}
              >
                <type.icon
                  size={28}
                  color={isSelected ? '#FFFFFF' : type.gradient[0]}
                  strokeWidth={2.5}
                />
              </View>
              <Text
                style={[
                  styles.businessLabel,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontSize: 16,
                    fontFamily: 'Inter-Bold',
                  },
                ]}
              >
                {type.label}
              </Text>
              <Text
                style={[
                  styles.businessDescription,
                  {
                    color: isSelected
                      ? 'rgba(255,255,255,0.9)'
                      : colors.textSecondary,
                    fontSize: 12,
                  },
                ]}
              >
                {type.description}
              </Text>
              
              {/* Premium indicator for selected */}
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Crown size={16} color="#FFFFFF" strokeWidth={2} />
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const AmenityChip = ({ amenity }: { amenity: typeof availableAmenities[0] }) => {
    const isSelected = formData.amenities.includes(amenity.name);
    const scaleAnimation = useSharedValue(1);
    const backgroundAnimation = useSharedValue(0);
    const glowAnimation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnimation.value }],
      backgroundColor: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [colors.background, amenity.color]
      ),
      borderColor: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [colors.border, amenity.color]
      ),
      shadowOpacity: withTiming(isSelected ? 0.3 : 0.08, { duration: 200 }),
      elevation: withTiming(isSelected ? 8 : 3, { duration: 200 }),
      shadowColor: amenity.color,
    }));

    const textStyle = useAnimatedStyle(() => ({
      color: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [colors.text, '#FFFFFF']
      ),
    }));

    const iconStyle = useAnimatedStyle(() => ({
      color: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [amenity.color, '#FFFFFF']
      ),
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowAnimation.value * 0.4,
      transform: [{ scale: 1 + glowAnimation.value * 0.2 }],
    }));

    React.useEffect(() => {
      if (isSelected) {
        backgroundAnimation.value = withTiming(1, { duration: 300 });
        glowAnimation.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0.6, { duration: 400 })
        );
      } else {
        backgroundAnimation.value = withTiming(0, { duration: 300 });
        glowAnimation.value = withTiming(0, { duration: 200 });
      }
    }, [isSelected]);

    const handlePress = () => {
      scaleAnimation.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      toggleAmenity(amenity.name);
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.amenityGlow,
            {
              backgroundColor: `${amenity.color}40`,
            },
            glowStyle,
          ]}
        />
        
        <Animated.View
          style={[
            styles.amenityChip,
            {
              borderWidth: 2,
              shadowColor: amenity.color,
              shadowOpacity: isSelected ? 0.4 : 0.1,
              elevation: isSelected ? 10 : 4,
            },
            animatedStyle,
          ]}
        >
          <Animated.View style={iconStyle}>
            <amenity.icon size={18} strokeWidth={2.5} />
          </Animated.View>
          <Animated.Text style={[styles.amenityText, textStyle]}>
            {amenity.name}
          </Animated.Text>
          
          {/* Check indicator for selected */}
          {isSelected && (
            <View style={styles.amenityCheck}>
              <CheckCircle size={14} color="#FFFFFF" strokeWidth={2} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Enhanced header animation
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerAnimation.value,
    transform: [
      {
        translateY: interpolate(headerAnimation.value, [0, 1], [-50, 0]),
      },
      {
        scale: interpolate(headerAnimation.value, [0, 1], [0.9, 1]),
      },
    ],
  }));

  const floatingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(floatingAnimation.value, [0, 1], [0, -10]),
      },
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pulseAnimation.value,
      });
    ],
  }));

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.businessCardWrapper}
      >
        <Animated.View
          style={[
            styles.businessCard,
            {
              backgroundColor: colors.surface,
              borderWidth: 2,
              shadowColor: colors.primary,
            },
            animatedStyle,
          ]}
        >
          <Animated.View style={[styles.businessCardGradientOverlay, gradientStyle]}>
            <LinearGradient
              colors={type.gradient as [string, string]}
              style={styles.businessCardGradient}
            />
          </Animated.View>
          
          <Animated.View style={[styles.businessCardContent, contentStyle]}>
            <View
              style={[
                styles.businessIcon,
                {
                  backgroundColor: isSelected
                    ? 'rgba(255,255,255,0.2)'
                    : colors.background,
                },
              ]}
            >
              <type.icon
                size={24}
                color={isSelected ? '#FFFFFF' : type.gradient[0]}
                strokeWidth={2.5}
              />
            </View>
            <Text
              style={[
                styles.businessLabel,
                {
                  color: isSelected ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {type.label}
            </Text>
            <Text
              style={[
                styles.businessDescription,
                {
                  color: isSelected
                    ? 'rgba(255,255,255,0.85)'
                    : colors.textSecondary,
                },
              ]}
            >
              {type.description}
            </Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const AmenityChip = ({ amenity }: { amenity: typeof availableAmenities[0] }) => {
    const isSelected = formData.amenities.includes(amenity.name);
    const scaleAnimation = useSharedValue(1);
    const backgroundAnimation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnimation.value }],
      backgroundColor: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [colors.background, amenity.color]
      ),
      borderColor: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [colors.border, amenity.color]
      ),
      shadowOpacity: withTiming(isSelected ? 0.2 : 0.05, { duration: 200 }),
      elevation: withTiming(isSelected ? 4 : 2, { duration: 200 }),
    }));

    const textStyle = useAnimatedStyle(() => ({
      color: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [colors.text, '#FFFFFF']
      ),
    }));

    const iconStyle = useAnimatedStyle(() => ({
      color: interpolateColor(
        backgroundAnimation.value,
        [0, 1],
        [amenity.color, '#FFFFFF']
      ),
    }));

    React.useEffect(() => {
      if (isSelected) {
        backgroundAnimation.value = withTiming(1, { duration: 200 });
      } else {
        backgroundAnimation.value = withTiming(0, { duration: 200 });
      }
    }, [isSelected]);

    const handlePress = () => {
      scaleAnimation.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
        scaleAnimation.value = withSpring(1, { damping: 15, stiffness: 200 });
      });
      toggleAmenity(amenity.name);
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Animated.View
          style={[
            styles.amenityChip,
            {
              borderWidth: 2,
              shadowColor: amenity.color,
              shadowOpacity: isSelected ? 0.3 : 0.1,
              elevation: isSelected ? 8 : 3,
            },
            animatedStyle,
          ]}
        >
          <Animated.View style={iconStyle}>
            <amenity.icon size={16} strokeWidth={2} />
          </Animated.View>
          <Animated.Text style={[styles.amenityText, textStyle]}>
            {amenity.name}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderStep1 = () => (
    <Animated.View style={stepStyle}>
      <ScrollView 
        style={styles.stepContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.stepHeader}>
          <LinearGradient
            colors={['#10B981', '#34D399']}
            style={styles.stepIconContainer}
          >
            <Building size={28} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Основна информация
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            Започнете с основните детайли за тоалетната
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              ✨ Име на заведението
            </Text>
            <BlurView
              intensity={theme === 'light' ? 30 : 50}
              style={styles.inputBlur}
            >
              <View style={[styles.inputWrapper, { 
                backgroundColor: `${colors.surface}90`,
                borderColor: formData.name ? colors.primary : colors.border,
                borderWidth: formData.name ? 3 : 2,
                shadowColor: formData.name ? colors.primary : 'transparent',
                shadowOpacity: formData.name ? 0.3 : 0,
                shadowRadius: 8,
                elevation: formData.name ? 8 : 4,
              }]}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.inputIcon}
                >
                  <Building size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="напр. Кафе Централ, Мол София..."
                  placeholderTextColor={colors.textTertiary}
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                />
              </View>
            </BlurView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>📍 Адрес</Text>
            <BlurView
              intensity={theme === 'light' ? 30 : 50}
              style={styles.inputBlur}
            >
              <View style={[styles.inputWrapper, { 
                backgroundColor: `${colors.surface}90`,
                borderColor: formData.address ? colors.primary : colors.border,
                borderWidth: formData.address ? 3 : 2,
                shadowColor: formData.address ? colors.primary : 'transparent',
                shadowOpacity: formData.address ? 0.3 : 0,
                shadowRadius: 8,
                elevation: formData.address ? 8 : 4,
              }]}>
                <LinearGradient
                  colors={[colors.secondary, '#22D3EE']}
                  style={styles.inputIcon}
                >
                  <MapPin size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="ул. Витоша 1, София"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.address}
                  onChangeText={(text) => updateFormData('address', text)}
                />
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  style={styles.locationBtn}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.locationBtnGradient}
                  >
                    <Target size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              🏢 Тип заведение
            </Text>
            <View style={styles.businessGrid}>
              {businessTypes.map((type) => (
                <BusinessTypeCard key={type.key} type={type} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={stepStyle}>
      <ScrollView 
        style={styles.stepContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.stepHeader}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.stepIconContainer}
          >
            <Award size={28} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Удобства и детайли
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            Добавете информация за удобствата и достъпността
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* Payment Section */}
          <BlurView
            intensity={theme === 'light' ? 15 : 30}
            style={styles.featureCardBlur}
          >
            <View style={[styles.featureCard, { 
              backgroundColor: `${colors.surface}90`,
              borderColor: colors.border,
            }]}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIconContainer}>
                  <LinearGradient
                    colors={['#F59E0B', '#FBBF24']}
                    style={styles.featureIcon}
                  >
                    <Euro size={20} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>
                      Платена тоалетна
                    </Text>
                    <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>
                      Има ли такса за ползване?
                    </Text>
                  </View>
                </View>
                <Switch
                  value={formData.isPaid}
                  onValueChange={(value) => updateFormData('isPaid', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  ios_backgroundColor={colors.border}
                />
              </View>

              {formData.isPaid && (
                <View style={styles.priceSection}>
                  <BlurView
                    intensity={theme === 'light' ? 10 : 20}
                    style={styles.inputBlur}
                  >
                    <View style={[styles.inputWrapper, { 
                      backgroundColor: `${colors.background}95`,
                      borderColor: formData.price ? colors.warning : colors.border,
                      borderWidth: formData.price ? 2 : 1,
                    }]}>
                      <Euro size={18} color={colors.warning} strokeWidth={2} />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        placeholder="0.50"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.price}
                        onChangeText={(text) => updateFormData('price', text)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
                        лв
                      </Text>
                    </View>
                  </BlurView>
                </View>
              )}
            </View>
          </BlurView>

          {/* Accessibility Section */}
          <BlurView
            intensity={theme === 'light' ? 15 : 30}
            style={styles.featureCardBlur}
          >
            <View style={[styles.featureCard, { 
              backgroundColor: `${colors.surface}90`,
              borderColor: colors.border,
            }]}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIconContainer}>
                  <LinearGradient
                    colors={['#10B981', '#34D399']}
                    style={styles.featureIcon}
                  >
                    <Accessibility size={20} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>
                      Достъпност
                    </Text>
                    <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>
                      Достъпна за хора с увреждания
                    </Text>
                  </View>
                </View>
                <Switch
                  value={formData.accessibility}
                  onValueChange={(value) => updateFormData('accessibility', value)}
                  trackColor={{ false: colors.border, true: colors.success }}
                  thumbColor={colors.background}
                  ios_backgroundColor={colors.border}
                />
              </View>
            </View>
          </BlurView>

          {/* Amenities Section */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              ⭐ Удобства
            </Text>
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              Изберете наличните удобства
            </Text>
            <View style={styles.amenitiesGrid}>
              {availableAmenities.map((amenity) => (
                <AmenityChip key={amenity.name} amenity={amenity} />
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              📝 Описание
            </Text>
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              Споделете полезна информация за тоалетната
            </Text>
            <BlurView
              intensity={theme === 'light' ? 30 : 50}
              style={styles.inputBlur}
            >
              <View style={[styles.textAreaWrapper, { 
                backgroundColor: `${colors.surface}85`,
                borderColor: formData.description ? colors.primary : colors.border,
                borderWidth: formData.description ? 3 : 2,
                shadowColor: formData.description ? colors.primary : 'transparent',
                shadowOpacity: formData.description ? 0.3 : 0,
                shadowRadius: 8,
                elevation: formData.description ? 8 : 4,
              }]}>
                <TextInput
                  style={[styles.textArea, { color: colors.text }]}
                  placeholder="Опишете състоянието, чистотата, особеностите..."
                  placeholderTextColor={colors.textTertiary}
                  value={formData.description}
                  onChangeText={(text) => updateFormData('description', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </BlurView>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={stepStyle}>
      <ScrollView 
        style={styles.stepContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.stepHeader}>
          <LinearGradient
            colors={['#EC4899', '#F472B6']}
            style={styles.stepIconContainer}
          >
            <Camera size={28} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Снимки и преглед
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            Добавете снимки и прегледайте информацията
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* Photo Upload */}
          <TouchableOpacity
            style={styles.uploadCardWrapper}
            onPress={pickImage}
            activeOpacity={0.9}
          >
            <BlurView
              intensity={theme === 'light' ? 40 : 60}
              style={styles.uploadCardBlur}
            >
              <View style={[styles.uploadCard, { 
                backgroundColor: `${colors.surface}70`,
                borderColor: colors.border,
                borderWidth: 3,
                borderStyle: 'dashed',
              }]}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.uploadGradient}
                >
                  <Camera size={36} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.uploadTitle}>📸 Добави снимка</Text>
                  <Text style={styles.uploadSubtitle}>
                    ✨ Натиснете за избор от галерията
                  </Text>
                </LinearGradient>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Photos Grid */}
          {formData.photos.length > 0 && (
            <View style={styles.photosSection}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                🖼️ Добавени снимки ({formData.photos.length})
              </Text>
              <View style={styles.photosGrid}>
                {formData.photos.map((photo, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.photoContainer,
                      {
                        transform: [{ scale: withSpring(1, { damping: 15 }) }],
                      },
                    ]}
                  >
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={[
                        styles.removePhotoBtn, 
                        { 
                          backgroundColor: colors.error,
                          shadowColor: colors.error,
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        }
                      ]}
                      onPress={() => removePhoto(index)}
                    >
                      <X size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* Summary Card */}
          <BlurView
            intensity={theme === 'light' ? 40 : 60}
            style={styles.summaryCardBlur}
          >
            <View style={[styles.summaryCard, { 
              backgroundColor: `${colors.surface}80`,
              borderColor: colors.border,
              borderWidth: 2,
              shadowColor: colors.primary,
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 12,
            }]}>
              <View style={styles.summaryHeader}>
                <LinearGradient
                  colors={[colors.success, '#34D399']}
                  style={styles.summaryIcon}
                >
                  <Rocket size={22} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  🎯 Преглед на информацията
                </Text>
              </View>

              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Име:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formData.name || 'Не е въведено'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Адрес:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formData.address || 'Не е въведен'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Тип:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {businessTypes.find((t) => t.key === formData.businessType)?.label}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Цена:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formData.isPaid ? `${formData.price || '0'} лв` : 'Безплатно'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Удобства:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formData.amenities.length} избрани
                  </Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.address.trim() !== '';
      case 2:
        return !formData.isPaid || formData.price.trim() !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Modern Header */}
      <Animated.View style={headerAnimatedStyle}>
        <LinearGradient
          colors={
            theme === 'light'
              ? ['#667eea', '#764ba2', '#f093fb']
              : ['#0f0c29', '#302b63', '#24243e']
          }
          style={styles.header}
        >
          {/* Floating particles */}
          <Animated.View style={[styles.particle, styles.particle1, floatingAnimatedStyle]} />
          <Animated.View style={[styles.particle, styles.particle2, floatingAnimatedStyle]} />
          <Animated.View style={[styles.particle, styles.particle3, floatingAnimatedStyle]} />
          
          <BlurView
            intensity={theme === 'light' ? 30 : 50}
            style={styles.headerBlur}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Animated.View style={pulseAnimatedStyle}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={styles.headerIcon}
                  >
                    <Wand2 size={28} color={colors.primary} strokeWidth={2.5} />
                  </LinearGradient>
                </Animated.View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>✨ Добави тоалетна</Text>
                  <Text style={styles.headerSubtitle}>
                    🚀 Помогни на общността
                  </Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.stepBadge}
                >
                  <Gem size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.stepBadgeText}>{currentStep}/{totalSteps}</Text>
                </LinearGradient>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      {renderProgressBar()}
      {renderStepContent()}

      {/* Modern Bottom Navigation */}
      <BlurView
        intensity={theme === 'light' ? 90 : 80}
        style={styles.bottomNav}
      >
        <View style={[styles.bottomNavContent, { backgroundColor: `${colors.surface}90` }]}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: `${colors.surface}95`,
                  borderColor: colors.border,
                  borderWidth: 2,
                  shadowColor: colors.textSecondary,
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                },
              ]}
              onPress={prevStep}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                Назад
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                opacity: isStepValid() && !isSubmitting ? 1 : 0.5,
              },
              currentStep === 1 && { flex: 1 },
            ]}
            onPress={currentStep === totalSteps ? submitToSupabase : nextStep}
            disabled={!isStepValid() || isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                currentStep === totalSteps 
                  ? [colors.success, '#10B981']
                  : [colors.primary, colors.primaryDark]
              }
              style={styles.nextButtonGradient}
            >
              {currentStep === totalSteps && !isSubmitting && (
                <Sparkles size={20} color="#FFFFFF" strokeWidth={2.5} />
              )}
              <Text style={styles.nextButtonText}>
                {isSubmitting
                  ? 'Запазване...'
                  : currentStep === totalSteps
                  ? '🚀 Добави тоалетна'
                  : 'Напред'}
              </Text>
              {currentStep === totalSteps && !isSubmitting ? (
                <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
              ) : !isSubmitting ? (
                <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
              ) : null}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    left: '75%',
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 20,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepBadgeText: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  stepContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  stepHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    paddingHorizontal: 20,
    gap: 28,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  inputHint: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  inputBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Inter-Medium',
  },
  locationBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locationBtnGradient: {
    padding: 12,
    borderRadius: 16,
  },
  businessGrid: {
    gap: 20,
  },
  businessCardWrapper: {
    borderRadius: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  businessCardGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    zIndex: -1,
  },
  businessCard: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
  },
  businessCardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  businessCardGradient: {
    flex: 1,
    borderRadius: 22,
  },
  businessCardContent: {
    padding: 28,
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
    minHeight: 140,
    justifyContent: 'center',
    position: 'relative',
  },
  businessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  businessLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginTop: 8,
  },
  businessDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  featureCardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  featureCard: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 28,
  },
  featureIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 24,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
  },
  featureSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  priceSection: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  currencyLabel: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    zIndex: -1,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  amenityCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textAreaWrapper: {
    borderRadius: 20,
    padding: 24,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  textArea: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    flex: 1,
    textAlignVertical: 'top',
    lineHeight: 26,
  },
  uploadCardWrapper: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  uploadCardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  uploadCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  uploadGradient: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 40,
    gap: 20,
  },
  uploadTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  uploadSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  photosSection: {
    gap: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  summaryCardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  summaryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 28,
    paddingBottom: 24,
    gap: 20,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  summaryContent: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    gap: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'right',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  bottomNavContent: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 24,
    gap: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  nextButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});