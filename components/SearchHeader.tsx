import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, MapPin, Settings, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDarkMode 
          ? ['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)']
          : ['rgba(59, 130, 246, 0.95)', 'rgba(30, 64, 175, 0.95)']
        }
        style={styles.gradient}
      >
        <BlurView 
          intensity={Platform.OS === 'ios' ? 80 : 0} 
          tint={isDarkMode ? 'dark' : 'light'} 
          style={styles.blur}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.logoGradient}
                >
                  <Sparkles size={24} color={colors.primary} strokeWidth={2} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.title}>RestRoom</Text>
                <Text style={styles.subtitle}>Premium Experience</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <ThemeToggle size="small" />
              <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
                <Settings size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }]}>
              <Search size={20} color={isDarkMode ? colors.textSecondary : colors.textTertiary} strokeWidth={2} />
              <TextInput
                style={[styles.searchInput, { color: isDarkMode ? colors.text : colors.text }]}
                placeholder="Търси тоалетни или места..."
                placeholderTextColor={isDarkMode ? colors.textTertiary : colors.textSecondary}
                value={searchQuery}
                onChangeText={onSearchChange}
              />
            </View>
            <TouchableOpacity onPress={onLocationPress} style={[styles.locationButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }]}>
              <MapPin size={20} color={isDarkMode ? colors.primary : colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  gradient: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  blur: {
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 14,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  locationButton: {
    padding: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});