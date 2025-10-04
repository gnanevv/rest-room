import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, Building, Coffee, Utensils, Users, Fuel, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { businessTypes } from '@/constants/formOptions';
import styles from './styles';

interface StepBasicInfoProps {
  data: {
    name: string;
    address: string;
    businessType: string;
  };
  onUpdate: (data: any) => void;
}

export default function StepBasicInfo({ data, onUpdate }: StepBasicInfoProps) {
  const { colors } = useTheme();

  const handleInputChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleBusinessTypeSelect = (type: string) => {
    onUpdate({ ...data, businessType: type });
  };

  const getBusinessTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building': return Building;
      case 'Coffee': return Coffee;
      case 'Utensils': return Utensils;
      case 'Users': return Users;
      case 'Fuel': return Fuel;
      case 'ShoppingBag': return ShoppingBag;
      default: return Building;
    }
  };

  return (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepIconContainer, { backgroundColor: colors.primary }]}>
          <MapPin size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Basic Information
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Tell us about this restroom location
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
        <BlurView intensity={10} style={styles.inputBlur}>
          <View style={[styles.inputContainer, { backgroundColor: `${colors.surface}90` }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter location name"
              placeholderTextColor={colors.textTertiary}
              value={data.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>
        </BlurView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Address *</Text>
        <BlurView intensity={10} style={styles.inputBlur}>
          <View style={[styles.inputContainer, { backgroundColor: `${colors.surface}90` }]}>
            <MapPin size={20} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter full address"
              placeholderTextColor={colors.textTertiary}
              value={data.address}
              onChangeText={(value) => handleInputChange('address', value)}
            />
          </View>
        </BlurView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Business Type *</Text>
        <View style={styles.businessTypeGrid}>
          {businessTypes.map((type) => {
            const IconComponent = getBusinessTypeIcon(type.iconName);
            const isSelected = data.businessType === type.key;
            
            return (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.businessTypeCard,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleBusinessTypeSelect(type.key)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isSelected ? type.gradient : [`${colors.surface}90`, `${colors.background}90`]}
                  style={styles.businessTypeGradient}
                >
                  <View style={[styles.businessTypeIcon, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.surface }]}>
                    <IconComponent
                      size={20}
                      color={isSelected ? '#FFFFFF' : colors.primary}
                      strokeWidth={2}
                    />
                  </View>
                  <Text
                    style={[
                      styles.businessTypeText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {type.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}