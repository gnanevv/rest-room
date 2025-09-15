import React from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Euro, Accessibility, Sparkles, CheckCircle, Crown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { availableAmenities } from '@/constants/formOptions';

const { width } = Dimensions.get('window');

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
  values: FormData;
  setFieldValue: (field: string, value: any) => void;
}

const StepDetails: React.FC<Props> = ({ values, setFieldValue }) => {
  const { colors, theme } = useTheme();

  // Animations
  const fadeAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(0);
  const amenityAnimations = availableAmenities.map(() => useSharedValue(0));

  React.useEffect(() => {
    // Entrance animations
    fadeAnimation.value = withTiming(1, { duration: 800 });
    slideAnimation.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    
    // Staggered amenity animations
    amenityAnimations.forEach((anim, index) => {
      anim.value = withDelay(
        400 + index * 80,
        withSpring(1, { damping: 15, stiffness: 100 })
      );
    });
  }, []);

  /** Toggle amenity inside formik array */
  const handleAmenityToggle = (amenity: string) => {
    const current = values.amenities;
    if (current.includes(amenity)) {
      setFieldValue(
        'amenities',
        current.filter((a) => a !== amenity)
      );
    } else {
      setFieldValue('amenities', [...current, amenity]);
    }
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
    transform: [
      { translateY: interpolate(slideAnimation.value, [0, 1], [50, 0]) }
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Enhanced Header */}
      <BlurView intensity={15} style={styles.headerBlur}>
        <View style={[styles.stepHeader, { backgroundColor: `${colors.surface}90` }]}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark, colors.secondary]}
            style={styles.stepIconContainer}
          >
            <Accessibility size={28} color="#FFFFFF" strokeWidth={2.5} />
            <View style={styles.sparkleContainer}>
              <Sparkles size={14} color="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
            </View>
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Details & Features ✨
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Make your listing more helpful
            </Text>
          </View>
        </View>
      </BlurView>

      {/* Enhanced Paid Switch */}
      <View style={styles.inputGroup}>
        <BlurView intensity={15} style={styles.switchBlur}>
          <View style={[styles.switchContainer, { backgroundColor: `${colors.surface}90` }]}>
            <View style={styles.switchLeft}>
              <LinearGradient
                colors={[colors.warning, '#F59E0B']}
                style={styles.switchIcon}
              >
                <Euro size={20} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
              <View>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  Paid Restroom?
                </Text>
                <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
                  Does this place charge a fee?
                </Text>
              </View>
            </View>
            <Switch
              value={values.isPaid}
              onValueChange={(val) => setFieldValue('isPaid', val)}
              thumbColor={values.isPaid ? '#FFFFFF' : colors.surface}
              trackColor={{ 
                false: colors.border, 
                true: colors.primary 
              }}
              style={styles.switch}
            />
          </View>
        </BlurView>
      </View>

      {/* Enhanced Price Input */}
      {values.isPaid && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Price (BGN)</Text>
          <BlurView
            intensity={theme === 'light' ? 25 : 45}
            style={styles.inputBlur}
          >
            <LinearGradient
              colors={[`${colors.surface}F0`, `${colors.background}F0`]}
              style={styles.inputGradient}
            >
              <View style={[styles.inputContainer, { backgroundColor: 'transparent' }]}>
                <LinearGradient
                  colors={[colors.warning, '#F59E0B']}
                  style={styles.inputIcon}
                >
                  <Euro size={20} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. 1.00"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={values.price}
                  onChangeText={(text) => setFieldValue('price', text)}
                />
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      )}

      {/* Enhanced Accessibility Switch */}
      <View style={styles.inputGroup}>
        <BlurView intensity={15} style={styles.switchBlur}>
          <View style={[styles.switchContainer, { backgroundColor: `${colors.surface}90` }]}>
            <View style={styles.switchLeft}>
              <LinearGradient
                colors={[colors.success, '#34D399']}
                style={styles.switchIcon}
              >
                <Accessibility size={20} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
              <View>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  Wheelchair Accessible
                </Text>
                <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
                  Accessible for people with disabilities
                </Text>
              </View>
            </View>
            <Switch
              value={values.accessibility}
              onValueChange={(val) => setFieldValue('accessibility', val)}
              thumbColor={values.accessibility ? '#FFFFFF' : colors.surface}
              trackColor={{ 
                false: colors.border, 
                true: colors.success 
              }}
              style={styles.switch}
            />
          </View>
        </BlurView>
      </View>

      {/* Enhanced Description */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <BlurView
          intensity={theme === 'light' ? 25 : 45}
          style={styles.textAreaBlur}
        >
          <LinearGradient
            colors={[`${colors.surface}F0`, `${colors.background}F0`]}
            style={styles.textAreaGradient}
          >
            <View style={[styles.textAreaContainer, { backgroundColor: 'transparent' }]}>
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                placeholder="Add a brief description of this place..."
                placeholderTextColor={colors.textTertiary}
                multiline
                maxLength={300}
                value={values.description}
                onChangeText={(text) => setFieldValue('description', text)}
              />
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Enhanced Amenities */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Amenities & Features</Text>
        <View style={styles.amenityGrid}>
          {availableAmenities.map((item, index) => {
            const selected = values.amenities.includes(item.name);
            const amenityAnimation = amenityAnimations[index];
            
            const amenityAnimatedStyle = useAnimatedStyle(() => ({
              opacity: amenityAnimation.value,
              transform: [
                { translateY: interpolate(amenityAnimation.value, [0, 1], [20, 0]) },
                { scale: interpolate(amenityAnimation.value, [0, 1], [0.9, 1]) }
              ],
            }));

            return (
              <Animated.View key={item.name} style={amenityAnimatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.amenityChip,
                    {
                      borderColor: selected ? item.color : colors.border,
                      shadowColor: selected ? item.color : '#000',
                      shadowOpacity: selected ? 0.3 : 0.1,
                      shadowRadius: selected ? 8 : 2,
                      elevation: selected ? 8 : 2,
                    },
                  ]}
                  onPress={() => handleAmenityToggle(item.name)}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={selected ? 25 : 15}
                    style={styles.amenityBlur}
                  >
                    <LinearGradient
                      colors={
                        selected
                          ? [item.color, `${item.color}CC`]
                          : [`${colors.surface}F0`, `${colors.background}F0`]
                      }
                      style={styles.amenityGradient}
                    >
                      {selected && (
                        <View style={styles.selectedBadge}>
                          <CheckCircle size={14} color="#FFFFFF" strokeWidth={2} />
                        </View>
                      )}
                      
                      <View
                        style={[
                          styles.amenityIcon,
                          {
                            backgroundColor: selected
                              ? 'rgba(255, 255, 255, 0.2)'
                              : `${item.color}20`,
                          },
                        ]}
                      >
                        {React.createElement(
                          require('lucide-react-native')[item.iconName],
                          {
                            size: 20,
                            color: selected ? '#FFFFFF' : item.color,
                            strokeWidth: 2,
                          }
                        )}
                      </View>
                      
                      <Text
                        style={[
                          styles.amenityText,
                          {
                            color: selected ? '#FFFFFF' : colors.text,
                            fontFamily: selected ? 'Inter-SemiBold' : 'Inter-Medium',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
    lineHeight: 30,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  switchBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  switchSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  inputBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  inputGradient: {
    borderRadius: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  textAreaBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  textAreaGradient: {
    borderRadius: 20,
  },
  textAreaContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    flex: 1,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityChip: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  amenityBlur: {
    flex: 1,
    borderRadius: 14,
  },
  amenityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
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
