import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Search, X, MapPin, Star, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Restroom } from '@/types/restroom';

interface AnimatedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: Restroom[];
  onSuggestionPress: (restroom: Restroom) => void;
}

const { width } = Dimensions.get('window');

export function AnimatedSearchBar({
  searchQuery,
  onSearchChange,
  suggestions,
  onSuggestionPress,
}: AnimatedSearchBarProps) {
  const { colors, theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedWidth = useRef(new Animated.Value(52)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const filteredSuggestions = suggestions
    .filter(restroom =>
      searchQuery.length > 0 && (
        restroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restroom.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .slice(0, 5);

  const expandSearch = () => {
    setIsExpanded(true);
    
    Animated.parallel([
      Animated.spring(animatedWidth, {
        toValue: width - 40,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const collapseSearch = () => {
    setIsExpanded(false);
    onSearchChange('');
    
    Animated.parallel([
      Animated.spring(animatedWidth, {
        toValue: 52,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSuggestionPress = (restroom: Restroom) => {
    onSuggestionPress(restroom);
    // Auto-collapse when selecting suggestion
    collapseSearch();
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      collapseSearch();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            width: animatedWidth,
          },
        ]}
      >
        <LinearGradient
          colors={
            theme === 'light'
              ? [`${colors.surface}F0`, `${colors.background}F0`]
              : [`${colors.surface}F0`, `${colors.background}F0`]
          }
          style={styles.searchGradient}
        >
          <BlurView
            intensity={theme === 'light' ? 95 : 80}
            style={styles.searchBlur}
          >
            <View
              style={[
                styles.searchContent,
                { backgroundColor: `${colors.surface}95` },
              ]}
            >
              {!isExpanded ? (
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={expandSearch}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.searchButtonGradient}
                  >
                    <Search size={22} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.searchIconGradient}
                  >
                    <Search size={18} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      { opacity: animatedOpacity },
                    ]}
                  >
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Find amazing restrooms..."
                      placeholderTextColor={colors.textTertiary}
                      value={searchQuery}
                      onChangeText={onSearchChange}
                      onSubmitEditing={handleSearchSubmit}
                      onBlur={collapseSearch}
                      autoFocus
                    />
                  </Animated.View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={collapseSearch}
                    activeOpacity={0.8}
                  >
                    <X size={20} color={colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      {isExpanded && filteredSuggestions.length > 0 && (
        <Animated.View
          style={[
            styles.suggestionsContainer,
            {
              opacity: animatedOpacity,
              transform: [
                {
                  translateY: animatedOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={
              theme === 'light'
                ? [`${colors.surface}F5`, `${colors.background}F5`]
                : [`${colors.surface}F5`, `${colors.background}F5`]
            }
            style={styles.suggestionsGradient}
          >
            <BlurView
              intensity={theme === 'light' ? 95 : 80}
              style={styles.suggestionsBlur}
            >
              <View
                style={[
                  styles.suggestionsContent,
                  { backgroundColor: `${colors.surface}95` },
                ]}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredSuggestions.map((restroom, index) => (
                    <TouchableOpacity
                      key={restroom.id}
                      style={[
                        styles.suggestionItem,
                        { 
                          borderBottomColor: colors.border,
                          borderBottomWidth: index < filteredSuggestions.length - 1 ? 1 : 0,
                        },
                      ]}
                      onPress={() => handleSuggestionPress(restroom)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.suggestionIcon}
                      >
                        <MapPin size={16} color="#FFFFFF" strokeWidth={2} />
                      </LinearGradient>
                      
                      <View style={styles.suggestionContent}>
                        <Text
                          style={[styles.suggestionName, { color: colors.text }]}
                        >
                          {restroom.name}
                        </Text>
                        <Text
                          style={[
                            styles.suggestionAddress,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {restroom.address}
                        </Text>
                      </View>
                      
                      <View style={styles.suggestionMeta}>
                        <View style={styles.ratingContainer}>
                          <Star
                            size={14}
                            color={colors.warning}
                            fill={colors.warning}
                            strokeWidth={2}
                          />
                          <Text
                            style={[
                              styles.suggestionRating,
                              { color: colors.text },
                            ]}
                          >
                            {restroom.rating.toFixed(1)}
                          </Text>
                        </View>
                        {restroom.distance && (
                          <Text
                            style={[
                              styles.suggestionDistance,
                              { color: colors.textTertiary },
                            ]}
                          >
                            {restroom.distance.toFixed(1)} km
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </BlurView>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    right: 20,
    zIndex: 100,
  },
  searchContainer: {
    height: 56,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  searchGradient: {
    flex: 1,
    borderRadius: 20,
  },
  searchBlur: {
    flex: 1,
    borderRadius: 20,
  },
  searchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  searchInput: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
  },
  suggestionsContainer: {
    marginTop: 12,
    maxHeight: 300,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  suggestionsGradient: {
    flex: 1,
    borderRadius: 20,
  },
  suggestionsBlur: {
    flex: 1,
    borderRadius: 20,
  },
  suggestionsContent: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    lineHeight: 22,
  },
  suggestionAddress: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  suggestionMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionRating: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  suggestionDistance: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
});