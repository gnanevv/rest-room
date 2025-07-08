import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { PremiumInteractiveMap } from '@/components/PremiumInteractiveMap';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';

export default function MapScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [restrooms] = useState<Restroom[]>(mockRestrooms);

  useEffect(() => {
    // Get user location for web using browser geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          // Default to Sofia, Bulgaria
          setLocation({
            latitude: 42.6977,
            longitude: 23.3219,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      // Default to Sofia, Bulgaria if geolocation is not available
      setLocation({
        latitude: 42.6977,
        longitude: 23.3219,
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <PremiumInteractiveMap
        restrooms={restrooms}
        userLocation={location || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});