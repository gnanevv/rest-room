import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FormikProps } from 'formik';
import { LinearGradient } from 'expo-linear-gradient';
import { Building, MapPin, Locate } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { businessTypes } from '@/constants/formOptions';
import { BlurView } from 'expo-blur';
import styles from './styles';

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

interface Props {
  formik: FormikProps<FormData>;
  getCurrentLocation: () => void;
}

const StepBasicInfo: React.FC<Props> = ({ formik, getCurrentLocation }) => {
  const { colors, theme } = useTheme();

  return (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
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

      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Име на заведението *
        </Text>
        <BlurView
          intensity={theme === 'light' ? 20 : 40}
          style={styles.inputBlur}
        >
          <View
            style={[styles.inputContainer, { backgroundColor: colors.surface }]}
          >
            <Building size={20} color={colors.primary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="напр. Кафе Централ, Мол София..."
              placeholderTextColor={colors.textTertiary}
              value={formik.values.name}
              onChangeText={(text) => formik.setFieldValue('name', text)}
            />
          </View>
        </BlurView>
      </View>

      {/* Address */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Адрес *</Text>
        <BlurView
          intensity={theme === 'light' ? 20 : 40}
          style={styles.inputBlur}
        >
          <View
            style={[styles.inputContainer, { backgroundColor: colors.surface }]}
          >
            <MapPin size={20} color={colors.primary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ул. Витоша 1, София"
              placeholderTextColor={colors.textTertiary}
              value={formik.values.address}
              onChangeText={(text) => formik.setFieldValue('address', text)}
            />
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.locationButton}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.locationGradient}
              >
                <Locate size={16} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* Business Types grid */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Тип заведение *
        </Text>
        <View style={styles.businessTypeGrid}>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.businessTypeCard,
                {
                  borderColor:
                    formik.values.businessType === type.key
                      ? colors.primary
                      : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={() => formik.setFieldValue('businessType', type.key)}
            >
              <LinearGradient
                colors={
                  formik.values.businessType === type.key
                    ? type.gradient
                    : (['transparent', 'transparent'] as const)
                }
                style={styles.businessTypeGradient}
              >
                {/* icon */}
                <View
                  style={[
                    styles.businessTypeIcon,
                    {
                      backgroundColor:
                        formik.values.businessType === type.key
                          ? 'rgba(255,255,255,0.2)'
                          : colors.background,
                    },
                  ]}
                >
                  {/* @ts-ignore */}
                  {React.createElement(
                    require('lucide-react-native')[type.iconName],
                    {
                      size: 20,
                      color:
                        formik.values.businessType === type.key
                          ? '#FFFFFF'
                          : type.gradient[0],
                      strokeWidth: 2,
                    }
                  )}
                </View>
                <Text
                  style={[
                    styles.businessTypeText,
                    {
                      color:
                        formik.values.businessType === type.key
                          ? '#FFFFFF'
                          : colors.text,
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
};

export default StepBasicInfo;
