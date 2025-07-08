import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, Star, Clock, Euro, Accessibility, Camera, Users, Navigation, Heart } from 'lucide-react-native';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/contexts/ThemeContext';

interface RestroomCardProps {
  restroom: Restroom;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function RestroomCard({ restroom, onPress, onFavorite, isFavorite }: RestroomCardProps) {
  const { colors, isDarkMode } = useTheme();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };
  const getAvailabilityColor = () => {
    switch (restroom.availability) {
      case 'available': return '#10B981';
      case 'occupied': return '#F59E0B';
      case 'out_of_order': return '#EF4444';
      default: return '#9CA3AF';
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
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        <BlurView intensity={isDarkMode ? 20 : 10} tint={isDarkMode ? 'dark' : 'light'} style={styles.blur}>
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)']
              : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.9)']
            }
            style={[styles.gradient, { borderColor: colors.border }]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.name, { color: colors.text }]}>{restroom.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.address, { color: colors.textSecondary }]}>{restroom.address}</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor() }]}>
                  <Text style={styles.availabilityText}>{getAvailabilityText()}</Text>
                </View>
                {restroom.distance && (
                  <Text style={[styles.distance, { color: colors.textTertiary }]}>{restroom.distance.toFixed(1)} км</Text>
                )}
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                <Text style={[styles.rating, { color: colors.text }]}>{restroom.rating.toFixed(1)}</Text>
                <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>({restroom.reviews.length})</Text>
              </View>
              
              <View style={[styles.businessType, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#EBF8FF' }]}>
                <Text style={[styles.businessTypeText, { color: colors.primary }]}>{getBusinessTypeText()}</Text>
              </View>
            </View>

            <View style={styles.amenitiesRow}>
              {restroom.accessibility && (
                <View style={[styles.amenityBadge, { backgroundColor: colors.surfaceVariant }]}>
                  <Accessibility size={14} color="#10B981" strokeWidth={2} />
                </View>
              )}
              {restroom.isPaid && (
                <View style={[styles.amenityBadge, { backgroundColor: colors.surfaceVariant }]}>
                  <Euro size={14} color="#F59E0B" strokeWidth={2} />
                  <Text style={[styles.priceText, { color: colors.textSecondary }]}>
                    {typeof restroom.price === 'number' ? restroom.price.toFixed(2) : '0.00'} лв
                  </Text>
                </View>
              )}
              {restroom.photos.length > 0 && (
                <View style={[styles.amenityBadge, { backgroundColor: colors.surfaceVariant }]}>
                  <Camera size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.photoCount, { color: colors.textSecondary }]}>{restroom.photos.length}</Text>
                </View>
              )}
              <View style={[styles.amenityBadge, { backgroundColor: colors.surfaceVariant }]}>
                <Users size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.checkInCount, { color: colors.textSecondary }]}>{restroom.checkInCount}</Text>
              </View>
            </View>

            <View style={styles.cleanlinessRow}>
              <Text style={[styles.cleanlinessLabel, { color: colors.textSecondary }]}>Чистота:</Text>
              <View style={styles.cleanlinessStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    color={star <= restroom.cleanliness ? '#10B981' : colors.border}
                    fill={star <= restroom.cleanliness ? '#10B981' : colors.border}
                    strokeWidth={2}
                  />
                ))}
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.lastUpdated}>
                <Clock size={12} color={colors.textTertiary} strokeWidth={2} />
                <Text style={[styles.lastUpdatedText, { color: colors.textTertiary }]}>
                  Обновено: {new Date(restroom.lastUpdated).toLocaleDateString('bg-BG')}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                  <Navigation size={14} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isFavorite ? colors.error : colors.surfaceVariant }]}
                  onPress={onFavorite}
                >
                  <Heart 
                    size={14} 
                    color={isFavorite ? "#FFFFFF" : colors.textSecondary} 
                    fill={isFavorite ? "#FFFFFF" : "none"}
                    strokeWidth={2} 
                  />
                </TouchableOpacity>
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
    marginVertical: 8,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: 16,
  },
  gradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  distance: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  businessType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  businessTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  priceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  photoCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  checkInCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  cleanlinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cleanlinessLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  cleanlinessStars: {
    flexDirection: 'row',
    gap: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});