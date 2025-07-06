import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Filter, Euro, Accessibility, Star, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filters = [
    { id: 'free', label: 'Безплатно', icon: Euro },
    { id: 'accessible', label: 'Достъпно', icon: Accessibility },
    { id: 'high_rated', label: '4+ звезди', icon: Star },
    { id: 'nearby', label: 'Близо', icon: MapPin },
  ];

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId];
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);
          const IconComponent = filter.icon;
          
          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => toggleFilter(filter.id)}
              style={styles.filterButton}
              activeOpacity={0.8}
            >
              {isSelected ? (
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF']}
                  style={styles.filterButtonGradient}
                >
                  <IconComponent size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.filterTextSelected}>{filter.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterButtonDefault}>
                  <IconComponent size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.filterTextDefault}>{filter.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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