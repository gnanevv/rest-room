import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
  Circle,
  Region,
} from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  MapPin, 
  Star, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Locate, 
  X, 
  Layers,
  Filter,
  Route,
  Accessibility,
  Euro,
  Users,
  Camera,
  Heart,
  Share2,
  Phone,
  ExternalLink,
  Sparkles,
  Target,
  Compass,
} from 'lucide-react-native';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import * as Location from 'expo-location';

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

// Light Map Style
const lightMapStyle = [
  {
    "featureType": "all",
    "elementType": "geometry.fill",
    "stylers": [{ "weight": "2.00" }]
  },
  {
    "featureType": "all",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#9c9c9c" }]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [{ "color": "#f2f2f2" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#7b7b7b" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#c8d7d4" }]
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

export default function MapScreen() {
  const { colors, isDarkMode } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [restrooms, setRestrooms] = useState<Restroom[]>(mockRestrooms);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [routeDetails, setRouteDetails] = useState<{ distance: number, duration: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 42.6977,
    longitude: 23.3219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showRoute, setShowRoute] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  
  const mapViewRef = useRef<MapView>(null);
  const popupAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Clustering
  const clusters = React.useMemo(() => {
    return createClusters(restrooms, mapRegion);
  }, [restrooms, mapRegion]);

  // Pulse animation for user location
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
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

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Разрешение за локация', 'Нужен е достъп до локацията за да показваме най-близките тоалетни.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Update map region to user location
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }
    } catch (error) {
      console.log('Error getting location:', error);
      // Fallback to Sofia coordinates
      setLocation({
        coords: {
          latitude: 42.6977,
          longitude: 23.3219,
          altitude: null,
          accuracy: 100,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as Location.LocationObject);
    }
  };

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
    if (!location || !selectedRestroom) return;
    
    setShowRoute(true);
    const distance = getDistance(location.coords, selectedRestroom.coordinates);
    const duration = distance * 12; // Rough estimate: 12 minutes per km
    
    setRouteDetails({ distance, duration });
    
    // Create a simple route line
    setRouteCoordinates([
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
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
    if (location && mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      {/* Premium Header */}
      <View style={styles.headerContainer}>
        <BlurView 
          intensity={Platform.OS === 'ios' ? 100 : 0} 
          tint={isDarkMode ? 'dark' : 'light'} 
          style={styles.headerBlur}
        >
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)'] 
              : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']
            }
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.logoGradient}
                  >
                    <Sparkles size={24} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Premium Map
                  </Text>
                  <View style={styles.headerSubtitleContainer}>
                    <Target size={12} color={colors.primary} strokeWidth={2} />
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                      {restrooms.length} locations • Live data
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.headerRight}>
                <ThemeToggle size="small" />
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Map View */}
      <MapView
        ref={mapViewRef}
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={isDarkMode ? darkMapStyle : lightMapStyle}
        initialRegion={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        mapType={mapType}
        onPress={closePopup}
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* User Location with Pulse Effect */}
        {location && (
          <>
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={1000}
              fillColor={isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'}
              strokeColor={isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.3)'}
              strokeWidth={2}
            />
            <Marker 
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }} 
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Animated.View style={[
                styles.userLocationMarker,
                { 
                  transform: [{ scale: pulseAnimation }],
                  backgroundColor: colors.primary,
                }
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
                  colors={[colors.primary, colors.primaryDark]}
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
            strokeColor={colors.primary}
            lineDashPattern={[8, 8]}
          />
        )}
      </MapView>

      {/* Glassmorphism Controls */}
      <View style={styles.mapControls}>
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDarkMode ? 'dark' : 'light'} style={styles.controlsBlur}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} 
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <Layers size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} onPress={zoomIn}>
            <ZoomIn size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} onPress={zoomOut}>
            <ZoomOut size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} onPress={centerOnUser}>
            <Locate size={20} color={colors.text} strokeWidth={2} />
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
          <BlurView intensity={Platform.OS === 'ios' ? 100 : 0} tint={isDarkMode ? 'dark' : 'light'} style={styles.popupBlur}>
            <LinearGradient
              colors={isDarkMode
                ? ['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']
                : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']
              }
              style={[styles.popupGradient, { borderColor: colors.border }]}
            >
              <TouchableOpacity style={[styles.closeButton, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)' }]} onPress={closePopup}>
                <X size={20} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>

              {selectedCluster ? (
                // Cluster Popup
                <View style={styles.clusterPopupContent}>
                  <View style={styles.clusterHeader}>
                    <View style={[styles.clusterIcon, { backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)' }]}>
                      <MapPin size={24} color={colors.primary} strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={[styles.clusterTitle, { color: colors.text }]}>{selectedCluster.count} Restrooms</Text>
                      <Text style={[styles.clusterSubtitle, { color: colors.textSecondary }]}>In this area</Text>
                    </View>
                  </View>
                  
                  <View style={styles.clusterStats}>
                    <View style={styles.statItem}>
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.statText, { color: colors.text }]}>
                        {(selectedCluster.restrooms.reduce((sum: number, r: Restroom) => sum + r.rating, 0) / selectedCluster.restrooms.length).toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Users size={16} color="#10B981" />
                      <Text style={[styles.statText, { color: colors.text }]}>
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
                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.exploreGradient}>
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
                        colors={[getMarkerColor(selectedRestroom), isDarkMode ? '#1a1a1a' : '#f8fafc']}
                        style={styles.popupImageGradient}
                      >
                        <MapPin size={32} color="#FFFFFF" strokeWidth={2} />
                      </LinearGradient>
                    </View>
                    <View style={styles.popupTextContainer}>
                      <Text style={[styles.popupTitle, { color: colors.text }]}>{selectedRestroom.name}</Text>
                      <View style={styles.ratingContainer}>
                        <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                        <Text style={[styles.ratingText, { color: colors.text }]}>{selectedRestroom.rating.toFixed(1)}</Text>
                        <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>({selectedRestroom.reviews.length})</Text>
                      </View>
                      {routeDetails ? (
                        <View style={styles.routeInfo}>
                          <Route size={14} color={colors.primary} strokeWidth={2} />
                          <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                            {routeDetails.distance.toFixed(1)} km • {Math.round(routeDetails.duration)} min
                          </Text>
                        </View>
                      ) : location && (
                        <View style={styles.routeInfo}>
                          <MapPin size={14} color={colors.textTertiary} strokeWidth={2} />
                          <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                            {getDistance(location.coords, selectedRestroom.coordinates).toFixed(1)} km away
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.amenitiesContainer}>
                    <View style={styles.amenityRow}>
                      <View style={[styles.statusBadge, { backgroundColor: getMarkerColor(selectedRestroom) }]}>
                        <Text style={styles.statusText}>
                          {selectedRestroom.availability === 'available' ? 'Available' : 
                           selectedRestroom.availability === 'occupied' ? 'Occupied' : 'Out of Order'}
                        </Text>
                      </View>
                      {selectedRestroom.accessibility && (
                        <View style={[styles.amenityBadge, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' }]}>
                          <Accessibility size={12} color="#10B981" strokeWidth={2} />
                        </View>
                      )}
                      {selectedRestroom.isPaid && (
                        <View style={[styles.amenityBadge, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)' }]}>
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
                      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.actionGradient}>
                        <Navigation size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.actionText}>Navigate</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]}>
                      <Heart size={16} color="#EF4444" strokeWidth={2} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: isDarkMode ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)' }]}>
                      <Share2 size={16} color={colors.textSecondary} strokeWidth={2} />
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
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDarkMode ? 'dark' : 'light'} style={styles.statsBlur}>
          <LinearGradient
            colors={isDarkMode
              ? ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)']
              : ['rgba(255, 255, 255, 0.8)', 'rgba(248, 250, 252, 0.8)']
            }
            style={[styles.statsGradient, { borderColor: colors.border }]}
          >
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <MapPin size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {restrooms.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Locations
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Target size={16} color="#10B981" strokeWidth={2} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {restrooms.filter(r => r.availability === 'available').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Available
                </Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBlur: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 16,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  headerRight: {
    alignItems: 'center',
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
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
    top: 140,
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
  },
  statsOverlay: {
    position: 'absolute',
    top: 140,
    left: 16,
  },
  statsBlur: {
    borderRadius: 16,
  },
  statsGradient: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
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
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statDivider: {
    width: 1,
    height: 32,
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
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  clusterSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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