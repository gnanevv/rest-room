import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SearchHeader } from '@/components/SearchHeader';
import { FilterBar } from '@/components/FilterBar';
import { RestroomCard } from '@/components/RestroomCard';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';
import * as Location from 'expo-location';

export default function ListScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestrooms, setFilteredRestrooms] = useState<Restroom[]>(mockRestrooms);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCurrentLocation();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Разрешение за локация', 'Нужен е достъп до локацията за да показваме най-близките тоалетни.');
        return;
      }

      if (!isMounted) return;
      
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredRestrooms(mockRestrooms);
    } else {
      const filtered = mockRestrooms.filter(restroom =>
        restroom.name.toLowerCase().includes(query.toLowerCase()) ||
        restroom.address.toLowerCase().includes(query.toLowerCase()) ||
        restroom.city.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRestrooms(filtered);
    }
  };

  const handleFilterChange = (filters: string[]) => {
    let filtered = mockRestrooms;

    if (filters.includes('free')) {
      filtered = filtered.filter(restroom => !restroom.isPaid);
    }
    if (filters.includes('accessible')) {
      filtered = filtered.filter(restroom => restroom.accessibility);
    }
    if (filters.includes('high_rated')) {
      filtered = filtered.filter(restroom => restroom.rating >= 4);
    }
    if (filters.includes('nearby')) {
      filtered = filtered.filter(restroom => restroom.distance && restroom.distance <= 1);
    }

    // Apply search query on top of filters
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(restroom =>
        restroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restroom.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restroom.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRestrooms(filtered);
  };

  const handleRestroomPress = (restroom: Restroom) => {
    Alert.alert(
      restroom.name,
      `${restroom.address}\n\nРейтинг: ${restroom.rating}/5\nЧистота: ${restroom.cleanliness}/5\n\nСтатус: ${getAvailabilityText(restroom.availability)}`,
      [
        { text: 'Затвори', style: 'cancel' },
        { text: 'Навигация', onPress: () => handleNavigation(restroom) },
      ]
    );
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Свободно';
      case 'occupied': return 'Заето';
      case 'out_of_order': return 'Неработещо';
      default: return 'Неизвестно';
    }
  };

  const handleNavigation = (restroom: Restroom) => {
    Alert.alert('Навигация', `Отваряне на навигация към ${restroom.name}...`);
  };

  const handleLocationPress = () => {
    getCurrentLocation();
  };

  const handleSettingsPress = () => {
    Alert.alert('Настройки', 'Тук ще бъдат настройките на приложението.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onLocationPress={handleLocationPress}
        onSettingsPress={handleSettingsPress}
      />
      <FilterBar onFilterChange={handleFilterChange} />
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
      >
        {filteredRestrooms.map((restroom) => (
          <RestroomCard
            key={restroom.id}
            restroom={restroom}
            onPress={() => handleRestroomPress(restroom)}
          />
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 100,
  },
});