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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, Camera, Star, Euro, Accessibility, Clock, Building, Phone, Globe, Users, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Plus, X, Upload, Locate } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

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
  { key: 'public', label: 'Обществено', icon: Building },
  { key: 'restaurant', label: 'Ресторант', icon: Users },
  { key: 'cafe', label: 'Кафе', icon: Users },
  { key: 'bar', label: 'Бар', icon: Users },
  { key: 'gas_station', label: 'Бензиностанция', icon: Building },
  { key: 'mall', label: 'Мол', icon: Building },
];

const availableAmenities = [
  'Тоалетна хартия',
  'Сапун',
  'Дезинфектант',
  'Сешоар',
  'Огледало',
  'Пеленачка',
  'Климатик',
  'Музика',
  'WiFi',
  'Паркинг',
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
    // Mock coordinates for Sofia center
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

      // Prepare data for Supabase
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
        rating: 5.0, // Default rating
        cleanliness: 5, // Default cleanliness
        availability: 'available',
        is_open: true,
        photos: formData.photos,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('restrooms')
        .insert([restroomData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        Alert.alert('Грешка', 'Възникна грешка при запазването. Моля опитайте отново.');
        return;
      }

      Alert.alert(
        'Успех!',
        'Тоалетната беше добавена успешно в базата данни!',
        [{ text: 'OK', onPress: resetForm }]
      );

    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Грешка', 'Възникна неочаквана грешка. Моля опитайте отново.');
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
          <LinearGradient
            colors={i + 1 <= currentStep ? ['#10B981', '#059669'] : [colors.border, colors.border]}
            style={styles.stepCircle}
          >
            <Text
              style={[
                styles.stepNumber,
                {
                  color: i + 1 <= currentStep ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {i + 1}
            </Text>
          </LinearGradient>
          {i < totalSteps - 1 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor: i + 1 < currentStep ? '#10B981' : colors.border,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Основна информация
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Разкажете ни за тоалетната
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Име на заведението *</Text>
        <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.inputBlur}>
          <View style={[styles.inputContainer, { backgroundColor: `${colors.surface}80` }]}>
            <Building size={20} color={colors.textSecondary} strokeWidth={2} />
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
        <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.inputBlur}>
          <View style={[styles.inputContainer, { backgroundColor: `${colors.surface}80` }]}>
            <MapPin size={20} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ул. Витоша 1, София"
              placeholderTextColor={colors.textTertiary}
              value={formData.address}
              onChangeText={(text) => updateFormData('address', text)}
            />
            <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
              <Locate size={18} color={colors.primary} strokeWidth={2} />
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
                  backgroundColor: formData.businessType === type.key 
                    ? `${colors.primary}20` 
                    : `${colors.surface}80`,
                  borderColor: formData.businessType === type.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => updateFormData('businessType', type.key)}
            >
              <BlurView intensity={theme === 'light' ? 60 : 40} style={styles.businessTypeBlur}>
                <type.icon
                  size={24}
                  color={formData.businessType === type.key ? colors.primary : colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.businessTypeText,
                    {
                      color: formData.businessType === type.key ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Цена и достъпност
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Информация за таксите и достъпността
      </Text>

      <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.switchGroupBlur}>
        <View style={[styles.switchGroup, { backgroundColor: `${colors.surface}80` }]}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.switchIcon}>
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
            <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.inputBlur}>
              <View style={[styles.inputContainer, { backgroundColor: `${colors.surface}80` }]}>
                <Euro size={20} color={colors.warning} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
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
        </View>
      </BlurView>

      <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.switchGroupBlur}>
        <View style={[styles.switchGroup, { backgroundColor: `${colors.surface}80` }]}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.switchIcon}>
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
        </View>
      </BlurView>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Удобства и описание
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Какви удобства предлага тоалетната?
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Удобства</Text>
        <View style={styles.amenitiesGrid}>
          {availableAmenities.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              style={[
                styles.amenityChip,
                {
                  backgroundColor: formData.amenities.includes(amenity) 
                    ? `${colors.primary}20` 
                    : `${colors.surface}80`,
                  borderColor: formData.amenities.includes(amenity) ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleAmenity(amenity)}
            >
              <BlurView intensity={theme === 'light' ? 60 : 40} style={styles.amenityBlur}>
                <Text
                  style={[
                    styles.amenityText,
                    {
                      color: formData.amenities.includes(amenity) ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  {amenity}
                </Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Описание</Text>
        <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.textAreaBlur}>
          <View style={[styles.textAreaContainer, { backgroundColor: `${colors.surface}80` }]}>
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
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Снимки и преглед
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Добавете снимки и прегледайте информацията
      </Text>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickImage}
      >
        <BlurView intensity={theme === 'light' ? 80 : 60} style={styles.uploadBlur}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.uploadGradient}
          >
            <Camera size={32} color="#FFFFFF" strokeWidth={2} />
          </LinearGradient>
          <Text style={[styles.uploadText, { color: colors.text }]}>
            Добави снимка
          </Text>
          <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
            Натиснете за избор от галерията
          </Text>
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
                <X size={16} color={colors.background} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <BlurView intensity={theme === 'light' ? 90 : 70} style={styles.summaryBlur}>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.surface}90` }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Преглед на информацията
          </Text>
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
        </View>
      </BlurView>
    </View>
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
        colors={theme === 'light' ? ['#10B981', '#34D399'] : ['#059669', '#10B981']}
        style={styles.header}
      >
        <BlurView intensity={theme === 'light' ? 20 : 40} style={styles.headerBlur}>
          <Text style={styles.headerTitle}>Добави тоалетна</Text>
          <Text style={styles.headerSubtitle}>
            Помогни на общността като споделиш информация за нова тоалетна
          </Text>
        </BlurView>
      </LinearGradient>

      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      <BlurView
        intensity={theme === 'light' ? 90 : 70}
        style={styles.bottomBar}
      >
        <View style={[styles.bottomBarContent, { backgroundColor: `${colors.surface}90` }]}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: `${colors.background}80`, borderColor: colors.border }]}
              onPress={prevStep}
            >
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
              {currentStep === totalSteps && !isSubmitting && (
                <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
              )}
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerBlur: {
    borderRadius: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1FAE5',
    lineHeight: 24,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  stepLine: {
    width: 40,
    height: 3,
    marginHorizontal: 8,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
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
    marginBottom: 32,
    lineHeight: 24,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backdropFilter: 'blur(10px)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  locationButton: {
    padding: 4,
  },
  currency: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  businessTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  businessTypeCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  businessTypeBlur: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 12,
    backdropFilter: 'blur(10px)',
  },
  businessTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  switchGroupBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  switchGroup: {
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  switchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  amenityBlur: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backdropFilter: 'blur(10px)',
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  textAreaBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  textAreaContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 120,
    backdropFilter: 'blur(10px)',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadBlur: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backdropFilter: 'blur(10px)',
  },
  uploadGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryCard: {
    padding: 24,
    backdropFilter: 'blur(10px)',
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    paddingBottom: 40,
  },
  bottomBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backdropFilter: 'blur(10px)',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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