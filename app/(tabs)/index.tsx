import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { MapWithBottomSheet } from '@/components/MapWithBottomSheet';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';
import { useRealRestrooms } from '@/hooks/useRealRestrooms';
import { Sparkles, MapPin, Zap } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function MapScreen() {
  const { colors } = useTheme();
  const pulseAnimation = useSharedValue(0);
  const floatAnimation = useSharedValue(0);
  const shimmerAnimation = useSharedValue(0);
  const isMountedRef = useRef(true);

  // Start animations
  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [initialRegion, setInitialRegion] = useState({
    latitude: 42.6977, // Sofia fallback
    longitude: 23.3219,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  // Get real restroom data from Google Places API
  const {
    realRestrooms,
    isLoading: isLoadingReal,
    error: realDataError,
    refreshData,
  } = useRealRestrooms();

  // Combine mock and real data
  const [restrooms, setRestrooms] = useState<Restroom[]>(() => {
    try {
      if (!mockRestrooms || !Array.isArray(mockRestrooms)) {
        console.warn('MapScreen: mockRestrooms is invalid, using empty array');
        return [];
      }
      return mockRestrooms;
    } catch (error) {
      console.error('MapScreen: Error initializing restrooms:', error);
      return [];
    }
  });

  useEffect(() => {
    isMountedRef.current = true;
    getCurrentLocation();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Combine mock and real data when either changes
  useEffect(() => {
    try {
      const mockData = Array.isArray(mockRestrooms) ? mockRestrooms : [];
      const realData = Array.isArray(realRestrooms) ? realRestrooms : [];

      // Combine and remove duplicates based on coordinates
      const allRestrooms = [...mockData];

      realData.forEach((realRestroom) => {
        const isDuplicate = allRestrooms.some(
          (mockRestroom) =>
            Math.abs(
              mockRestroom.coordinates.latitude -
                realRestroom.coordinates.latitude
            ) < 0.001 &&
            Math.abs(
              mockRestroom.coordinates.longitude -
                realRestroom.coordinates.longitude
            ) < 0.001
        );

        if (!isDuplicate) {
          allRestrooms.push(realRestroom);
        }
      });

      setRestrooms(allRestrooms);
      console.log(
        `🔄 Combined data: ${mockData.length} mock + ${realData.length} real = ${allRestrooms.length} total`
      );
    } catch (error) {
      console.error('MapScreen: Error combining restroom data:', error);
      setRestrooms(mockRestrooms || []);
    }
  }, [mockRestrooms, realRestrooms]);

  const getCurrentLocation = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!isMountedRef.current) return;
              
              const locationObj = {
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
              } as Location.LocationObject;
              
              setLocation(locationObj);
              setInitialRegion({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              });
            },
            (error) => {
              if (!isMountedRef.current) return;
              
              console.log('Error getting location:', error);
              // Default to Sofia center
              const fallbackLocation = {
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
              } as Location.LocationObject;
              
              setLocation(fallbackLocation);
              setInitialRegion({
                latitude: 42.6977,
                longitude: 23.3219,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              });
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
          );
        } else {
          if (!isMountedRef.current) return;
          
          // Fallback to Sofia center
          const fallbackLocation = {
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
          } as Location.LocationObject;
          
          setLocation(fallbackLocation);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Разрешение за локация',
            'Нужен е достъп до локацията за да показваме най-близките тоалетни.'
          );
          return;
        }

        if (!isMountedRef.current) return;
        
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setInitialRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.log('Error getting location:', error);
      // Fallback to Sofia center
      const fallbackLocation = {
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
      } as Location.LocationObject;
      
      setLocation(fallbackLocation);
    }
  }, []);

  // Show loading state while fetching real data
  if (isLoadingReal && restrooms.length === 0) {
    const pulseStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: interpolate(pulseAnimation.value, [0, 1], [0.95, 1.05]),
        },
      ],
      opacity: interpolate(pulseAnimation.value, [0, 1], [0.7, 1]),
    }));

    const floatStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: interpolate(floatAnimation.value, [0, 1], [-10, 10]),
        },
      ],
    }));

    const shimmerStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            shimmerAnimation.value,
            [0, 1],
            [-200, 200]
          ),
        },
      ],
    }));

    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <StatusBar
          barStyle={colors.statusBarStyle}
          backgroundColor="transparent"
          translucent
        />

        {/* Animated Background */}
        <LinearGradient
          colors={
            theme === 'light'
              ? ['#667eea', '#764ba2', '#f093fb']
              : ['#0f0c29', '#302b63', '#24243e']
          }
          style={styles.loadingBackground}
        >
          {/* Floating particles */}
          <Animated.View style={[styles.particle, styles.particle1, floatStyle]} />
          <Animated.View style={[styles.particle, styles.particle2, floatStyle]} />
          <Animated.View style={[styles.particle, styles.particle3, floatStyle]} />
        </LinearGradient>

        <BlurView intensity={20} style={styles.loadingContent}>
          <Animated.View style={[styles.loadingCard, pulseStyle]}>
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.secondary}20`]}
              style={styles.loadingCardGradient}
            >
              <Animated.View style={[styles.iconContainer, floatStyle]}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.iconGradient}
                >
                  <Sparkles size={32} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
              </Animated.View>
              
              <Text style={[styles.loadingTitle, { color: colors.text }]}>
                Discovering Amazing Places
              </Text>
              
              <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
                Finding the best restrooms near you...
              </Text>
              
              {/* Shimmer effect */}
              <View style={styles.shimmerContainer}>
                <Animated.View
                  style={[
                    styles.shimmer,
                    { backgroundColor: `${colors.primary}30` },
                    shimmerStyle,
                  ]}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </View>
    );
  }

  // Show error state if real data failed to load
  if (realDataError && restrooms.length === 0) {
    const shakeAnimation = useSharedValue(0);
    
    const shakeStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            shakeAnimation.value,
            [0, 0.25, 0.5, 0.75, 1],
            [0, -10, 10, -10, 0]
          ),
        },
      ],
    }));

    const handleRetry = () => {
      shakeAnimation.value = withTiming(1, { duration: 500 }, () => {
        shakeAnimation.value = 0;
      });
      refreshData();
    };

    return (
      <View
        style={[
          styles.container,
          styles.errorContainer,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <StatusBar
          barStyle={colors.statusBarStyle}
          backgroundColor="transparent"
          translucent
        />

        <LinearGradient
          colors={
            theme === 'light'
              ? ['#ff9a9e', '#fecfef', '#fecfef']
              : ['#2d1b69', '#11998e', '#38ef7d']
          }
          style={styles.errorBackground}
        />

        <BlurView intensity={30} style={styles.errorContent}>
          <Animated.View style={[styles.errorCard, shakeStyle]}>
            <LinearGradient
              colors={[`${colors.error}15`, `${colors.warning}15`]}
              style={styles.errorCardGradient}
            >
              <View style={[styles.errorIconContainer, { backgroundColor: colors.error }]}>
                <Zap size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              
              <Text style={[styles.errorTitle, { color: colors.text }]}>
                Oops! Something went wrong
              </Text>
              
              <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                We couldn't load the restroom data. Don't worry, we'll get it sorted!
              </Text>
              
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.retryGradient}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                  <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </View>
    );
  }

  // Safety check before rendering
  if (!restrooms || !Array.isArray(restrooms)) {
    console.warn('MapScreen: restrooms is invalid:', restrooms);
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: colors.text }}>Loading restrooms...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapWithBottomSheet
        restrooms={restrooms}
        userLocation={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : undefined
        }
        initialRegion={initialRegion}
        onRefresh={refreshData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  particle1: {
    top: '20%',
    left: '10%',
  },
  particle2: {
    top: '60%',
    right: '15%',
  },
  particle3: {
    top: '80%',
    left: '70%',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  loadingCardGradient: {
    paddingHorizontal: 40,
    paddingVertical: 50,
    alignItems: 'center',
    borderRadius: 24,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  shimmerContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  shimmer: {
    width: 100,
    height: '100%',
    borderRadius: 2,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  errorCardGradient: {
    paddingHorizontal: 40,
    paddingVertical: 50,
    alignItems: 'center',
    borderRadius: 24,
  },
  errorIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  retryText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
