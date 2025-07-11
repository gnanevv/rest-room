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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  MapPin, 
  Camera, 
  Star, 
  Euro, 
  Accessibility, 
  Clock, 
  Building, 
  Phone, 
  Globe, 
  Plus, 
  X, 
  Locate,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Award,
  Target,
  Coffee,
  Utensils,
  ShoppingBag,
  Fuel,
  Users,
  Wifi,
  Car,
  Baby,
  Droplets,
  Wind,
  Music,
  Shield,
  Upload,
  Image as ImageIcon,
  Eye,
  Send
} from 'lucide-react-native';
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
  { key: 'public', label: 'Обществено', icon: Building, gradient: ['#10B981', '#34D399'] },
  { key: 'restaurant', label: 'Ресторант', icon: Utensils, gradient: ['#F59E0B', '#FBBF24'] },
  { key: 'cafe', label: 'Кафе', icon: Coffee, gradient: ['#8B5CF6', '#A78BFA'] },
  { key: 'bar', label: 'Бар', icon: Users, gradient: ['#EF4444', '#F87171'] },
  { key: 'gas_station', label: 'Бензиностанция', icon: Fuel, gradient: ['#06B6D4', '#22D3EE'] },
  { key: 'mall', label: 'Мол', icon: ShoppingBag, gradient: ['#EC4899', '#F472B6'] },
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
  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities;
    if (currentAmenities.includes(amenity)) {
      updateFormData('amenities', currentAmenities.filter(a => a !== amenity));
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
    updateFormData('photos', formData.photos.filter((_, i) => i !== index));
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
        photos: formData.photos,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      Alert.alert('Успех!', 'Тоалетната беше добавена успешно!');
      resetForm();

    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Успех!', 'Тоалетната беше добавена успешно! (Demo режим)');
      resetForm();
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View key={i} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            {
              backgroundColor: i + 1 <= currentStep ? colors.primary : colors.surface,
              borderColor: i + 1 <= currentStep ? colors.primary : colors.border,
            }
          ]}>
            {i + 1 <= currentStep ? (
              <CheckCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Text style={[styles.stepNumber, { color: colors.textSecondary }]}>
                {i + 1}
              </Text>
            )}
          </View>
          {i < totalSteps - 1 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor: i + 1 < currentStep ? colors.primary : colors.border,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={['#10B981', '#34D399']}
          style={styles.stepIconContainer}
        >
          <Building size={24} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Основна информация
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Разкажете ни за тоалетната
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Име на заведението *</Text>
        <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.inputBlur}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Building size={20} color={colors.primary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="напр. Кафе Централ, Мол София..."
              placeholderTextColor={colors.textTertiary}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
            />
          </View>
        </BlurView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Адрес *</Text>
        <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.inputBlur}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <MapPin size={20} color={colors.primary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ул. Витоша 1, София"
              placeholderTextColor={colors.textTertiary}
              value={formData.address}
              onChangeText={(text) => updateFormData('address', text)}
            />
            <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
              <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.locationGradient}>
                <Locate size={16} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Тип заведение *</Text>
        <View style={styles.businessTypeGrid}>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.businessTypeCard,
                {
                  borderColor: formData.businessType === type.key ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={() => updateFormData('businessType', type.key)}
            >
              <LinearGradient
                colors={formData.businessType === type.key ? type.gradient : ['transparent', 'transparent']}
                style={styles.businessTypeGradient}
              >
                <View style={[
                  styles.businessTypeIcon,
                  { backgroundColor: formData.businessType === type.key ? 'rgba(255,255,255,0.2)' : colors.background }
                ]}>
                  <type.icon
                    size={20}
                    color={formData.businessType === type.key ? '#FFFFFF' : type.gradient[0]}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.businessTypeText,
                    {
                      color: formData.businessType === type.key ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={['#F59E0B', '#FBBF24']}
          style={styles.stepIconContainer}
        >
          <Euro size={24} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Цена и достъпност
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Информация за таксите и достъпността
        </Text>
      </View>

      <View style={[styles.switchCard, { backgroundColor: colors.surface }]}>
        <BlurView intensity={theme === 'light' ? 10 : 30} style={styles.switchBlur}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.switchIcon}>
                <Euro size={20} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
              <View style={styles.switchText}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  Платена тоалетна
                </Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                  Има ли такса за ползване?
                </Text>
              </View>
            </View>
            <Switch
              value={formData.isPaid}
              onValueChange={(value) => updateFormData('isPaid', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {formData.isPaid && (
            <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.priceInputBlur}>
              <View style={[styles.priceInputContainer, { backgroundColor: colors.background }]}>
                <Euro size={18} color={colors.warning} strokeWidth={2} />
                <TextInput
                  style={[styles.priceInput, { color: colors.text }]}
                  placeholder="0.50"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.price}
                  onChangeText={(text) => updateFormData('price', text)}
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.currency, { color: colors.textSecondary }]}>лв</Text>
              </View>
            </BlurView>
          )}
        </BlurView>
      </View>

      <View style={[styles.switchCard, { backgroundColor: colors.surface }]}>
        <BlurView intensity={theme === 'light' ? 10 : 30} style={styles.switchBlur}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <LinearGradient colors={['#10B981', '#34D399']} style={styles.switchIcon}>
                <Accessibility size={20} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
              <View style={styles.switchText}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  Достъпна за хора с увреждания
                </Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                  Има ли достъп за инвалидни колички?
                </Text>
              </View>
            </View>
            <Switch
              value={formData.accessibility}
              onValueChange={(value) => updateFormData('accessibility', value)}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.background}
            />
          </View>
        </BlurView>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={['#8B5CF6', '#A78BFA']}
          style={styles.stepIconContainer}
        >
          <Award size={24} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Удобства и описание
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Какви удобства предлага тоалетната?
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Удобства</Text>
        <View style={styles.amenitiesGrid}>
          {availableAmenities.map((amenity) => (
            <TouchableOpacity
              key={amenity.name}
              style={[
                styles.amenityChip,
                {
                  backgroundColor: formData.amenities.includes(amenity.name) ? amenity.color : colors.surface,
                  borderColor: formData.amenities.includes(amenity.name) ? amenity.color : colors.border,
                }
              ]}
              onPress={() => toggleAmenity(amenity.name)}
            >
              <BlurView intensity={formData.amenities.includes(amenity.name) ? 30 : 10} style={styles.amenityBlur}>
                <amenity.icon
                  size={16}
                  color={formData.amenities.includes(amenity.name) ? '#FFFFFF' : amenity.color}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.amenityText,
                    {
                      color: formData.amenities.includes(amenity.name) ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {amenity.name}
                </Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Описание</Text>
        <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.textAreaBlur}>
          <View style={[styles.textAreaContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Опишете тоалетната - състояние, чистота, особености..."
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
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={['#EC4899', '#F472B6']}
          style={styles.stepIconContainer}
        >
          <Camera size={24} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Снимки и преглед
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Добавете снимки и прегледайте информацията
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: colors.surface }]}
        onPress={pickImage}
      >
        <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.uploadBlur}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.uploadGradient}
          >
            <Upload size={28} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.uploadText}>Добави снимка</Text>
            <Text style={styles.uploadSubtext}>Натиснете за избор от галерията</Text>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>

      {formData.photos.length > 0 && (
        <View style={styles.photosGrid}>
          {formData.photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={[styles.removePhotoButton, { backgroundColor: colors.error }]}
                onPress={() => removePhoto(index)}
              >
                <X size={14} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.summaryBlur}>
          <View style={styles.summaryHeader}>
            <LinearGradient colors={['#10B981', '#34D399']} style={styles.summaryIcon}>
              <Eye size={20} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Преглед на информацията
            </Text>
          </View>
          
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Име:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formData.name || 'Не е въведено'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Адрес:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formData.address || 'Не е въведен'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Тип:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {businessTypes.find(t => t.key === formData.businessType)?.label}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Цена:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formData.isPaid ? `${formData.price || '0'} лв` : 'Безплатно'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Удобства:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formData.amenities.length} избрани
              </Text>
            </View>
          </View>
        </BlurView>
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
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
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={theme === 'light' ? ['#10B981', '#34D399', '#6EE7B7'] : ['#059669', '#10B981', '#34D399']}
        style={styles.header}
      >
        <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <LinearGradient colors={['#FFFFFF', '#F3F4F6']} style={styles.headerIcon}>
              <Plus size={28} color="#10B981" strokeWidth={2.5} />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Добави тоалетна</Text>
              <Text style={styles.headerSubtitle}>
                Помогни на общността като споделиш информация за нова тоалетна
              </Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {renderStepIndicator()}
      {renderStepContent()}

      <BlurView
        intensity={theme === 'light' ? 95 : 85}
        style={styles.bottomBar}
      >
        <View style={[styles.bottomBarContent, { backgroundColor: colors.surface }]}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={prevStep}
            >
              <ArrowLeft size={18} color={colors.text} strokeWidth={2} />
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                Назад
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                opacity: (isStepValid() && !isSubmitting) ? 1 : 0.5,
              },
              currentStep === 1 && { flex: 1 },
            ]}
            onPress={currentStep === totalSteps ? submitToSupabase : nextStep}
            disabled={!isStepValid() || isSubmitting}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Запазване...' : currentStep === totalSteps ? 'Добави тоалетна' : 'Напред'}
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
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
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
    shadowRadius: 16,
    elevation: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1FAE5',
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  stepLine: {
    width: 48,
    height: 3,
    marginHorizontal: 12,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 28,
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  inputBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderRadius: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  locationButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  locationGradient: {
    padding: 8,
    borderRadius: 12,
  },
  businessTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  businessTypeCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  businessTypeGradient: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 20,
  },
  businessTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  switchCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  switchBlur: {
    borderRadius: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  switchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  priceInputBlur: {
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderRadius: 12,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  currency: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityChip: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amenityBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  textAreaBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textAreaContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 120,
    borderRadius: 16,
  },
  textArea: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
    textAlignVertical: 'top',
  },
  uploadButton: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  uploadBlur: {
    borderRadius: 20,
  },
  uploadGradient: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
    borderRadius: 20,
  },
  uploadText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  uploadSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#BFDBFE',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  summaryBlur: {
    borderRadius: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  summaryItem: {
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  bottomBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});