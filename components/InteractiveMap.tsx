import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MapPin, 
  Star, 
  Euro, 
  Accessibility, 
  Navigation, 
  ZoomIn, 
  ZoomOut,
  Locate,
  X
} from 'lucide-react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Restroom } from '@/types/restroom';

interface InteractiveMapProps {
  restrooms: Restroom[];
  onRestroomPress: (restroom: Restroom) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');
const MAP_WIDTH = width;
const MAP_HEIGHT = height - 200;

// Sofia bounds for our map
const SOFIA_BOUNDS = {
  north: 42.7500,
  south: 42.6500,
  east: 23.4000,
  west: 23.2500,
};

export function InteractiveMap({ restrooms, onRestroomPress, userLocation }: InteractiveMapProps) {
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const popupAnimation = useRef(new Animated.Value(0)).current;

  // Convert lat/lng to screen coordinates
  const coordsToScreen = (lat: number, lng: number) => {
    const x = ((lng - SOFIA_BOUNDS.west) / (SOFIA_BOUNDS.east - SOFIA_BOUNDS.west)) * MAP_WIDTH;
    const y = ((SOFIA_BOUNDS.north - lat) / (SOFIA_BOUNDS.north - SOFIA_BOUNDS.south)) * MAP_HEIGHT;
    return { x, y };
  };

  const getMarkerColor = (restroom: Restroom) => {
    if (restroom.availability === 'out_of_order') return '#EF4444';
    if (restroom.availability === 'occupied') return '#F59E0B';
    if (restroom.rating >= 4.5) return '#10B981';
    if (restroom.rating >= 4.0) return '#3B82F6';
    return '#6B7280';
  };

  const getMarkerSize = (restroom: Restroom) => {
    if (restroom.rating >= 4.5) return 24;
    if (restroom.rating >= 4.0) return 20;
    return 16;
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  const handleMarkerPress = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
    Animated.spring(popupAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closePopup = () => {
    Animated.spring(popupAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setSelectedRestroom(null);
    });
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.5, 3);
    setZoomLevel(newZoom);
    Animated.spring(scale, {
      toValue: newZoom,
      useNativeDriver: true,
    }).start();
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.5, 0.5);
    setZoomLevel(newZoom);
    Animated.spring(scale, {
      toValue: newZoom,
      useNativeDriver: true,
    }).start();
  };

  const centerOnUser = () => {
    if (userLocation) {
      const screenCoords = coordsToScreen(userLocation.latitude, userLocation.longitude);
      Animated.spring(pan, {
        toValue: {
          x: MAP_WIDTH / 2 - screenCoords.x,
          y: MAP_HEIGHT / 2 - screenCoords.y,
        },
        useNativeDriver: false,
      }).start();
    }
  };

