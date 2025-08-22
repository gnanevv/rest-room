import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, Text } from 'react-native';
import { MapWithBottomSheet } from '@/components/MapWithBottomSheet';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';
import * as Location from 'expo-location';

export default function MapScreen() {
  const { colors } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  // Ensure mockRestrooms is valid before setting state
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

  // Ensure restrooms are properly initialized
  useEffect(() => {
    try {
      if (!restrooms || !Array.isArray(restrooms)) {
        console.warn('MapScreen: Restrooms state is invalid, reinitializing');
        if (mockRestrooms && Array.isArray(mockRestrooms)) {
          setRestrooms(mockRestrooms);
        } else {
          setRestrooms([]);
        }
      }
    } catch (error) {
      console.error('MapScreen: Error in restrooms useEffect:', error);
      setRestrooms([]);
    }
  }, [restrooms]);

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

  // Debug logging
  console.log('MapScreen render:', { 
    restrooms, 
    restroomsType: typeof restrooms, 
    isArray: Array.isArray(restrooms),
    length: restrooms?.length 
  });

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
