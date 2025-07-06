import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star, Clock, Euro, Accessibility, Camera, Users } from 'lucide-react-native';
import { Restroom } from '@/types/restroom';

interface RestroomCardProps {
  restroom: Restroom;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function RestroomCard({ restroom, onPress, onFavorite, isFavorite }: RestroomCardProps) {
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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{restroom.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#6B7280" strokeWidth={2} />
              <Text style={styles.address}>{restroom.address}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor() }]}>
              <Text style={styles.availabilityText}>{getAvailabilityText()}</Text>
            </View>
            {restroom.distance && (
              <Text style={styles.distance}>{restroom.distance.toFixed(1)} км</Text>
            )}
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
            <Text style={styles.rating}>{restroom.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({restroom.reviews.length})</Text>
          </View>
          
          <View style={styles.businessType}>
            <Text style={styles.businessTypeText}>{getBusinessTypeText()}</Text>
          </View>
        </View>

        <View style={styles.amenitiesRow}>
          {restroom.accessibility && (
            <View style={styles.amenityBadge}>
              <Accessibility size={14} color="#10B981" strokeWidth={2} />
            </View>
          )}
          {restroom.isPaid && (
            <View style={styles.amenityBadge}>
              <Euro size={14} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.priceText}>
                {typeof restroom.price === 'number' ? restroom.price.toFixed(2) : '0.00'} лв
              </Text>
            </View>
          )}
          {restroom.photos.length > 0 && (
            <View style={styles.amenityBadge}>
              <Camera size={14} color="#6B7280" strokeWidth={2} />
              <Text style={styles.photoCount}>{restroom.photos.length}</Text>
            </View>
          )}
          <View style={styles.amenityBadge}>
            <Users size={14} color="#6B7280" strokeWidth={2} />
            <Text style={styles.checkInCount}>{restroom.checkInCount}</Text>
          </View>
        </View>

        <View style={styles.cleanlinessRow}>
          <Text style={styles.cleanlinessLabel}>Чистота:</Text>
          <View style={styles.cleanlinessStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                color={star <= restroom.cleanliness ? '#10B981' : '#E5E7EB'}
                fill={star <= restroom.cleanliness ? '#10B981' : '#E5E7EB'}
                strokeWidth={2}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.lastUpdated}>
            <Clock size={12} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.lastUpdatedText}>
              Обновено: {new Date(restroom.lastUpdated).toLocaleDateString('bg-BG')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#1F2937',
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
    color: '#6B7280',
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
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  businessType: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  businessTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
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
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  priceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
  },
  photoCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  checkInCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
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
    color: '#4B5563',
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
    color: '#9CA3AF',
  },
});