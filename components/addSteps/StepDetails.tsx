import React from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FormikProps } from 'formik';
import { LinearGradient } from 'expo-linear-gradient';
import { Euro, Accessibility } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { availableAmenities } from '@/constants/formOptions';
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
}

const StepDetails: React.FC<Props> = ({ formik }) => {
  const { colors, theme } = useTheme();

  /** Toggle amenity inside formik array */
  const handleAmenityToggle = (amenity: string) => {
    const current = formik.values.amenities;
    if (current.includes(amenity)) {
      formik.setFieldValue(
        'amenities',
        current.filter((a) => a !== amenity)
      );
    } else {
      formik.setFieldValue('amenities', [...current, amenity]);
    }
  };

  return (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.stepIconContainer}
        >
          <Accessibility size={24} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Допълнителни детайли
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Направете описанието по-полезно
        </Text>
      </View>

      {/* Paid switch */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Платена тоалетна?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: colors.textSecondary }}>Да / Не</Text>
          <Switch
            value={formik.values.isPaid}
            onValueChange={(val) => {
              formik.setFieldValue('isPaid', val);
            }}
            thumbColor={formik.values.isPaid ? colors.primary : colors.surface}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* Price */}
      {formik.values.isPaid && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Цена (лв)</Text>
          <BlurView
            intensity={theme === 'light' ? 20 : 40}
            style={styles.inputBlur}
          >
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Euro size={20} color={colors.primary} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="напр. 1.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={formik.values.price}
                onChangeText={(text) => formik.setFieldValue('price', text)}
              />
            </View>
          </BlurView>
        </View>
      )}

      {/* Accessibility switch */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Достъпна за хора с увреждания
        </Text>
        <Switch
          value={formik.values.accessibility}
          onValueChange={(val) => {
            formik.setFieldValue('accessibility', val);
          }}
          thumbColor={
            formik.values.accessibility ? colors.primary : colors.surface
          }
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Описание</Text>
        <BlurView
          intensity={theme === 'light' ? 20 : 40}
          style={styles.inputBlur}
        >
          <View
            style={[
              styles.textAreaContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Добавете кратко описание..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={300}
              value={formik.values.description}
              onChangeText={(text) => formik.setFieldValue('description', text)}
            />
          </View>
        </BlurView>
      </View>

      {/* Amenities */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Удобства</Text>
        <View style={styles.amenityGrid}>
          {availableAmenities.map((item) => {
            const selected = formik.values.amenities.includes(item.name);
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.amenityChip,
                  { borderColor: selected ? colors.primary : colors.border },
                ]}
                onPress={() => handleAmenityToggle(item.name)}
              >
                {/* @ts-ignore */}
                {React.createElement(
                  require('lucide-react-native')[item.iconName],
                  {
                    size: 16,
                    color: selected ? colors.primary : item.color,
                    strokeWidth: 2,
                  }
                )}
                <Text
                  style={[
                    styles.amenityText,
                    { color: selected ? colors.primary : colors.text },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default StepDetails;
