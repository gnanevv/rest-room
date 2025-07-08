import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Filter, Star, Euro, Accessibility, Clock } from 'lucide-react-native';
import { RestroomCard } from '@/components/RestroomCard';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';

export default function SearchScreen() {
  const { colors, theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={theme === 'light' ? ['#1E40AF', '#3B82F6'] : ['#7C3AED', '#8B5CF6']}
        style={styles.header}
      >
        <Text style={styles.title}>Търсене & Филтриране</Text>
        <Text style={styles.subtitle}>Намери точно това, което търсиш</Text>
      </LinearGradient>

      <View style={[styles.sortContainer, { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }]}>
        <View style={styles.sortHeader}>
          <Text style={[styles.sortTitle, { color: colors.text }]}>Сортиране по:</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={24} color={colors.textSecondary} strokeWidth={2} />
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
                { 
                  backgroundColor: sortBy === key ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon
                size={20}
                color={sortBy === key ? colors.background : colors.textSecondary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  { color: sortBy === key ? colors.background : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.resultsHeader, { 
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        }]}>
          <Text style={[styles.resultsCount, { color: colors.text }]}>
            {sortedRestrooms.length} резултата
          </Text>
          <Text style={[styles.resultsSort, { color: colors.textSecondary }]}>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    gap: 8,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  scrollView: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  resultsCount: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  resultsSort: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  bottomPadding: {
    height: 100,
  },
});