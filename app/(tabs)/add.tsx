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
} from 'react-native-reanimated';
import { MapPin, Camera, Star, Euro, Accessibility, Clock, Building, Phone, Globe, Plus, X, Locate, CircleCheck as CheckCircle, ArrowRight, ArrowLeft, Sparkles, Award, Target, Coffee, Utensils, ShoppingBag, Fuel, Users, Wifi, Car, Baby, Droplets, Wind, Music, Shield, Upload, Eye, Send, ChevronRight, Info, Zap } from 'lucide-react-native';
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
      setCurrentStep(currentStep + 1);
      progressAnimation.value = withSpring(currentStep + 1 / totalSteps);
      stepAnimation.value = withTiming(1, { duration: 300 });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      progressAnimation.value = withSpring((currentStep - 1) / totalSteps);
      stepAnimation.value = withTiming(0, { duration: 300 });
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

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnimation.value }],
      borderColor: interpolateColor(
        borderAnimation.value,
        [0, 1],
        [colors.border, colors.primary]
      ),
      shadowOpacity: withTiming(isSelected ? 0.25 : 0.08, { duration: 200 }),
      elevation: withTiming(isSelected ? 8 : 3, { duration: 200 }),
    }));

    const gradientStyle = useAnimatedStyle(() => ({
      opacity: withTiming(isSelected ? 1 : 0, { duration: 300 }),
    }));

    const contentStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: withTiming(isSelected ? 1.02 : 1, { duration: 200 }),
        },
      ],
    }));

    React.useEffect(() => {
      if (isSelected) {
        scaleAnimation.value = withSpring(1.02, { damping: 15, stiffness: 200 });
        borderAnimation.value = withTiming(1, { duration: 300 });
      } else {
        scaleAnimation.value = withSpring(1, { damping: 15, stiffness: 200 });
        borderAnimation.value = withTiming(0, { duration: 300 });
      }
    }, [isSelected]);

    const handlePress = () => {
      scaleAnimation.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
        scaleAnimation.value = withSpring(isSelected ? 1.02 : 1, { damping: 15, stiffness: 200 });
      });
      updateFormData('businessType', type.key);
    };

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
              Име на заведението
            </Text>
            <BlurView
              intensity={theme === 'light' ? 20 : 40}
              style={styles.inputBlur}
            >
              <View style={[styles.inputWrapper, { 
                backgroundColor: `${colors.surface}95`,
                borderColor: formData.name ? colors.primary : colors.border,
                borderWidth: formData.name ? 2 : 1,
              }]}>
                <Building size={20} color={colors.primary} strokeWidth={2} />
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
            <Text style={[styles.inputLabel, { color: colors.text }]}>Адрес</Text>
            <BlurView
              intensity={theme === 'light' ? 20 : 40}
              style={styles.inputBlur}
            >
              <View style={[styles.inputWrapper, { 
                backgroundColor: `${colors.surface}95`,
                borderColor: formData.address ? colors.primary : colors.border,
                borderWidth: formData.address ? 2 : 1,
              }]}>
                <MapPin size={20} color={colors.primary} strokeWidth={2} />
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
                    <Locate size={16} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Тип заведение
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
              Удобства
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
              Описание
            </Text>
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              Споделете полезна информация за тоалетната
            </Text>
            <BlurView
              intensity={theme === 'light' ? 15 : 30}
              style={styles.inputBlur}
            >
              <View style={[styles.textAreaWrapper, { 
                backgroundColor: `${colors.surface}90`,
                borderColor: formData.description ? colors.primary : colors.border,
                borderWidth: formData.description ? 2 : 1,
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
              intensity={theme === 'light' ? 20 : 40}
              style={styles.uploadCardBlur}
            >
              <View style={[styles.uploadCard, { 
                backgroundColor: `${colors.surface}80`,
                borderColor: colors.border,
              }]}>
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF']}
                  style={styles.uploadGradient}
                >
                  <Upload size={32} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.uploadTitle}>Добави снимка</Text>
                  <Text style={styles.uploadSubtitle}>
                    Натиснете за избор от галерията
                  </Text>
                </LinearGradient>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Photos Grid */}
          {formData.photos.length > 0 && (
            <View style={styles.photosSection}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Добавени снимки ({formData.photos.length})
              </Text>
              <View style={styles.photosGrid}>
                {formData.photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={[styles.removePhotoBtn, { backgroundColor: colors.error }]}
                      onPress={() => removePhoto(index)}
                    >
                      <X size={14} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Summary Card */}
          <BlurView
            intensity={theme === 'light' ? 20 : 40}
            style={styles.summaryCardBlur}
          >
            <View style={[styles.summaryCard, { 
              backgroundColor: `${colors.surface}90`,
              borderColor: colors.border,
            }]}>
              <View style={styles.summaryHeader}>
                <LinearGradient
                  colors={['#10B981', '#34D399']}
                  style={styles.summaryIcon}
                >
                  <Eye size={20} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Преглед на информацията
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
      <LinearGradient
        colors={
          theme === 'light'
            ? ['#4F46E5', '#6366F1', '#8B5CF6']
            : ['#1E293B', '#334155', '#475569']
        }
        style={styles.header}
      >
        <BlurView
          intensity={theme === 'light' ? 20 : 40}
          style={styles.headerBlur}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.headerIcon}
              >
                <Plus size={24} color={colors.primary} strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Добави тоалетна</Text>
                <Text style={styles.headerSubtitle}>
                  Помогни на общността
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepBadgeText}>{currentStep}/{totalSteps}</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {renderProgressBar()}
      {renderStepContent()}

      {/* Modern Bottom Navigation */}
      <BlurView
        intensity={theme === 'light' ? 95 : 85}
        style={styles.bottomNav}
      >
        <View style={[styles.bottomNavContent, { backgroundColor: `${colors.surface}95` }]}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={prevStep}
              activeOpacity={0.8}
            >
              <ArrowLeft size={18} color={colors.text} strokeWidth={2} />
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
              colors={[colors.primary, colors.primaryDark]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {isSubmitting
                  ? 'Запазване...'
                  : currentStep === totalSteps
                  ? 'Добави тоалетна'
                  : 'Напред'}
              </Text>
              {currentStep === totalSteps && !isSubmitting ? (
                <Send size={18} color="#FFFFFF" strokeWidth={2} />
              ) : !isSubmitting ? (
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
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
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
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
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    paddingHorizontal: 20,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  inputHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  inputBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  locationBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  locationBtnGradient: {
    padding: 8,
    borderRadius: 12,
  },
  businessGrid: {
    gap: 16,
  },
  businessCardWrapper: {
    borderRadius: 20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  businessCard: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 120,
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
    borderRadius: 18,
  },
  businessCardContent: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
    minHeight: 120,
    justifyContent: 'center',
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  businessLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginTop: 4,
  },
  businessDescription: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  featureCardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  featureCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  featureIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  priceSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  currencyLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  amenityText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  textAreaWrapper: {
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  uploadCardWrapper: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  uploadCardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  uploadCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadGradient: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  uploadSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  photosSection: {
    gap: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  summaryCardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
    gap: 16,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 19,
    fontFamily: 'Inter-Bold',
  },
  summaryContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    textAlign: 'right',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  bottomNavContent: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  backButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  nextButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nextButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});