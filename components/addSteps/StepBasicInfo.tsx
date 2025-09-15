import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Building, MapPin, Locate, Sparkles, Crown, Zap } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { businessTypes } from '@/constants/formOptions';

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
  location: any;
}

const StepBasicInfo: React.FC<Props> = ({ values, setFieldValue, location }) => {
  const { colors, theme } = useTheme();

  // Animations
  const fadeAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(0);
  const cardAnimations = businessTypes.map(() => useSharedValue(0));

  React.useEffect(() => {
    // Entrance animations
    fadeAnimation.value = withTiming(1, { duration: 800 });
    slideAnimation.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    
    // Staggered card animations
    cardAnimations.forEach((anim, index) => {
      anim.value = withDelay(
        300 + index * 100,
        withSpring(1, { damping: 15, stiffness: 100 })
      );
    });
  }, []);

  const getCurrentLocation = async () => {
    // Location logic here
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
            colors={['#10B981', '#34D399', '#6EE7B7']}
            style={styles.stepIconContainer}
          >
            <Building size={28} color="#FFFFFF" strokeWidth={2.5} />
            <View style={styles.sparkleContainer}>
              <Sparkles size={14} color="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
            </View>
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Basic Information ✨
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Tell us about this amazing place
            </Text>
          </View>
        </View>
      </BlurView>

      {/* Enhanced Name Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Place Name *
        </Text>
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
                colors={[colors.primary, colors.primaryDark]}
                style={styles.inputIcon}
              >
                <Building size={20} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Central Cafe, Sofia Mall..."
                placeholderTextColor={colors.textTertiary}
                value={values.name}
                onChangeText={(text) => setFieldValue('name', text)}
              />
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Enhanced Address Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Address *</Text>
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
                colors={[colors.secondary, `${colors.secondary}CC`]}
                style={styles.inputIcon}
              >
                <MapPin size={20} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="123 Vitosha Blvd, Sofia"
                placeholderTextColor={colors.textTertiary}
                value={values.address}
                onChangeText={(text) => setFieldValue('address', text)}
              />
              <TouchableOpacity
                onPress={getCurrentLocation}
                style={styles.locationButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.warning, '#F59E0B']}
                  style={styles.locationGradient}
                >
                  <Locate size={18} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Enhanced Business Types Grid */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Business Type *
        </Text>
        <View style={styles.businessTypeGrid}>
          {businessTypes.map((type, index) => {
            const isSelected = values.businessType === type.key;
            const cardAnimation = cardAnimations[index];
            
            const cardAnimatedStyle = useAnimatedStyle(() => ({
              opacity: cardAnimation.value,
              transform: [
                { translateY: interpolate(cardAnimation.value, [0, 1], [30, 0]) },
                { scale: interpolate(cardAnimation.value, [0, 1], [0.9, 1]) }
              ],
            }));

            return (
              <Animated.View key={type.key} style={[styles.businessTypeWrapper, cardAnimatedStyle]}>
                <TouchableOpacity
                  style={[
                    styles.businessTypeCard,
                    {
                      borderColor: isSelected ? type.gradient[0] : colors.border,
                      shadowColor: isSelected ? type.gradient[0] : '#000',
                      shadowOpacity: isSelected ? 0.3 : 0.1,
                      shadowRadius: isSelected ? 12 : 4,
                      elevation: isSelected ? 12 : 4,
                    },
                  ]}
                  onPress={() => setFieldValue('businessType', type.key)}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={isSelected ? 30 : 15}
                    style={styles.businessTypeBlur}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? [...type.gradient, `${type.gradient[1]}CC`]
                          : [`${colors.surface}F0`, `${colors.background}F0`]
                      }
                      style={styles.businessTypeGradient}
                    >
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Crown size={16} color="#FFFFFF" strokeWidth={2} />
                        </View>
                      )}
                      
                      <View
                        style={[
                          styles.businessTypeIcon,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.25)'
                              : `${type.gradient[0]}20`,
                          },
                        ]}
                      >
                        {React.createElement(
                          require('lucide-react-native')[type.iconName],
                          {
                            size: 24,
                            color: isSelected ? '#FFFFFF' : type.gradient[0],
                            strokeWidth: 2.5,
                          }
                        )}
                      </View>
                      
                      <Text
                        style={[
                          styles.businessTypeText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontFamily: isSelected ? 'Inter-Bold' : 'Inter-SemiBold',
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                      
                      {isSelected && (
                        <View style={styles.glowEffect}>
                          <Sparkles size={12} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                        </View>
                      )}
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
  locationButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  locationGradient: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  businessTypeWrapper: {
    width: (width - 80) / 2,
  },
  businessTypeCard: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  businessTypeBlur: {
    flex: 1,
    borderRadius: 18,
  },
  businessTypeGradient: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 18,
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  businessTypeText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  glowEffect: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
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
