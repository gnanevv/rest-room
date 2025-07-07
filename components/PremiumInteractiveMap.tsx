import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
  Circle,
  Region,
} from 'react-native-maps';
import {
  MapPin,
  Star,
  Navigation,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  AlertTriangle,
  CheckCircle,
  Accessibility,
  Filter,
  Layers,
  Route,
  Clock,
  Euro,
  Users,
  Camera,
  Heart,
  Share2,
  Phone,
  ExternalLink,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Restroom } from '@/types/restroom';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface PremiumInteractiveMapProps {
  restrooms: Restroom[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');

// Premium Dark Map Style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#0a0a0a" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#0a0a0a" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#1a1a1a" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2937" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

// Clustering logic
const createClusters = (restrooms: Restroom[], region: Region) => {
  const clusters: any[] = [];
  const processed = new Set();
  
  restrooms.forEach((restroom, index) => {
    if (processed.has(index)) return;
    
    const nearby = restrooms.filter((other, otherIndex) => {
      if (otherIndex === index || processed.has(otherIndex)) return false;
      
      const distance = getDistance(
        restroom.coordinates,
        other.coordinates
      );
      
      return distance < 0.5; // 500m clustering radius
    });
    
    if (nearby.length > 0) {
      // Create cluster
      const allItems = [restroom, ...nearby];
      const centerLat = allItems.reduce((sum, item) => sum + item.coordinates.latitude, 0) / allItems.length;
      const centerLng = allItems.reduce((sum, item) => sum + item.coordinates.longitude, 0) / allItems.length;
      
      clusters.push({
        id: `cluster-${index}`,
        coordinate: { latitude: centerLat, longitude: centerLng },
        count: allItems.length,
        restrooms: allItems,
        isCluster: true,
      });
      
      allItems.forEach((item) => {
        const itemIndex = restrooms.indexOf(item);
        processed.add(itemIndex);
      });
    } else {
      clusters.push({
        ...restroom,
        isCluster: false,
      });
      processed.add(index);
    }
  });
  
  return clusters;
};

const getDistance = (coord1: any, coord2: any) => {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export function PremiumInteractiveMap({ restrooms, userLocation }: PremiumInteractiveMapProps) {
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [routeDetails, setRouteDetails] = useState<{ distance: number, duration: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: userLocation?.latitude || 42.6977,
    longitude: userLocation?.longitude || 23.3219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showRoute, setShowRoute] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  
  const mapViewRef = useRef<MapView>(null);
  const popupAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Clustering
  const clusters = useMemo(() => {
    return createClusters(restrooms, mapRegion);
  }, [restrooms, mapRegion]);

  // Pulse animation for user location
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Popup animation
  useEffect(() => {
    if (selectedRestroom || selectedCluster) {
      Animated.spring(popupAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(popupAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedRestroom, selectedCluster]);

  const handleMarkerPress = (item: any) => {
    if (item.isCluster) {
      setSelectedCluster(item);
      setSelectedRestroom(null);
      // Zoom into cluster
      mapViewRef.current?.animateToRegion({
        ...item.coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      setSelectedRestroom(item);
      setSelectedCluster(null);
      setRouteDetails(null);
      setRouteCoordinates([]);
    }
  };

  const closePopup = () => {
    setSelectedRestroom(null);
    setSelectedCluster(null);
    setRouteDetails(null);
    setRouteCoordinates([]);
    setShowRoute(false);
  };

  const getMarkerColor = (restroom: Restroom) => {
    if (restroom.availability === 'out_of_order') return '#EF4444';
    if (restroom.availability === 'occupied') return '#F59E0B';
    if (restroom.rating >= 4.5) return '#10B981';
    if (restroom.rating >= 4.0) return '#3B82F6';
    return '#6B7280';
  };

  const calculateRoute = async () => {
    if (!userLocation || !selectedRestroom) return;
    
    setShowRoute(true);
    // Simulate route calculation
    const distance = getDistance(userLocation, selectedRestroom.coordinates);
    const duration = distance * 12; // Rough estimate: 12 minutes per km
    
    setRouteDetails({ distance, duration });
    
    // Create a simple route line
    setRouteCoordinates([
      userLocation,
      selectedRestroom.coordinates,
    ]);
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
      mapViewRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.errorGradient}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>API Key Missing</Text>
          <Text style={styles.errorText}>
            Google Maps API key is not configured. Please add it to your .env file.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <MapView
        ref={mapViewRef}
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={darkMapStyle}
        initialRegion={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        mapType={mapType}
        onPress={closePopup}
      >
        {/* User Location with Pulse Effect */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={1000}
              fillColor="rgba(59, 130, 246, 0.1)"
              strokeColor="rgba(59, 130, 246, 0.3)"
              strokeWidth={2}
            />
            <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <Animated.View style={[
                styles.userLocationMarker,
                { transform: [{ scale: pulseAnimation }] }
              ]}>
                <View style={styles.userLocationInner} />
              </Animated.View>
            </Marker>
          </>
        )}

        {/* Clustered Markers */}
        {clusters.map((item) => (
          <Marker
            key={item.id}
            coordinate={item.isCluster ? item.coordinate : item.coordinates}
            onPress={() => handleMarkerPress(item)}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
          >
            {item.isCluster ? (
              <View style={styles.clusterMarker}>
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF']}
                  style={styles.clusterGradient}
                >
                  <Text style={styles.clusterText}>{item.count}</Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={[styles.restroomMarker, { backgroundColor: getMarkerColor(item) }]}>
                <MapPin size={20} color="white" strokeWidth={2} />
                <View style={[styles.markerShadow, { backgroundColor: getMarkerColor(item) }]} />
              </View>
            )}
          </Marker>
        ))}

        {/* Route Polyline */}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#3B82F6"
            lineDashPattern={[8, 8]}
          />
        )}
      </MapView>

      {/* Glassmorphism Controls */}
      <View style={styles.mapControls}>
        <BlurView intensity={80} tint="dark" style={styles.controlsBlur}>
          <TouchableOpacity style={styles.controlButton} onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}>
            <Layers size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
            <ZoomIn size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
            <ZoomOut size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
            <Locate size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Premium Glassmorphism Popup */}
      {(selectedRestroom || selectedCluster) && (
        <Animated.View 
          style={[
            styles.popupContainer,
            {
              transform: [
                { translateY: popupAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }) },
                { scale: popupAnimation }
              ],
              opacity: popupAnimation,
            }
          ]}
        >
          <BlurView intensity={100} tint="dark" style={styles.popupBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.popupGradient}
            >
              <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
                <X size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>

              {selectedCluster ? (
                // Cluster Popup
                <View style={styles.clusterPopupContent}>
                  <View style={styles.clusterHeader}>
                    <View style={styles.clusterIcon}>
                      <MapPin size={24} color="#3B82F6" strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={styles.clusterTitle}>{selectedCluster.count} Restrooms</Text>
                      <Text style={styles.clusterSubtitle}>In this area</Text>
                    </View>
                  </View>
                  
                  <View style={styles.clusterStats}>
                    <View style={styles.statItem}>
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.statText}>
                        {(selectedCluster.restrooms.reduce((sum: number, r: Restroom) => sum + r.rating, 0) / selectedCluster.restrooms.length).toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <CheckCircle size={16} color="#10B981" />
                      <Text style={styles.statText}>
                        {selectedCluster.restrooms.filter((r: Restroom) => r.availability === 'available').length} Available
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.exploreButton}
                    onPress={() => {
                      // Zoom into cluster to show individual markers
                      mapViewRef.current?.animateToRegion({
                        ...selectedCluster.coordinate,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      });
                      closePopup();
                    }}
                  >
                    <LinearGradient colors={['#3B82F6', '#1E40AF']} style={styles.exploreGradient}>
                      <Text style={styles.exploreText}>Explore Area</Text>
                      <ExternalLink size={16} color="#FFFFFF" strokeWidth={2} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : selectedRestroom && (
                // Individual Restroom Popup
                <View style={styles.popupContent}>
                  <View style={styles.popupHeader}>
                    <View style={styles.popupImageContainer}>
                      <LinearGradient
                        colors={[getMarkerColor(selectedRestroom), '#1a1a1a']}
                        style={styles.popupImageGradient}
                      >
                        <MapPin size={32} color="#FFFFFF" strokeWidth={2} />
                      </LinearGradient>
                    </View>
                    <View style={styles.popupTextContainer}>
                      <Text style={styles.popupTitle}>{selectedRestroom.name}</Text>
                      <View style={styles.ratingContainer}>
                        <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                        <Text style={styles.ratingText}>{selectedRestroom.rating.toFixed(1)}</Text>
                        <Text style={styles.reviewCount}>({selectedRestroom.reviews.length})</Text>
                      </View>
                      {routeDetails ? (
                        <View style={styles.routeInfo}>
                          <Route size={14} color="#3B82F6" strokeWidth={2} />
                          <Text style={styles.distanceText}>
                            {routeDetails.distance.toFixed(1)} km • {Math.round(routeDetails.duration)} min
                          </Text>
                        </View>
                      ) : userLocation && (
                        <View style={styles.routeInfo}>
                          <MapPin size={14} color="#6B7280" strokeWidth={2} />
                          <Text style={styles.distanceText}>
                            {getDistance(userLocation, selectedRestroom.coordinates).toFixed(1)} km away
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.amenitiesContainer}>
                    <View style={styles.amenityRow}>
                      <View style={[styles.statusBadge, { backgroundColor: getMarkerColor(selectedRestroom) }]}>
                        <CheckCircle size={12} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.statusText}>
                          {selectedRestroom.availability === 'available' ? 'Available' : 
                           selectedRestroom.availability === 'occupied' ? 'Occupied' : 'Out of Order'}
                        </Text>
                      </View>
                      {selectedRestroom.accessibility && (
                        <View style={styles.amenityBadge}>
                          <Accessibility size={12} color="#10B981" strokeWidth={2} />
                        </View>
                      )}
                      {selectedRestroom.isPaid && (
                        <View style={styles.amenityBadge}>
                          <Euro size={12} color="#F59E0B" strokeWidth={2} />
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={calculateRoute}
                    >
                      <LinearGradient colors={['#3B82F6', '#1E40AF']} style={styles.actionGradient}>
                        <Navigation size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.actionText}>Navigate</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.secondaryButton}>
                      <Heart size={16} color="#EF4444" strokeWidth={2} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.secondaryButton}>
                      <Share2 size={16} color="#6B7280" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}

      {/* Premium Stats Overlay */}
      <View style={styles.statsOverlay}>
        <BlurView intensity={80} tint="dark" style={styles.statsBlur}>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <MapPin size={16} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.statNumber}>{restrooms.length}</Text>
              <Text style={styles.statLabel}>Locations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <CheckCircle size={16} color="#10B981" strokeWidth={2} />
              <Text style={styles.statNumber}>
                {restrooms.filter(r => r.availability === 'available').length}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    width: width,
    height: height,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 24,
  },
  errorGradient: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  restroomMarker: {
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  markerShadow: {
    position: 'absolute',
    bottom: -8,
    width: 16,
    height: 8,
    borderRadius: 8,
    opacity: 0.3,
    transform: [{ scaleX: 1.5 }],
  },
  clusterMarker: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clusterGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clusterText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  mapControls: {
    position: 'absolute',
    top: 80,
    right: 16,
  },
  controlsBlur: {
    borderRadius: 20,
    padding: 8,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsOverlay: {
    position: 'absolute',
    top: 80,
    left: 16,
  },
  statsBlur: {
    borderRadius: 16,
    padding: 12,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  popupContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  popupBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  popupGradient: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupContent: {
    gap: 16,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  popupImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  popupImageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupTextContainer: {
    flex: 1,
    gap: 6,
  },
  popupTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  amenitiesContainer: {
    gap: 12,
  },
  amenityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  amenityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterPopupContent: {
    gap: 16,
  },
  clusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clusterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  clusterSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  clusterStats: {
    flexDirection: 'row',
    gap: 16,
  },
  exploreButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  exploreText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});