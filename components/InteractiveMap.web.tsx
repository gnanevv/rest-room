import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MapPin, Star, Navigation, ZoomIn, ZoomOut, Locate, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Accessibility } from 'lucide-react-native';
import { Restroom } from '@/types/restroom';

interface InteractiveMapProps {
  restrooms: Restroom[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');

export function InteractiveMap({ restrooms, userLocation }: InteractiveMapProps) {
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);

  const handleMarkerPress = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
  };

  const closePopup = () => {
    setSelectedRestroom(null);
  };

  const getMarkerColor = (restroom: Restroom) => {
    if (restroom.availability === 'out_of_order') return '#EF4444';
    if (restroom.availability === 'occupied') return '#F59E0B';
    if (restroom.rating >= 4.5) return '#10B981';
    if (restroom.rating >= 4.0) return '#3B82F6';
    return '#6B7280';
  };

  return (
    <View style={styles.container}>
      {/* Web Fallback Map */}
      <View style={styles.webMapContainer}>
        <View style={styles.webMapHeader}>
          <AlertTriangle size={24} color="#F59E0B" />
          <Text style={styles.webMapTitle}>Web Map View</Text>
        </View>
        <Text style={styles.webMapSubtitle}>
          Interactive map requires native platform. Showing restroom list instead.
        </Text>
        
        {userLocation && (
          <View style={styles.locationInfo}>
            <Locate size={16} color="#3B82F6" />
            <Text style={styles.locationText}>
              Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        <View style={styles.restroomsList}>
          {restrooms.map((restroom) => (
            <TouchableOpacity
              key={restroom.id}
              style={styles.restroomItem}
              onPress={() => handleMarkerPress(restroom)}
            >
              <View style={[styles.restroomMarker, { backgroundColor: getMarkerColor(restroom) }]}>
                <MapPin size={16} color="white" />
              </View>
              <View style={styles.restroomInfo}>
                <Text style={styles.restroomName}>{restroom.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{restroom.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({restroom.reviews.length} reviews)</Text>
                </View>
                <Text style={styles.coordinates}>
                  {restroom.coordinates.latitude.toFixed(4)}, {restroom.coordinates.longitude.toFixed(4)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedRestroom && (
        <View style={styles.popupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
            <X size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.popupContent}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }}
              style={styles.popupImage}
            />
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>{selectedRestroom.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{selectedRestroom.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({selectedRestroom.reviews.length} reviews)</Text>
              </View>
              <Text style={styles.distanceText}>
                Coordinates: {selectedRestroom.coordinates.latitude.toFixed(4)}, {selectedRestroom.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
          <View style={styles.popupTagsContainer}>
            {!selectedRestroom.isPaid && (
              <View style={styles.tag}>
                <CheckCircle size={14} color="#10B981" />
                <Text style={styles.tagText}>Free</Text>
              </View>
            )}
            {selectedRestroom.accessibility && (
              <View style={styles.tag}>
                <Accessibility size={14} color="#3B82F6" />
                <Text style={styles.tagText}>Accessible</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  webMapContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  webMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  webMapTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  webMapSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
  },
  restroomsList: {
    gap: 12,
  },
  restroomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restroomMarker: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  restroomInfo: {
    flex: 1,
    gap: 4,
  },
  restroomName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  coordinates: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  popupContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  popupContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popupImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  popupTextContainer: {
    flex: 1,
    gap: 6,
  },
  popupTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  popupTagsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
});