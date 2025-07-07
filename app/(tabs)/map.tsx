import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PremiumInteractiveMap } from '@/components/PremiumInteractiveMap';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { Moon, Sun, MapPin, Zap } from 'lucide-react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [restrooms, setRestrooms] = useState<Restroom[]>(mockRestrooms);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
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
                <View style={styles.themeToggle}>
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

      {/* Premium Interactive Map */}
      <PremiumInteractiveMap
        restrooms={restrooms}
        userLocation={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : undefined
        }
      />
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});
