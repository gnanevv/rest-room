import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MapPin, Star, Clock, Euro, Accessibility, Camera, Users, Sparkles, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Circle as XCircle } from 'lucide-react-native';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';

interface RestroomCardProps {
  restroom: Restroom;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function RestroomCard({ restroom, onPress, onFavorite, isFavorite }: RestroomCardProps) {
  const { colors } = useTheme();
  const scaleAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  const handlePressIn = () => {
    scaleAnimation.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    glowAnimation.value = withTiming(1, { duration: 200 });
  };

  const handlePressOut = () => {
    scaleAnimation.value = withSpring(1, { damping: 15, stiffness: 300 });
    glowAnimation.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.1 + glowAnimation.value * 0.2,
    elevation: 4 + glowAnimation.value * 8,
  }));

  const getAvailabilityColor = () => {
    switch (restroom.availability) {
      case 'available': return colors.success;
      case 'occupied': return colors.warning;
      case 'out_of_order': return colors.error;
      default: return colors.secondary;
    }
  };

  const getAvailabilityText = () => {
    switch (restroom.availability) {
      case 'available': return 'Свободно';
      case 'occupied': return 'Заето';
      case 'out_of_order': return 'Неработещо';
      default: return 'Неизвестно';
    }
  };

  const getAvailabilityIcon = () => {
    switch (restroom.availability) {
      case 'available': return CheckCircle;
      case 'occupied': return AlertTriangle;
      case 'out_of_order': return XCircle;
      default: return CheckCircle;
    }
  };

  const getBusinessTypeText = () => {
    switch (restroom.businessType) {
      case 'restaurant': return 'Ресторант';
      case 'cafe': return 'Кафе';
      case 'bar': return 'Бар';
      case 'public': return 'Обществено';
      case 'gas_station': return 'Бензиностанция';
      case 'mall': return 'Мол';
      default: return 'Други';
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, glowStyle]}>
      <TouchableOpacity 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        <BlurView intensity={10} style={styles.cardBlur}>
          <LinearGradient
            colors={[`${colors.surface}F0`, `${colors.background}F0`]}
            style={styles.cardGradient}
          >
            <View style={[styles.cardContent, { backgroundColor: `${colors.surface}95` }]}>
              {/* Premium Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.name, { color: colors.text }]}>{restroom.name}</Text>
                    {restroom.rating >= 4.5 && (
                      <LinearGradient
                        colors={[colors.warning, '#F59E0B']}
                        style={styles.premiumBadge}
                      >
                        <Sparkles size={12} color="#FFFFFF" strokeWidth={2} />
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.locationRow}>
                    <MapPin size={16} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.address, { color: colors.textSecondary }]}>{restroom.address}</Text>
                  </View>
                </View>
                <View style={styles.headerRight}>
                  <BlurView intensity={15} style={styles.availabilityBadgeBlur}>
                    <LinearGradient
                      colors={[getAvailabilityColor(), `${getAvailabilityColor()}CC`]}
                      style={styles.availabilityBadge}
                    >
                      {React.createElement(getAvailabilityIcon(), {
                        size: 14,
                        color: '#FFFFFF',
                        strokeWidth: 2,
                      })}
                      <Text style={styles.availabilityText}>{getAvailabilityText()}</Text>
                    </LinearGradient>
                  </BlurView>
                  {restroom.distance && (
                    <Text style={[styles.distance, { color: colors.textSecondary }]}>
                      {restroom.distance.toFixed(1)} km
                    </Text>
                  )}
                </View>
              </View>

              {/* Enhanced Meta Row */}
              <View style={styles.metaRow}>
                <BlurView intensity={10} style={styles.ratingContainer}>
                  <LinearGradient
                    colors={[`${colors.warning}20`, `${colors.warning}10`]}
                    style={styles.ratingContent}
                  >
                    <Star size={18} color={colors.warning} fill={colors.warning} strokeWidth={2} />
                    <Text style={[styles.rating, { color: colors.text }]}>{restroom.rating.toFixed(1)}</Text>
                    <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>({restroom.reviews.length})</Text>
                  </LinearGradient>
                </BlurView>
                
                <BlurView intensity={10} style={styles.businessTypeContainer}>
                  <View style={[styles.businessType, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.businessTypeText, { color: colors.primary }]}>{getBusinessTypeText()}</Text>
                  </View>
                </BlurView>
              </View>

              {/* Enhanced Amenities */}
              <View style={styles.amenitiesRow}>
                {restroom.accessibility && (
                  <BlurView intensity={8} style={styles.amenityBadge}>
                    <View style={[styles.amenityContent, { backgroundColor: `${colors.success}15` }]}>
                      <Accessibility size={16} color={colors.success} strokeWidth={2} />
                      <Text style={[styles.amenityText, { color: colors.success }]}>Accessible</Text>
                    </View>
                  </BlurView>
                )}
                {restroom.isPaid && (
                  <BlurView intensity={8} style={styles.amenityBadge}>
                    <View style={[styles.amenityContent, { backgroundColor: `${colors.warning}15` }]}>
                      <Euro size={16} color={colors.warning} strokeWidth={2} />
                      <Text style={[styles.amenityText, { color: colors.warning }]}>
                        {typeof restroom.price === 'number' ? restroom.price.toFixed(2) : '0.00'} лв
                      </Text>
                    </View>
                  </BlurView>
                )}
                {restroom.photos.length > 0 && (
                  <BlurView intensity={8} style={styles.amenityBadge}>
                    <View style={[styles.amenityContent, { backgroundColor: `${colors.info}15` }]}>
                      <Camera size={16} color={colors.info} strokeWidth={2} />
                      <Text style={[styles.amenityText, { color: colors.info }]}>{restroom.photos.length}</Text>
                    </View>
                  </BlurView>
                )}
                <BlurView intensity={8} style={styles.amenityBadge}>
                  <View style={[styles.amenityContent, { backgroundColor: `${colors.textSecondary}15` }]}>
                    <Users size={16} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{restroom.checkInCount}</Text>
                  </View>
                </BlurView>
              </View>

              {/* Enhanced Cleanliness */}
              <View style={styles.cleanlinessRow}>
                <Text style={[styles.cleanlinessLabel, { color: colors.textSecondary }]}>Cleanliness:</Text>
                <View style={styles.cleanlinessStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color={star <= restroom.cleanliness ? colors.success : colors.border}
                      fill={star <= restroom.cleanliness ? colors.success : 'transparent'}
                      strokeWidth={2}
                    />
                  ))}
                </View>
                <Text style={[styles.cleanlinessScore, { color: colors.success }]}>
                  {restroom.cleanliness}/5
                </Text>
              </View>

              {/* Enhanced Footer */}
              <View style={styles.footer}>
                <View style={styles.lastUpdated}>
                  <Clock size={12} color={colors.textTertiary} strokeWidth={2} />
                  <Text style={[styles.lastUpdatedText, { color: colors.textTertiary }]}>
                    Updated: {new Date(restroom.lastUpdated).toLocaleDateString('en-US')}
                  </Text>
                </View>
                
                {restroom.rating >= 4.5 && (
                  <BlurView intensity={10} style={styles.premiumIndicator}>
                    <LinearGradient
                      colors={[colors.warning, '#F59E0B']}
                      style={styles.premiumIndicatorGradient}
                    >
                      <Sparkles size={12} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.premiumText}>Premium</Text>
                    </LinearGradient>
                  </BlurView>
                )}
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  touchable: {
    borderRadius: 20,
  },
  cardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 19,
    fontFamily: 'Inter-Bold',
    lineHeight: 24,
    flex: 1,
  },
  premiumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  availabilityBadgeBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  availabilityText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  distance: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  ratingContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  rating: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  reviewCount: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  businessTypeContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  businessType: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  businessTypeText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  amenityBadge: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  amenityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  amenityText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  cleanlinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cleanlinessLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  cleanlinessStars: {
    flexDirection: 'row',
    gap: 3,
  },
  cleanlinessScore: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastUpdatedText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  premiumIndicator: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumIndicatorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});