import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Filter, Star, Euro, Accessibility, Clock } from 'lucide-react-native';
import { RestroomCard } from '@/components/RestroomCard';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';

export default function SearchScreen() {
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'cleanliness'>('distance');
  const [showFilters, setShowFilters] = useState(false);

  const sortedRestrooms = [...mockRestrooms].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'rating':
        return b.rating - a.rating;
      case 'cleanliness':
        return b.cleanliness - a.cleanliness;
      default:
        return 0;
    }
  });

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

  const getSortIcon = (type: typeof sortBy) => {
    switch (type) {
      case 'distance':
        return MapPin;
      case 'rating':
        return Star;
      case 'cleanliness':
        return Accessibility;
      default:
        return MapPin;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.title}>Търсене & Филтриране</Text>
        <Text style={styles.subtitle}>Намери точно това, което търсиш</Text>
      </LinearGradient>

      <View style={styles.sortContainer}>
        <View style={styles.sortHeader}>
          <Text style={styles.sortTitle}>Сортиране по:</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
          {[
            { key: 'distance', label: 'Разстояние', icon: MapPin },
            { key: 'rating', label: 'Рейтинг', icon: Star },
            { key: 'cleanliness', label: 'Чистота', icon: Accessibility },
          ].map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSortBy(key as typeof sortBy)}
              style={[
                styles.sortOption,
                sortBy === key && styles.sortOptionActive,
              ]}
            >
              <Icon
                size={20}
                color={sortBy === key ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === key && styles.sortOptionTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {sortedRestrooms.length} резултата
          </Text>
          <Text style={styles.resultsSort}>
            Сортирани по {sortBy === 'distance' ? 'разстояние' : sortBy === 'rating' ? 'рейтинг' : 'чистота'}
          </Text>
        </View>

        {sortedRestrooms.map((restroom) => (
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#BFDBFE',
  },
  sortContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    gap: 8,
  },
  sortOptionActive: {
    backgroundColor: '#3B82F6',
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsCount: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultsSort: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  bottomPadding: {
    height: 100,
  },
});