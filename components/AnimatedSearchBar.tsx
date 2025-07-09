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
import { Search, X } from 'lucide-react-native';
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
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    setShowSuggestions(true);
    
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
    setShowSuggestions(false);
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
    collapseSearch();
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
        <BlurView
          intensity={theme === 'light' ? 80 : 60}
          style={styles.searchBlur}
        >
          <View
            style={[
              styles.searchContent,
              { backgroundColor: colors.surface },
            ]}
          >
            {!isExpanded ? (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={expandSearch}
              >
                <Search size={20} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <>
                <Search size={20} color={colors.textSecondary} strokeWidth={2} />
                <Animated.View
                  style={[
                    styles.inputContainer,
                    { opacity: animatedOpacity },
                  ]}
                >
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Търси тоалетни..."
                    placeholderTextColor={colors.textTertiary}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    autoFocus
                  />
                </Animated.View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={collapseSearch}
                >
                  <X size={20} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </BlurView>
      </Animated.View>

      {showSuggestions && filteredSuggestions.length > 0 && (
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
          <BlurView
            intensity={theme === 'light' ? 90 : 70}
            style={styles.suggestionsBlur}
          >
            <View
              style={[
                styles.suggestionsContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredSuggestions.map((restroom) => (
                  <TouchableOpacity
                    key={restroom.id}
                    style={[
                      styles.suggestionItem,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => handleSuggestionPress(restroom)}
                  >
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
                      <Text
                        style={[
                          styles.suggestionRating,
                          { color: colors.warning },
                        ]}
                      >
                        ★ {restroom.rating.toFixed(1)}
                      </Text>
                      {restroom.distance && (
                        <Text
                          style={[
                            styles.suggestionDistance,
                            { color: colors.textTertiary },
                          ]}
                        >
                          {restroom.distance.toFixed(1)} км
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
  },
  searchContainer: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  searchBlur: {
    flex: 1,
    borderRadius: 16,
  },
  searchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  searchInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
    maxHeight: 300,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionsBlur: {
    flex: 1,
    borderRadius: 16,
  },
  suggestionsContent: {
    flex: 1,
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  suggestionMeta: {
    alignItems: 'flex-end',
  },
  suggestionRating: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  suggestionDistance: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});