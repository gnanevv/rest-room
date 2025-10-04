import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Settings, Euro, Accessibility, Droplets, Shield, Wind, Eye, Baby, Music, Wifi, Car } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { availableAmenities } from '@/constants/formOptions';
import styles from './styles';

interface StepDetailsProps {
  data: {
    description: string;
    isPaid: boolean;
    price: string;
    accessibility: boolean;
    amenities: string[];
  };
  onUpdate: (data: any) => void;
}

export default function StepDetails({ data, onUpdate }: StepDetailsProps) {
  const { colors } = useTheme();

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const updatedAmenities = data.amenities.includes(amenity)
      ? data.amenities.filter(a => a !== amenity)
      : [...data.amenities, amenity];
    
    onUpdate({ ...data, amenities: updatedAmenities });
  };

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return Droplets;
      case 'Shield': return Shield;
      case 'Wind': return Wind;
      case 'Eye': return Eye;
      case 'Baby': return Baby;
      case 'Music': return Music;
      case 'Wifi': return Wifi;
      case 'Car': return Car;
      default: return Droplets;
    }
  };

  return (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepIconContainer, { backgroundColor: colors.secondary }]}>
          <Settings size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Details & Features
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Add more information about this location
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <BlurView intensity={10} style={styles.inputBlur}>
          <View style={[styles.textAreaContainer, { backgroundColor: `${colors.surface}90` }]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Describe this restroom (cleanliness, facilities, etc.)"
              placeholderTextColor={colors.textTertiary}
              value={data.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>
        </BlurView>
      </View>

      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={[styles.label, { color: colors.text }]}>Paid Access</Text>
            <Text style={[{ fontSize: 14, color: colors.textSecondary }]}>
              Does this restroom require payment?
            </Text>
          </View>
          <Switch
            value={data.isPaid}
            onValueChange={(value) => handleInputChange('isPaid', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={data.isPaid ? '#FFFFFF' : colors.textSecondary}
          />
        </View>

        {data.isPaid && (
          <BlurView intensity={10} style={styles.inputBlur}>
            <View style={[styles.inputContainer, { backgroundColor: `${colors.surface}90` }]}>
              <Euro size={20} color={colors.warning} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Price (e.g., 1.50)"
                placeholderTextColor={colors.textTertiary}
                value={data.price}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </BlurView>
        )}
      </View>

      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[styles.label, { color: colors.text }]}>Wheelchair Accessible</Text>
            <Text style={[{ fontSize: 14, color: colors.textSecondary }]}>
              Is this restroom accessible for people with disabilities?
            </Text>
          </View>
          <Switch
            value={data.accessibility}
            onValueChange={(value) => handleInputChange('accessibility', value)}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={data.accessibility ? '#FFFFFF' : colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Amenities</Text>
        <View style={styles.amenityGrid}>
          {availableAmenities.map((amenity) => {
            const IconComponent = getAmenityIcon(amenity.iconName);
            const isSelected = data.amenities.includes(amenity.name);
            
            return (
              <TouchableOpacity
                key={amenity.name}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleAmenity(amenity.name)}
                activeOpacity={0.8}
              >
                <IconComponent
                  size={16}
                  color={isSelected ? '#FFFFFF' : amenity.color}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.amenityText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {amenity.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}