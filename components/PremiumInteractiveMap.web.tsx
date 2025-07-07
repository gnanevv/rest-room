import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MapPin, Star, Navigation, ZoomIn, ZoomOut, Locate, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Accessibility, Filter, Layers, Route, Clock, Euro, Users, Camera, Heart, Share2, Phone, ExternalLink } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Restroom } from '@/types/restroom';

interface PremiumInteractiveMapProps {
  restrooms: Restroom[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');

export function PremiumInteractiveMap({ restrooms, userLocation }: PremiumInteractiveMapProps) {
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [routeDetails, setRouteDetails] = useState<{ distance: number, duration: number } | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  
  const popupAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

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

  const handleMarkerPress = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
    setSelectedCluster(null);
    setRouteDetails(null);
  };

  const closePopup = () => {
    setSelectedRestroom(null);
    setSelectedCluster(null);
    setRouteDetails(null);
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
    
    // Simulate route calculation
    const distance = Math.random() * 5 + 0.5; // Random distance between 0.5-5.5 km
    const duration = distance * 12; // Rough estimate: 12 minutes per km
    
    setRouteDetails({ distance, duration });
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Web Fallback Premium Map */}
      <View style={styles.webMapContainer}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a1a', '#2d2d2d']}
          style={styles.webMapGradient}
        >
          <View style={styles.webMapHeader}>
            <View style={styles.webMapIconContainer}>
              <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.webMapIconGradient}
              >
                <AlertTriangle size={32} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.webMapTitle}>Premium Web View</Text>
              <Text style={styles.webMapSubtitle}>
                Native map features require mobile platform
              </Text>
            </View>
          </View>

          {userLocation && (
            <View style={styles.locationCard}>
              <BlurView intensity={80} tint="dark" style={styles.locationBlur}>
                <View style={styles.locationContent}>
                  <Animated.View style={[
                    styles.userLocationIndicator,
                    { transform: [{ scale: pulseAnimation }] }
                  ]}>
                    <View style={styles.userLocationInner} />
                  </Animated.View>
                  <View>
                    <Text style={styles.locationTitle}>Your Location</Text>
                    <Text style={styles.locationCoords}>
                      {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>
          )}

          <ScrollView style={styles.restroomsList} showsVerticalScrollIndicator={false}>
            {restrooms.map((restroom) => (
              <TouchableOpacity
                key={restroom.id}
                style={styles.premiumRestroomItem}
                onPress={() => handleMarkerPress(restroom)}
              >
                <BlurView intensity={60} tint="dark" style={styles.restroomBlur}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.restroomGradient}
                  >
                    <View style={styles.restroomHeader}>
                      <View style={[styles.restroomMarker, { backgroundColor: getMarkerColor(restroom) }]}>
                        <MapPin size={20} color="white" strokeWidth={2} />
                      </View>
                      <View style={styles.restroomInfo}>
                        <Text style={styles.restroomName}>{restroom.name}</Text>
                        <View style={styles.ratingContainer}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                          <Text style={styles.ratingText}>{restroom.rating.toFixed(1)}</Text>
                          <Text style={styles.reviewCount}>({restroom.reviews.length})</Text>
                        </View>
                        {userLocation && (
                          <View style={styles.distanceContainer}>
                            <Route size={12} color="#9CA3AF" strokeWidth={2} />
                            <Text style={styles.distanceText}>
                              {getDistance(userLocation, restroom.coordinates).toFixed(1)} km away
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.amenityRow}>
                      <View style={[styles.statusBadge, { backgroundColor: getMarkerColor(restroom) }]}>
                        <CheckCircle size={10} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.statusText}>
                          {restroom.availability === 'available' ? 'Available' : 
                           restroom.availability === 'occupied' ? 'Occupied' : 'Out of Order'}
                        </Text>
                      </View>
                      {restroom.accessibility && (
                        <View style={styles.amenityBadge}>
                          <Accessibility size={10} color="#10B981" strokeWidth={2} />
                        </View>
                      )}
                      {restroom.isPaid && (
                        <View style={styles.amenityBadge}>
                          <Euro size={10} color="#F59E0B" strokeWidth={2} />
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </View>

      {/* Glassmorphism Controls */}
      <View style={styles.mapControls}>
        <BlurView intensity={80} tint="dark" style={styles.controlsBlur}>
          <TouchableOpacity style={styles.controlButton} onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}>
            <Layers size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <ZoomIn size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <ZoomOut size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Locate size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>
      </View>

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

      {/* Premium Glassmorphism Popup */}
      {selectedRestroom && (
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
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webMapContainer: {
    flex: 1,
  },
  webMapGradient: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  webMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  webMapIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  webMapIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webMapTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  webMapSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 24,
  },
  locationCard: {
    marginBottom: 24,
  },
  locationBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  userLocationIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  locationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  restroomsList: {
    flex: 1,
  },
  premiumRestroomItem: {
    marginBottom: 16,
  },
  restroomBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  restroomGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  restroomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
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
  restroomInfo: {
    flex: 1,
    gap: 6,
  },
  restroomName: {
    fontSize: 18,
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
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
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amenitiesContainer: {
    gap: 12,
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
});