  const openInMaps = (restroom: Restroom) => {
    const { latitude, longitude } = restroom.coordinates;
    
    if (Platform.OS === 'ios') {
      const url = `maps://app?daddr=${latitude},${longitude}`;
      console.log('Opening iOS Maps:', url);
    } else if (Platform.OS === 'android') {
      const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${restroom.name})`;
      console.log('Opening Android Maps:', url);
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  };

  const CustomMarker = ({ restroom }: { restroom: Restroom }) => {
    const screenCoords = coordsToScreen(restroom.coordinates.latitude, restroom.coordinates.longitude);
    const markerColor = getMarkerColor(restroom);
    const markerSize = getMarkerSize(restroom);

    return (
      <TouchableOpacity
        style={[
          styles.marker,
          {
            left: screenCoords.x - markerSize / 2,
            top: screenCoords.y - markerSize,
          },
        ]}
        onPress={() => handleMarkerPress(restroom)}
        activeOpacity={0.8}
      >
        <Svg width={markerSize} height={markerSize} viewBox="0 0 24 24">
          <Defs>
            <RadialGradient id="markerGradient" cx="50%" cy="30%" r="70%">
              <Stop offset="0%" stopColor={markerColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={markerColor} stopOpacity="0.8" />
            </RadialGradient>
          </Defs>
          <Circle
            cx="12"
            cy="12"
            r="10"
            fill="url(#markerGradient)"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="#FFFFFF"
            scale="0.6"
            translateX="4.8"
            translateY="4.8"
          />
        </Svg>
        
        {/* Pulse animation for high-rated restrooms */}
        {restroom.rating >= 4.5 && (
          <View style={[styles.pulse, { backgroundColor: markerColor }]} />
        )}
      </TouchableOpacity>
    );
  };

  const UserLocationMarker = () => {
    if (!userLocation) return null;
    
    const screenCoords = coordsToScreen(userLocation.latitude, userLocation.longitude);
    
    return (
      <View
        style={[
          styles.userMarker,
          {
            left: screenCoords.x - 12,
            top: screenCoords.y - 12,
          },
        ]}
      >
        <LinearGradient
          colors={['#3B82F6', '#1E40AF']}
          style={styles.userMarkerGradient}
        >
          <View style={styles.userMarkerInner} />
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <LinearGradient
        colors={['#E0F2FE', '#F0F9FF', '#FAFAFA']}
        style={styles.mapBackground}
      >
        {/* Street Grid Pattern */}
        <Svg width={MAP_WIDTH} height={MAP_HEIGHT} style={styles.streetGrid}>
          {/* Horizontal streets */}
          {Array.from({ length: 20 }, (_, i) => (
            <Path
              key={`h-${i}`}
              d={`M 0 ${(i * MAP_HEIGHT) / 20} L ${MAP_WIDTH} ${(i * MAP_HEIGHT) / 20}`}
              stroke="#E5E7EB"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          {/* Vertical streets */}
          {Array.from({ length: 15 }, (_, i) => (
            <Path
              key={`v-${i}`}
              d={`M ${(i * MAP_WIDTH) / 15} 0 L ${(i * MAP_WIDTH) / 15} ${MAP_HEIGHT}`}
              stroke="#E5E7EB"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          {/* Major roads */}
          <Path
            d={`M 0 ${MAP_HEIGHT * 0.3} L ${MAP_WIDTH} ${MAP_HEIGHT * 0.4}`}
            stroke="#CBD5E1"
            strokeWidth="3"
            opacity="0.6"
          />
          <Path
            d={`M ${MAP_WIDTH * 0.2} 0 L ${MAP_WIDTH * 0.3} ${MAP_HEIGHT}`}
            stroke="#CBD5E1"
            strokeWidth="3"
            opacity="0.6"
          />
        </Svg>

        {/* Interactive Map Layer */}
        <Animated.View
          style={[
            styles.mapLayer,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: scale },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Restroom Markers */}
          {restrooms.map((restroom) => (
            <CustomMarker key={restroom.id} restroom={restroom} />
          ))}
          
          {/* User Location Marker */}
          <UserLocationMarker />
        </Animated.View>
      </LinearGradient>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
          <ZoomIn size={20} color="#3B82F6" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
          <ZoomOut size={20} color="#3B82F6" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Locate size={20} color="#3B82F6" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Restroom Popup */}
      {selectedRestroom && (
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [
                {
                  scale: popupAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                {
                  translateY: popupAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: popupAnimation,
            },
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.popupGradient}
          >
            <View style={styles.popupHeader}>
              <View style={styles.popupTitleContainer}>
                <View style={[
                  styles.popupStatusIndicator, 
                  { backgroundColor: getMarkerColor(selectedRestroom) }
                ]} />
                <View style={styles.popupTitleContent}>
                  <Text style={styles.popupTitle}>{selectedRestroom.name}</Text>
                  <Text style={styles.popupAddress}>{selectedRestroom.address}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
                <X size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.popupMeta}>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                <Text style={styles.ratingText}>{selectedRestroom.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({selectedRestroom.reviews.length})</Text>
              </View>
              
              {selectedRestroom.distance && (
                <Text style={styles.distanceText}>{selectedRestroom.distance.toFixed(1)} км</Text>
              )}
            </View>

            <View style={styles.popupAmenities}>
              {selectedRestroom.accessibility && (
                <View style={styles.amenityBadge}>
                  <Accessibility size={14} color="#10B981" strokeWidth={2} />
                  <Text style={styles.amenityText}>Достъпно</Text>
                </View>
              )}
              {selectedRestroom.isPaid && (
                <View style={styles.amenityBadge}>
                  <Euro size={14} color="#F59E0B" strokeWidth={2} />
                  <Text style={styles.amenityText}>
                    {typeof selectedRestroom.price === 'number' ? selectedRestroom.price.toFixed(2) : '0.00'} лв
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.popupActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onRestroomPress(selectedRestroom)}
              >
                <Text style={styles.actionButtonText}>Детайли</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={() => openInMaps(selectedRestroom)}
              >
                <Navigation size={16} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.primaryActionButtonText}>Навигация</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapBackground: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    position: 'relative',
  },
  streetGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mapLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  marker: {
    position: 'absolute',
    zIndex: 10,
  },
  pulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    opacity: 0.3,
  },
  userMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 5,
  },
  userMarkerGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  mapControls: {
    position: 'absolute',
    top: 80,
    right: 16,
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popup: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  popupGradient: {
    padding: 20,
    borderRadius: 20,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  popupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  popupStatusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
  },
  popupTitleContent: {
    flex: 1,
    marginLeft: 12,
  },
  popupTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  popupAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  popupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  popupAmenities: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  amenityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  popupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4B5563',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});