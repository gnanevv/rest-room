import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Filter, Euro, Accessibility, Star, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const { colors, isDarkMode } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const animatedValues = React.useRef(
    filters.reduce((acc, filter) => {
      acc[filter.id] = new Animated.Value(0);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  const filters = [
    { id: 'free', label: 'Безплатно', icon: Euro },
    { id: 'accessible', label: 'Достъпно', icon: Accessibility },
    { id: 'high_rated', label: '4+ звезди', icon: Star },
    { id: 'nearby', label: 'Близо', icon: MapPin },
  ];

  const toggleFilter = (filterId: string) => {
    const isSelected = selectedFilters.includes(filterId);
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId];
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);

    // Animate the filter button
    Animated.spring(animatedValues[filterId], {
      toValue: isSelected ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);
          const scale = animatedValues[filter.id].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          });
          const IconComponent = filter.icon;
          
          return (
            <Animated.View
              key={filter.id}
              style={[styles.filterButton, { transform: [{ scale }] }]}
            >
              <TouchableOpacity
                onPress={() => toggleFilter(filter.id)}
                activeOpacity={0.8}
                style={styles.filterTouchable}
              >
                {isSelected ? (
                  <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={styles.filterBlur}>
                    <LinearGradient
                      colors={isDarkMode 
                        ? [colors.primary, colors.primaryDark]
                        : ['#3B82F6', '#1E40AF']
                      }
                      style={styles.filterButtonGradient}
                    >
                      <IconComponent size={16} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.filterTextSelected}>{filter.label}</Text>
                    </LinearGradient>
                  </BlurView>
                ) : (
                  <View style={[styles.filterButtonDefault, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }]}>
                    <IconComponent size={16} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.filterTextDefault, { color: colors.textSecondary }]}>{filter.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  filterTouchable: {
    borderRadius: 20,
  },
  filterBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterButtonDefault: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  filterTextSelected: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  filterTextDefault: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});