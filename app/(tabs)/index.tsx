import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
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
  const [restrooms, setRestrooms] = useState<Restroom[]>(mockRestrooms);

  useEffect(() => {
    getCurrentLocation();
  }, []);

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
