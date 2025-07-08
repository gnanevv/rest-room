import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart, Star, MapPin } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RestroomCard } from '@/components/RestroomCard';
import { mockRestrooms } from '@/data/mockData';
import { Restroom } from '@/types/restroom';

export default function FavoritesScreen() {
  const { colors, isDarkMode } = useTheme();
  // For demo purposes, we'll use the top-rated restrooms as favorites
  const [favorites, setFavorites] = useState<Restroom[]>(
    mockRestrooms.filter(restroom => restroom.rating >= 4.5)
  );

  const handleRestroomPress = (restroom: Restroom) => {
    Alert.alert(
      restroom.name,
      `${restroom.address}\n\nРейтинг: ${restroom.rating}/5\nЧистота: ${restroom.cleanliness}/5\n\nСтатус: ${getAvailabilityText(restroom.availability)}`,
      [
        { text: 'Затвори', style: 'cancel' },
        { text: 'Навигация', onPress: () => handleNavigation(restroom) },
        { text: 'Премахни от любими', onPress: () => removeFavorite(restroom.id), style: 'destructive' },
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

  const removeFavorite = (restroomId: string) => {
    setFavorites(favorites.filter(restroom => restroom.id !== restroomId));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.headerContainer}>
        <BlurView intensity={80} tint={isDarkMode ? 'dark' : 'light'} style={styles.headerBlur}>
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(220, 38, 38, 0.95)', 'rgba(239, 68, 68, 0.95)']
              : ['rgba(220, 38, 38, 0.95)', 'rgba(239, 68, 68, 0.95)']
            }
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Heart size={32} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
                <View style={styles.headerText}>
                  <Text style={styles.title}>Любими места</Text>
                  <Text style={styles.subtitle}>Твоите избрани тоалетни</Text>
                </View>
              </View>
              <ThemeToggle size="small" />
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{favorites.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Любими</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {(favorites.reduce((sum, restroom) => sum + restroom.rating, 0) / favorites.length || 0).toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ср. рейтинг</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {favorites.filter(restroom => restroom.distance && restroom.distance <= 1).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Близо</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={64} color={colors.border} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Няма любими места</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Добави места в любими, за да ги виждаш тук
            </Text>
          </View>
        ) : (
          favorites.map((restroom) => (
            <RestroomCard
              key={restroom.id}
              restroom={restroom}
              onPress={() => handleRestroomPress(restroom)}
              isFavorite={true}
              onFavorite={() => removeFavorite(restroom.id)}
            />
          ))
        )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
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
    color: '#FECACA',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 100,
  },
});