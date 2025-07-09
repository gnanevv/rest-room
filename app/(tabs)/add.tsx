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
  });

  const [currentStep, setCurrentStep] = useState(1);
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
    Alert.alert('Локация', 'Получаване на текущата локация...');
    // In a real app, you would use location services here
    updateFormData('address', 'Текуща локация');
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

  const submitForm = () => {
    Alert.alert(
      'Успех!',
      'Тоалетната беше добавена успешно. Тя ще бъде прегледана от нашия екип преди да се появи на картата.',
      [{ text: 'OK', onPress: () => {
        // Reset form
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
        });
        setCurrentStep(1);
      }}]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View key={i} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: i + 1 <= currentStep ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                {
                  color: i + 1 <= currentStep ? colors.background : colors.textSecondary,
                },
              ]}
            >
              {i + 1}
            </Text>
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
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Основна информация
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Разкажете ни за тоалетната
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Име на заведението *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Building size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="напр. Кафе Централ, Мол София..."
            placeholderTextColor={colors.textTertiary}
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Адрес *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                  backgroundColor: formData.businessType === type.key ? colors.primary : colors.surface,
                  borderColor: formData.businessType === type.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => updateFormData('businessType', type.key)}
            >
              <type.icon
                size={24}
                color={formData.businessType === type.key ? colors.background : colors.textSecondary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.businessTypeText,
                  {
                    color: formData.businessType === type.key ? colors.background : colors.textSecondary,
                  },
                ]}
              >
                {type.label}
              </Text>
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

      <View style={styles.switchGroup}>
        <View style={styles.switchContainer}>
          <View style={styles.switchInfo}>
            <Euro size={24} color={colors.warning} strokeWidth={2} />
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
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        )}
      </View>

      <View style={styles.switchGroup}>
        <View style={styles.switchContainer}>
          <View style={styles.switchInfo}>
            <Accessibility size={24} color={colors.success} strokeWidth={2} />
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

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Работно време</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Clock size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="напр. 08:00 - 22:00"
            placeholderTextColor={colors.textTertiary}
            value={formData.openingHours}
            onChangeText={(text) => updateFormData('openingHours', text)}
          />
        </View>
      </View>
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
                  backgroundColor: formData.amenities.includes(amenity) ? colors.primary : colors.surface,
                  borderColor: formData.amenities.includes(amenity) ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleAmenity(amenity)}
            >
              <Text
                style={[
                  styles.amenityText,
                  {
                    color: formData.amenities.includes(amenity) ? colors.background : colors.textSecondary,
                  },
                ]}
              >
                {amenity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Описание</Text>
        <View style={[styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Контакти (по желание)</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Phone size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Телефон"
            placeholderTextColor={colors.textTertiary}
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            keyboardType="phone-pad"
          />
        </View>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Globe size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Уебсайт"
            placeholderTextColor={colors.textTertiary}
            value={formData.website}
            onChangeText={(text) => updateFormData('website', text)}
            keyboardType="url"
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Снимки
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Добавете снимки на тоалетната (по желание)
      </Text>

      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={pickImage}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.uploadGradient}
        >
          <Camera size={32} color={colors.background} strokeWidth={2} />
        </LinearGradient>
        <Text style={[styles.uploadText, { color: colors.text }]}>
          Добави снимка
        </Text>
        <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
          Натиснете за избор от галерията
        </Text>
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

      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Достъпност:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formData.accessibility ? 'Достъпна' : 'Не е достъпна'}
          </Text>
        </View>
      </View>
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
        return true; // Optional step
      case 4:
        return true; // Optional step
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
        <Text style={styles.headerTitle}>Добави тоалетна</Text>
        <Text style={styles.headerSubtitle}>
          Помогни на общността като споделиш информация за нова тоалетна
        </Text>
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
        intensity={theme === 'light' ? 80 : 60}
        style={styles.bottomBar}
      >
        <View style={[styles.bottomBarContent, { backgroundColor: colors.surface }]}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
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
                backgroundColor: isStepValid() ? colors.success : colors.border,
                opacity: isStepValid() ? 1 : 0.5,
              },
              currentStep === 1 && { flex: 1 },
            ]}
            onPress={currentStep === totalSteps ? submitForm : nextStep}
            disabled={!isStepValid()}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              {currentStep === totalSteps ? 'Добави тоалетна' : 'Напред'}
            </Text>
            {currentStep === totalSteps && (
              <CheckCircle size={20} color={colors.background} strokeWidth={2} />
            )}
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
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1FAE5',
    lineHeight: 24,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
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
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
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
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  businessTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  switchGroup: {
    marginBottom: 24,
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
    gap: 12,
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
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  textAreaContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  uploadButton: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  uploadGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
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
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});