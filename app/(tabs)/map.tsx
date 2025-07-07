import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { InteractiveMap } from '@/components/InteractiveMap';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { MapPin, Layers, Filter } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [restrooms, setRestrooms] = useState<Restroom[]>(mockRestrooms);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

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

  const filteredRestrooms = restrooms.filter((restroom) => {
    switch (selectedFilter) {
      case 'available':
        return restroom.availability === 'available';
      case 'high_rated':
        return restroom.rating >= 4.5;
      case 'free':
        return !restroom.isPaid;
      case 'accessible':
        return restroom.accessibility;
      default:
        return true;
    }
  });

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <MapPin size={32} color="#FFFFFF" strokeWidth={2} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Интерактивна карта</Text>
              <Text style={styles.headerSubtitle}>
                {filteredRestrooms.length} тоалетни в София
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Filter Buttons */}
        <View style={styles.quickFilters}>
          {[
            { key: 'all', label: 'Всички', icon: Layers },
            { key: 'available', label: 'Свободни', icon: MapPin },
            { key: 'high_rated', label: 'Топ', icon: Filter },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.quickFilterButton,
                selectedFilter === filter.key && styles.quickFilterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <filter.icon
                size={16}
                color={selectedFilter === filter.key ? '#1E40AF' : '#FFFFFF'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.quickFilterText,
                  selectedFilter === filter.key && styles.quickFilterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Interactive Map */}
      <InteractiveMap
        restrooms={filteredRestrooms}
        userLocation={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : undefined
        }
      />

      {/* Map Legend */}
      <View style={styles.legendContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.legendGradient}
        >
          <Text style={styles.legendTitle}>Легенда</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#10B981' }]}
              />
              <Text style={styles.legendText}>Отлично (4.5+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#3B82F6' }]}
              />
              <Text style={styles.legendText}>Добро (4.0+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#F59E0B' }]}
              />
              <Text style={styles.legendText}>Заето</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#EF4444' }]}
              />
              <Text style={styles.legendText}>Неработещо</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#BFDBFE',
  },
  quickFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  quickFilterButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  quickFilterText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  quickFilterTextActive: {
    color: '#1E40AF',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  legendGradient: {
    padding: 16,
    borderRadius: 16,
    minWidth: 180,
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  legendText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
});
