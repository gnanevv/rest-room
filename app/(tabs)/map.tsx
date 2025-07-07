import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { Moon, Sun, MapPin, Zap, Navigation, Star, Euro, Accessibility } from 'lucide-react-native';
import * as Location from 'expo-location';


const { width, height } = Dimensions.get('window');

// Web Map Component
const WebMapView = ({ restrooms, userLocation, isDarkMode }: {
  restrooms: Restroom[];
  userLocation?: { latitude: number; longitude: number };
  isDarkMode: boolean;
}) => {
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);

  const getMarkerColor = (restroom: Restroom) => {
    if (restroom.availability === 'out_of_order') return '#EF4444';
    if (restroom.availability === 'occupied') return '#F59E0B';
    if (restroom.rating >= 4.5) return '#10B981';
    if (restroom.rating >= 4.0) return '#3B82F6';
    return '#6B7280';
  };

  return (
    <View style={[styles.webMapContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f3f4f6' }]}>
      {/* Map Grid */}
      <View style={styles.mapGrid}>
        {/* User Location */}
        {userLocation && (
          <View style={[styles.userLocationPin, { 
            left: '45%', 
            top: '40%',
            backgroundColor: isDarkMode ? '#3B82F6' : '#1E40AF'
          }]}>
            <View style={styles.userLocationInner} />
          </View>
        )}

        {/* Restroom Markers */}
        {restrooms.map((restroom, index) => (
          <View
            key={restroom.id}
            style={[
              styles.restroomPin,
              {
                left: `${20 + (index * 15) % 60}%`,
                top: `${30 + (index * 10) % 40}%`,
                backgroundColor: getMarkerColor(restroom),
              }
            ]}
            onTouchEnd={() => setSelectedRestroom(restroom)}
          >
            <MapPin size={16} color="white" strokeWidth={2} />
          </View>
        ))}
      </View>

      {/* Map Info Overlay */}
      <View style={styles.mapInfoOverlay}>
        <BlurView 
          intensity={isDarkMode ? 80 : 60} 
          tint={isDarkMode ? 'dark' : 'light'} 
          style={styles.mapInfoBlur}
        >
          <Text style={[styles.mapInfoTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
            Interactive Map View
          </Text>
          <Text style={[styles.mapInfoSubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            {restrooms.length} locations • Tap markers to explore
          </Text>
        </BlurView>
      </View>

      {/* Selected Restroom Popup */}
      {selectedRestroom && (
        <View style={styles.selectedRestroomPopup}>
          <BlurView 
            intensity={100} 
            tint={isDarkMode ? 'dark' : 'light'} 
            style={styles.popupBlur}
          >
            <LinearGradient
              colors={isDarkMode 
                ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']
              }
              style={styles.popupGradient}
            >
              <View style={styles.popupHeader}>
                <View style={[styles.popupMarker, { backgroundColor: getMarkerColor(selectedRestroom) }]}>
                  <MapPin size={20} color="white" strokeWidth={2} />
                </View>
                <View style={styles.popupInfo}>
                  <Text style={[styles.popupTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                    {selectedRestroom.name}
                  </Text>
                  <View style={styles.popupRating}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                    <Text style={[styles.popupRatingText, { color: isDarkMode ? '#E5E7EB' : '#4B5563' }]}>
                      {selectedRestroom.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.popupActions}>
                  <View style={[styles.popupActionButton, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' }]}>
                    <Navigation size={16} color="#3B82F6" strokeWidth={2} />
                  </View>
                  <View 
                    style={styles.popupCloseButton}
                    onTouchEnd={() => setSelectedRestroom(null)}
                  >
                    <Text style={[styles.popupCloseText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>×</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.popupAmenities}>
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
            </LinearGradient>
          </BlurView>
        </View>
      )}
    </View>
  );
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [restrooms, setRestrooms] = useState<Restroom[]>(mockRestrooms);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    loadThemePreference();
  }, []);

  const loadThemePreference = () => {
    if (Platform.OS === 'web') {
      const savedTheme = window.localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      } else {
        setIsDarkMode(true); // Default to dark mode
      }
    } else {
      setIsDarkMode(true); // Always dark mode on native, no persistence
    }
  };



  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (Platform.OS === 'web') {
      window.localStorage.setItem('darkMode', JSON.stringify(newTheme));
    }
    // No-op for native
  };



  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude,
                  accuracy: position.coords.accuracy,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                },
                timestamp: position.timestamp,
              } as Location.LocationObject);
            },
            (error) => {
              console.log('Error getting location:', error);
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
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        } else {
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
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission not granted');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.log('Error getting location:', error);
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

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F3F4F6' }]}>
      {/* Premium Header */}
      <View style={styles.headerContainer}>
        <BlurView 
          intensity={100} 
          tint={isDarkMode ? 'dark' : 'light'} 
          style={styles.headerBlur}
        >
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(0,0,0,0.8)', 'rgba(30,64,175,0.3)'] 
              : ['rgba(255,255,255,0.8)', 'rgba(59,130,246,0.3)']
            }
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#3B82F6', '#1E40AF']}
                    style={styles.logoGradient}
                  >
                    <MapPin size={24} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                    Premium Map
                  </Text>
                  <View style={styles.headerSubtitleContainer}>
                    <Zap size={12} color="#F59E0B" strokeWidth={2} />
                    <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                      {restrooms.length} locations • Live data
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.headerRight}>
                <View style={[styles.themeToggle, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                  <Sun size={16} color={isDarkMode ? '#6B7280' : '#F59E0B'} strokeWidth={2} />
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#E5E7EB', true: '#374151' }}
                    thumbColor={isDarkMode ? '#3B82F6' : '#F3F4F6'}
                    style={styles.switch}
                  />
                  <Moon size={16} color={isDarkMode ? '#3B82F6' : '#6B7280'} strokeWidth={2} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Map View */}
      <WebMapView
        restrooms={restrooms}
        userLocation={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : undefined
        }
        isDarkMode={isDarkMode}
      />

      {/* Stats Overlay */}
      <View style={styles.statsOverlay}>
        <BlurView 
          intensity={80} 
          tint={isDarkMode ? 'dark' : 'light'} 
          style={styles.statsBlur}
        >
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <MapPin size={16} color="#3B82F6" strokeWidth={2} />
              <Text style={[styles.statNumber, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                {restrooms.length}
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                Locations
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.statNumber, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                {restrooms.filter(r => r.availability === 'available').length}
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                Available
              </Text>
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
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBlur: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  webMapContainer: {
    flex: 1,
    position: 'relative',
    marginTop: 140,
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
    backgroundImage: Platform.OS === 'web' ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)' : undefined,
    backgroundSize: Platform.OS === 'web' ? '20px 20px' : undefined,
  },
  userLocationPin: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  restroomPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapInfoOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  mapInfoBlur: {
    borderRadius: 16,
    padding: 16,
  },
  mapInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  mapInfoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  selectedRestroomPopup: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  popupBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  popupGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  popupMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupInfo: {
    flex: 1,
  },
  popupTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  popupRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popupRatingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  popupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  popupActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  popupCloseText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  popupAmenities: {
    flexDirection: 'row',
    gap: 8,
  },
  amenityBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 140,
    left: 20,
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
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});