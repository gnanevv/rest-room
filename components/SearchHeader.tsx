import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Settings, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLocationPress: () => void;
  onSettingsPress: () => void;
}

export function SearchHeader({ 
  searchQuery, 
  onSearchChange, 
  onLocationPress, 
  onSettingsPress 
}: SearchHeaderProps) {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <LinearGradient
      colors={theme === 'light' ? ['#1E40AF', '#3B82F6'] : ['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>RestRoom</Text>
          <Text style={styles.subtitle}>България</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.actionButton}>
            {theme === 'light' ? (
              <Moon size={20} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <Sun size={20} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.actionButton}>
            <Settings size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Search size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Търси тоалетни или места..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
        <TouchableOpacity onPress={onLocationPress} style={[styles.locationButton, { backgroundColor: colors.background }]}>
          <MapPin size={20} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#BFDBFE',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  locationButton: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});