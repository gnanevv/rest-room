import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, MapPin, Filter, Star, Euro, Accessibility, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RestroomCard } from '@/components/RestroomCard';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';

export default function SearchScreen() {
  const { colors, isDarkMode } = useTheme();
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
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      <View style={styles.headerContainer}>
        <BlurView intensity={80} tint={isDarkMode ? 'dark' : 'light'} style={styles.headerBlur}>
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)']
              : ['rgba(30, 64, 175, 0.95)', 'rgba(59, 130, 246, 0.95)']
            }
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.title}>Търсене & Филтриране</Text>
                <Text style={styles.subtitle}>Намери точно това, което търсиш</Text>
              </View>
              <ThemeToggle size="small" />
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      <View style={[styles.sortContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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
                sortBy === key && styles.sortOptionActive,
                { 
                  backgroundColor: sortBy === key ? colors.primary : colors.surfaceVariant,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon
                size={20}
                color={sortBy === key ? '#FFFFFF' : colors.textSecondary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === key && styles.sortOptionTextActive,
                  { color: sortBy === key ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.resultsHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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
  headerContainer: {
    paddingTop: 44,
    paddingBottom: 24,
  },
  headerBlur: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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