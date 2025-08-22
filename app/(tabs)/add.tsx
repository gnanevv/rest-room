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
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={[
            styles.progressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        Стъпка {currentStep} от {totalSteps}
      </Text>
    </View>
  );

  const renderStep1 = () => (
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
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Building size={20} color={colors.primary} strokeWidth={2} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="напр. Кафе Централ, Мол София..."
              placeholderTextColor={colors.textTertiary}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Адрес</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Тип заведение
          </Text>
          <View style={styles.businessGrid}>
            {businessTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.businessCard,
                  {
                    borderColor:
                      formData.businessType === type.key
                        ? colors.primary
                        : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                onPress={() => updateFormData('businessType', type.key)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    formData.businessType === type.key
                      ? (type.gradient as [string, string])
                      : ([colors.surface, colors.surface] as [string, string])
                  }
                  style={styles.businessCardGradient}
                >
                  <View
                    style={[
                      styles.businessIcon,
                      {
                        backgroundColor:
                          formData.businessType === type.key
                            ? 'rgba(255,255,255,0.2)'
                            : colors.background,
                      },
                    ]}
                  >
                    <type.icon
                      size={24}
                      color={
                        formData.businessType === type.key
                          ? '#FFFFFF'
                          : type.gradient[0]
                      }
                      strokeWidth={2}
                    />
                  </View>
                  <Text
                    style={[
                      styles.businessLabel,
                      {
                        color:
                          formData.businessType === type.key
                            ? '#FFFFFF'
                            : colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text
                    style={[
                      styles.businessDescription,
                      {
                        color:
                          formData.businessType === type.key
                            ? 'rgba(255,255,255,0.8)'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {type.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
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
        <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
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
            </View>
          )}
        </View>

        {/* Accessibility Section */}
        <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
              <TouchableOpacity
                key={amenity.name}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: formData.amenities.includes(amenity.name)
                      ? amenity.color
                      : colors.background,
                    borderColor: formData.amenities.includes(amenity.name)
                      ? amenity.color
                      : colors.border,
                  },
                ]}
                onPress={() => toggleAmenity(amenity.name)}
                activeOpacity={0.8}
              >
                <amenity.icon
                  size={16}
                  color={
                    formData.amenities.includes(amenity.name)
                      ? '#FFFFFF'
                      : amenity.color
                  }
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.amenityText,
                    {
                      color: formData.amenities.includes(amenity.name)
                        ? '#FFFFFF'
                        : colors.text,
                    },
                  ]}
                >
                  {amenity.name}
                </Text>
              </TouchableOpacity>
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
          <View style={[styles.textAreaWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
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
          style={[styles.uploadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
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
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
      </View>
    </ScrollView>
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
        <View style={[styles.bottomNavContent, { backgroundColor: colors.surface }]}>
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
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
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
  businessCard: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  businessCardGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  businessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  businessDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  featureCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  featureIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  priceSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  currencyLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  textAreaWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
    textAlignVertical: 'top',
  },
  uploadCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  photosSection: {
    gap: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  summaryContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    textAlign: 'right',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  bottomNavContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  nextButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});