import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MapWithBottomSheet } from '@/components/MapWithBottomSheet';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';
import { useRealRestrooms } from '@/hooks/useRealRestrooms';
import * as Location from 'expo-location';

export default function MapScreen() {
  const { colors } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

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
    getCurrentLocation();
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
              // Default to Sofia center
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
          // Fallback to Sofia center
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
          Alert.alert(
            'Разрешение за локация',
            'Нужен е достъп до локацията за да показваме най-близките тоалетни.'
          );
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.log('Error getting location:', error);
      // Fallback to Sofia center
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

  // Show loading state while fetching real data
  if (isLoadingReal && restrooms.length === 0) {
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
        <Text style={{ color: colors.text, fontSize: 16, marginBottom: 8 }}>
          🔍 Searching for restrooms...
        </Text>
        <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>
          This may take a few seconds
        </Text>
      </View>
    );
  }

  // Show error state if real data failed to load
  if (realDataError && restrooms.length === 0) {
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
        <Text style={{ color: colors.text, fontSize: 16, marginBottom: 8 }}>
          ❌ Failed to load restrooms
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 12,
            opacity: 0.7,
            marginBottom: 16,
          }}
        >
          {realDataError}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
          onPress={refreshData}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
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
        onRefresh={refreshData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
