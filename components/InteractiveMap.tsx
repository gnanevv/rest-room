import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
  Camera,
  Circle,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { MapPin, Star, Navigation, ZoomIn, ZoomOut, Locate, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Accessibility } from 'lucide-react-native';
import { Restroom } from '@/types/restroom';
import mapStyle from '@/assets/map/map-style.json';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface InteractiveMapProps {
  restrooms: Restroom[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');

export function InteractiveMap({ restrooms, userLocation }: InteractiveMapProps) {
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(
    null
  );
  const [routeDetails, setRouteDetails] = useState<{ distance: number, duration: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const mapViewRef = useRef<MapView>(null);

  useEffect(() => {
    if (selectedRestroom && userLocation && mapViewRef.current) {
      mapViewRef.current.fitToCoordinates(
        [userLocation, selectedRestroom.coordinates],
        {
          edgePadding: {
            top: 100,
            right: 50,
            bottom: 300, // Make space for the popup
            left: 50,
          },
          animated: true,
        }
      );
    }
  }, [selectedRestroom, userLocation]);

  const handleMarkerPress = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
    setRouteDetails(null);
    setRouteCoordinates([]);
  };

  const closePopup = () => {
    setSelectedRestroom(null);
    setRouteDetails(null);
    setRouteCoordinates([]);
  };

  const zoomIn = async () => {
    if (!mapViewRef.current) return;
    const camera = await mapViewRef.current.getCamera();
    if (camera.altitude) {
      camera.altitude /= 2;
      mapViewRef.current.animateCamera(camera);
    }
  };

  const zoomOut = async () => {
    if (!mapViewRef.current) return;
    const camera = await mapViewRef.current.getCamera();
    if (camera.altitude) {
      camera.altitude *= 2;
      mapViewRef.current.animateCamera(camera);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapViewRef.current) {
      mapViewRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  };

  const getMarkerColor = (restroom: Restroom) => {
    if (restroom.availability === 'out_of_order') return '#EF4444';
    if (restroom.availability === 'occupied') return '#F59E0B';
    if (restroom.rating >= 4.5) return '#10B981';
    if (restroom.rating >= 4.0) return '#3B82F6';
    return '#6B7280';
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>API Key Missing</Text>
        <Text style={styles.errorText}>
          Google Maps API key is not configured. Please add it to your .env file as EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={
          userLocation
            ? { ...userLocation, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
            : { latitude: 42.6977, longitude: 23.3219, latitudeDelta: 0.0922, longitudeDelta: 0.0421 } // Default to Sofia
        }
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={closePopup}
      >
        {userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userLocationMarker} />
          </Marker>
        )}

        {userLocation && (
          <Circle
            center={userLocation}
            radius={1000}
            fillColor="rgba(59, 130, 246, 0.1)"
            strokeColor="rgba(59, 130, 246, 0.3)"
            strokeWidth={1}
          />
        )}

        {restrooms.map((restroom) => (
          <Marker
            key={restroom.id}
            coordinate={restroom.coordinates}
            onPress={() => handleMarkerPress(restroom)}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={[styles.restroomMarker, { backgroundColor: getMarkerColor(restroom) }]}>
              <MapPin size={20} color="white" />
            </View>
          </Marker>
        ))}

        {userLocation && selectedRestroom && (
          <MapViewDirections
            origin={userLocation}
            destination={selectedRestroom.coordinates}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={0} // Invisible
            onReady={(result) => {
              setRouteDetails({ distance: result.distance, duration: result.duration });
              setRouteCoordinates(result.coordinates);
            }}
          />
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#3B82F6"
            lineDashPattern={[8, 8]}
          />
        )}
      </MapView>

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

      {selectedRestroom && (
        <View style={styles.popupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
            <X size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.popupContent}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/100' }} // Placeholder image
              style={styles.popupImage}
            />
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>{selectedRestroom.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{selectedRestroom.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({selectedRestroom.reviews.length} reviews)</Text>
              </View>
              {routeDetails ? (
                <Text style={styles.distanceText}>
                  {routeDetails.distance.toFixed(1)} km away
                </Text>
              ) : (
                <ActivityIndicator size="small" color="#3B82F6" style={{alignSelf: 'flex-start'}} />
              )}
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
  map: {
    width: width,
    height: height,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  restroomMarker: {
    padding: 8,
    borderRadius: 20,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFBEB',
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#92400E',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 24,
  },
});