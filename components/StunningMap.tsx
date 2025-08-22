import React, { useState, useRef, useEffect } from 'react';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import darkStyle from '@/constants/mapStyle';
import lightStyle from '@/constants/mapStyleLight';
import Pin from '@/components/Pin';
import {
  MapPin,
  Star,
  Euro,
  Accessibility,
  Navigation,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  Filter,
  Layers,
  Search,
  Heart,
  Camera,
  Clock,
  Users,
  ChevronDown,
  ArrowLeft,
  Share,
  Bookmark,
  Route,
  Navigation2,
  ChevronUp,
  Eye,
  Target,
  Settings,
  Menu,
} from 'lucide-react-native';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';

interface StunningMapProps {
  restrooms: Restroom[];
  onRestroomPress: (restroom: Restroom) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');
const INITIAL_DELTA = 0.02; // ~1-2km
const HEADER_HEIGHT = 120;
const BOTTOM_SAFE_AREA = 40;

export function StunningMap({
  restrooms,
  onRestroomPress,
  userLocation,
}: StunningMapProps) {
  const { colors, theme } = useTheme();
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(
    null
  );
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  // Animation for filter panel
  const filterAnimation = useRef(new Animated.Value(0)).current;
  // Fallback location if parent doesn’t provide one
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const popupAnimation = useRef(new Animated.Value(0)).current;

  // Get user location once on mount if not supplied via props
  useEffect(() => {
    (async () => {
      if (userLocation) return; // parent already provides
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (e) {
        console.warn('Location error', e);
      }
    })();
  }, []);

  const effectiveLocation = userLocation || currentLocation;
  const mapRef = useRef<MapView | null>(null);
  // Keep legacy animated values for components still using them
  const mapPan = useRef(new Animated.ValueXY()).current;
  const mapScale = useRef(new Animated.Value(1)).current;

  // Enhanced color palette for both themes
  const mapColors =
    theme === 'light'
      ? {
          primary: '#4F46E5',
          primaryLight: '#818CF8',
          secondary: '#06B6D4',
          accent: '#F59E0B',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          glass: 'rgba(255, 255, 255, 0.95)',
          glassDark: 'rgba(248, 250, 252, 0.9)',
          shadow: 'rgba(0, 0, 0, 0.1)',
          text: '#1E293B',
          textLight: '#64748B',
          border: '#E2E8F0',
          mapBg: ['#F0F9FF', '#E0F2FE', '#F8FAFC'] as const,
          streetMajor: '#CBD5E1',
          streetMinor: '#E2E8F0',
        }
      : {
          primary: '#818CF8',
          primaryLight: '#A5B4FC',
          secondary: '#22D3EE',
          accent: '#FBBF24',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          background: '#0F172A',
          surface: '#1E293B',
          glass: 'rgba(15, 23, 42, 0.95)',
          glassDark: 'rgba(30, 41, 59, 0.9)',
          shadow: 'rgba(0, 0, 0, 0.3)',
          text: '#F8FAFC',
          textLight: '#CBD5E1',
          border: '#334155',
          mapBg: ['#0F172A', '#1E293B', '#334155'] as const,
          streetMajor: '#475569',
          streetMinor: '#334155',
        };

  const getMarkerColor = (restroom: Restroom) => {
    if (restroom.availability === 'out_of_order') return mapColors.error;
    if (restroom.availability === 'occupied') return mapColors.warning;
    if (restroom.rating >= 4.5) return mapColors.success;
    if (restroom.rating >= 4.0) return mapColors.primary;
    return mapColors.secondary;
  };

  const filteredRestrooms = restrooms.filter((restroom) => {
    const matchesSearch =
      restroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restroom.address.toLowerCase().includes(searchQuery.toLowerCase());

    switch (selectedFilter) {
      case 'available':
        return matchesSearch && restroom.availability === 'available';
      case 'high_rated':
        return matchesSearch && restroom.rating >= 4.5;
      case 'free':
        return matchesSearch && !restroom.isPaid;
      case 'accessible':
        return matchesSearch && restroom.accessibility;
      default:
        return matchesSearch;
    }
  });

  // Enhanced Pan Responder for smooth map interaction
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      mapPan.setOffset({
        x: (mapPan.x as any)._value,
        y: (mapPan.y as any)._value,
      });
    },
    onPanResponderMove: (evt, gestureState) => {
      // Smooth panning with boundaries
      const newX = Math.max(
        -width * 0.8,
        Math.min(width * 0.8, gestureState.dx)
      );
      const newY = Math.max(
        -height * 0.5,
        Math.min(height * 0.5, gestureState.dy)
      );

      mapPan.setValue({ x: newX, y: newY });
    },
    onPanResponderRelease: () => {
      mapPan.flattenOffset();

      // Smooth bounce back if out of bounds
      const currentX = (mapPan.x as any)._value;
      const currentY = (mapPan.y as any)._value;

      if (
        Math.abs(currentX) > width * 0.6 ||
        Math.abs(currentY) > height * 0.4
      ) {
        Animated.spring(mapPan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          tension: 80,
          friction: 8,
        }).start();
      }
    },
  });

  const handleMarkerPress = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
    Animated.spring(popupAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closePopup = () => {
    Animated.spring(popupAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setSelectedRestroom(null);
    });
  };

  const toggleFilters = () => {
    const next = !showFilters;
    setShowFilters(next);
    Animated.spring(filterAnimation, {
      toValue: next ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((cam) => {
      const newZoom = Math.min((cam.zoom ?? 14) + 1, 20);
      cam.zoom = newZoom;
      mapRef.current?.animateCamera(cam, { duration: 300 });
    });
    const newZoom = Math.min(mapZoom * 1.5, 3);
    setMapZoom(newZoom);
    Animated.spring(mapScale, {
      toValue: newZoom,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((cam) => {
      const newZoom = Math.max((cam.zoom ?? 14) - 1, 3);
      cam.zoom = newZoom;
      mapRef.current?.animateCamera(cam, { duration: 300 });
    });
    const newZoom = Math.max(mapZoom / 1.5, 0.5);
    setMapZoom(newZoom);
    Animated.spring(mapScale, {
      toValue: newZoom,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const centerOnUser = () => {
    if (effectiveLocation && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: effectiveLocation.latitude,
            longitude: effectiveLocation.longitude,
          },
          zoom: 15,
        },
        { duration: 400 }
      );
    }

    if (effectiveLocation) {
      Animated.spring(mapPan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const openInMaps = (restroom: Restroom) => {
    const { latitude, longitude } = restroom.coordinates;

    if (Platform.OS === 'ios') {
      Alert.alert(
        'Навигация',
        `Отваряне на Apple Maps към ${restroom.name}...`
      );
    } else if (Platform.OS === 'android') {
      Alert.alert(
        'Навигация',
        `Отваряне на Google Maps към ${restroom.name}...`
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  };

  // ---- REAL GOOGLE/APPLE MAP ----
  const StunningMapBackground = () => (
    <Animated.View
      style={[
        styles.mapBackground,
        {
          transform: [
            { translateX: mapPan.x },
            { translateY: mapPan.y },
            { scale: mapScale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient colors={mapColors.mapBg} style={styles.mapGradient}>
        {/* Enhanced street pattern with organic curves */}
        <View style={styles.streetPattern}>
          {/* Major boulevards with curves */}
          <View
            style={[
              styles.majorStreet,
              {
                top: '15%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '8deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.majorStreet,
              {
                top: '35%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '-12deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.majorStreet,
              {
                top: '55%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '5deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.majorStreet,
              {
                top: '75%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '-8deg' }],
              },
            ]}
          />

          {/* Vertical streets */}
          <View
            style={[
              styles.majorStreet,
              {
                left: '20%',
                width: 4,
                height: '100%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '3deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.majorStreet,
              {
                left: '45%',
                width: 5,
                height: '100%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '-5deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.majorStreet,
              {
                left: '70%',
                width: 3,
                height: '100%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '7deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.majorStreet,
              {
                left: '85%',
                width: 3,
                height: '100%',
                backgroundColor: mapColors.streetMajor,
                transform: [{ rotate: '-4deg' }],
              },
            ]}
          />

          {/* Minor streets grid with organic feel */}
          {Array.from({ length: 20 }, (_, i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.minorStreet,
                {
                  top: `${(i + 1) * 4.5}%`,
                  backgroundColor: mapColors.streetMinor,
                  opacity: 0.4,
                  transform: [{ rotate: `${Math.sin(i * 0.5) * 2}deg` }],
                },
              ]}
            />
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.minorStreet,
                {
                  left: `${(i + 1) * 6.5}%`,
                  width: 1,
                  height: '100%',
                  backgroundColor: mapColors.streetMinor,
                  opacity: 0.4,
                  transform: [{ rotate: `${Math.cos(i * 0.7) * 3}deg` }],
                },
              ]}
            />
          ))}
        </View>

        {/* Beautiful animated landmarks */}
        <View style={[styles.landmark, { top: '12%', left: '15%' }]}>
          <LinearGradient
            colors={[mapColors.success, `${mapColors.success}80`]}
            style={styles.landmarkGradient}
          />
          <View
            style={[
              styles.landmarkPulse,
              { backgroundColor: `${mapColors.success}30` },
            ]}
          />
        </View>
        <View
          style={[
            styles.landmark,
            { top: '65%', left: '75%', width: 35, height: 35 },
          ]}
        >
          <LinearGradient
            colors={[mapColors.primary, `${mapColors.primary}80`]}
            style={styles.landmarkGradient}
          />
          <View
            style={[
              styles.landmarkPulse,
              { backgroundColor: `${mapColors.primary}30` },
            ]}
          />
        </View>
        <View
          style={[
            styles.landmark,
            { top: '40%', left: '85%', width: 25, height: 25 },
          ]}
        >
          <LinearGradient
            colors={[mapColors.accent, `${mapColors.accent}80`]}
            style={styles.landmarkGradient}
          />
        </View>
        <View
          style={[
            styles.landmark,
            { top: '25%', left: '60%', width: 30, height: 30 },
          ]}
        >
          <LinearGradient
            colors={[mapColors.secondary, `${mapColors.secondary}80`]}
            style={styles.landmarkGradient}
          />
        </View>

        {/* Enhanced Restroom Markers with animations */}
        {filteredRestrooms.map((restroom, index) => {
          const x = 8 + (index % 6) * 15 + Math.sin(index * 0.8) * 8;
          const y = 10 + Math.floor(index / 6) * 12 + Math.cos(index * 0.6) * 6;

          return (
            <TouchableOpacity
              key={restroom.id}
              style={[
                styles.stunningMarker,
                {
                  left: `${Math.min(x, 90)}%`,
                  top: `${Math.min(y, 85)}%`,
                },
              ]}
              onPress={() => handleMarkerPress(restroom)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.markerContainer,
                  {
                    transform: [
                      {
                        scale: selectedRestroom?.id === restroom.id ? 1.5 : 1,
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    getMarkerColor(restroom),
                    `${getMarkerColor(restroom)}CC`,
                  ]}
                  style={styles.markerGradient}
                >
                  <View style={styles.markerInner}>
                    <MapPin size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  {restroom.rating >= 4.5 && (
                    <View style={styles.markerBadge}>
                      <Star
                        size={10}
                        color="#FFFFFF"
                        fill="#FFFFFF"
                        strokeWidth={2}
                      />
                    </View>
                  )}
                </LinearGradient>

                {/* Enhanced pulsing effect */}
                {restroom.rating >= 4.5 && (
                  <Animated.View
                    style={[
                      styles.markerPulse,
                      { backgroundColor: `${getMarkerColor(restroom)}40` },
                    ]}
                  />
                )}

                {/* Availability indicator */}
                <View
                  style={[
                    styles.availabilityDot,
                    { backgroundColor: getMarkerColor(restroom) },
                  ]}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}

        {/* Enhanced User Location with animation */}
        {userLocation && (
          <View style={[styles.userLocation, { left: '50%', top: '50%' }]}>
            <LinearGradient
              colors={[mapColors.primary, mapColors.primaryLight]}
              style={styles.userLocationGradient}
            >
              <View
                style={[
                  styles.userLocationInner,
                  { backgroundColor: mapColors.background },
                ]}
              />
            </LinearGradient>
            <Animated.View
              style={[
                styles.userLocationPulse,
                { borderColor: mapColors.primary },
              ]}
            />
            <Animated.View
              style={[
                styles.userLocationPulse2,
                { borderColor: mapColors.primary },
              ]}
            />
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  // Minimalist Floating Header
  const FloatingHeader = () => (
    <View style={styles.floatingHeaderContainer}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <BlurView
        intensity={theme === 'light' ? 80 : 60}
        style={styles.floatingHeaderBlur}
      >
        <View
          style={[styles.floatingHeader, { backgroundColor: mapColors.glass }]}
        >
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: mapColors.surface },
            ]}
          >
            <Menu size={20} color={mapColors.text} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: mapColors.text }]}>
              RestRoom София
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: mapColors.textLight }]}
            >
              {filteredRestrooms.length} места наблизо
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: mapColors.surface },
            ]}
            onPress={toggleFilters}
          >
            <Filter size={20} color={mapColors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );

  // Enhanced Filter Panel
  const EnhancedFilterPanel = () => (
    <Animated.View
      style={[
        styles.filterPanel,
        {
          transform: [
            {
              translateY: filterAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-150, 0],
              }),
            },
          ],
          opacity: filterAnimation,
        },
      ]}
    >
      <BlurView
        intensity={theme === 'light' ? 90 : 70}
        style={styles.filterPanelBlur}
      >
        <View
          style={[
            styles.filterPanelContent,
            { backgroundColor: mapColors.glass },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {[
              {
                key: 'all',
                label: 'Всички',
                icon: Layers,
                count: restrooms.length,
              },
              {
                key: 'available',
                label: 'Свободни',
                icon: Target,
                count: restrooms.filter((r) => r.availability === 'available')
                  .length,
              },
              {
                key: 'high_rated',
                label: 'Топ',
                icon: Star,
                count: restrooms.filter((r) => r.rating >= 4.5).length,
              },
              {
                key: 'free',
                label: 'Безплатни',
                icon: Euro,
                count: restrooms.filter((r) => !r.isPaid).length,
              },
              {
                key: 'accessible',
                label: 'Достъпни',
                icon: Accessibility,
                count: restrooms.filter((r) => r.accessibility).length,
              },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedFilter === filter.key
                        ? mapColors.primary
                        : mapColors.surface,
                    borderColor:
                      selectedFilter === filter.key
                        ? mapColors.primary
                        : mapColors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <filter.icon
                  size={16}
                  color={
                    selectedFilter === filter.key
                      ? mapColors.background
                      : mapColors.text
                  }
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        selectedFilter === filter.key
                          ? mapColors.background
                          : mapColors.text,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
                <View
                  style={[
                    styles.filterChipBadge,
                    {
                      backgroundColor:
                        selectedFilter === filter.key
                          ? mapColors.background
                          : mapColors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipBadgeText,
                      {
                        color:
                          selectedFilter === filter.key
                            ? mapColors.primary
                            : mapColors.background,
                      },
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BlurView>
    </Animated.View>
  );

  // Floating Map Controls
  const FloatingMapControls = () => (
    <View style={styles.mapControls}>
      <TouchableOpacity
        style={styles.controlButton}
        onPress={() =>
          Alert.alert('Слоеве', 'Превключване между различни слоеве на картата')
        }
      >
        <BlurView
          intensity={theme === 'light' ? 70 : 50}
          style={styles.controlBlur}
        >
          <View
            style={[
              styles.controlContent,
              { backgroundColor: mapColors.glass },
            ]}
          >
            <Layers size={18} color={mapColors.primary} strokeWidth={2} />
          </View>
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
        <BlurView
          intensity={theme === 'light' ? 70 : 50}
          style={styles.controlBlur}
        >
          <View
            style={[
              styles.controlContent,
              { backgroundColor: mapColors.glass },
            ]}
          >
            <ZoomIn size={18} color={mapColors.primary} strokeWidth={2} />
          </View>
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
        <BlurView
          intensity={theme === 'light' ? 70 : 50}
          style={styles.controlBlur}
        >
          <View
            style={[
              styles.controlContent,
              { backgroundColor: mapColors.glass },
            ]}
          >
            <ZoomOut size={18} color={mapColors.primary} strokeWidth={2} />
          </View>
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
        <BlurView
          intensity={theme === 'light' ? 70 : 50}
          style={styles.controlBlur}
        >
          <View
            style={[
              styles.controlContent,
              { backgroundColor: mapColors.glass },
            ]}
          >
            <Locate size={18} color={mapColors.primary} strokeWidth={2} />
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  );

  // Enhanced Popup with better design
  const EnhancedPopup = () => {
    if (!selectedRestroom) return null;

    return (
      <Animated.View
        style={[
          styles.popup,
          {
            transform: [
              {
                scale: popupAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
              {
                translateY: popupAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: popupAnimation,
          },
        ]}
      >
        <BlurView
          intensity={theme === 'light' ? 90 : 70}
          style={styles.popupBlur}
        >
          <View
            style={[styles.popupContent, { backgroundColor: mapColors.glass }]}
          >
            <View style={styles.popupHeader}>
              <View style={styles.popupTitleContainer}>
                <View
                  style={[
                    styles.popupStatusIndicator,
                    { backgroundColor: getMarkerColor(selectedRestroom) },
                  ]}
                />
                <View style={styles.popupTitleContent}>
                  <Text style={[styles.popupTitle, { color: mapColors.text }]}>
                    {selectedRestroom.name}
                  </Text>
                  <Text
                    style={[
                      styles.popupAddress,
                      { color: mapColors.textLight },
                    ]}
                  >
                    {selectedRestroom.address}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.popupCloseButton,
                  { backgroundColor: mapColors.surface },
                ]}
                onPress={closePopup}
              >
                <X size={18} color={mapColors.textLight} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.popupMeta}>
              <View style={styles.popupRating}>
                <Star
                  size={16}
                  color={mapColors.accent}
                  fill={mapColors.accent}
                  strokeWidth={2}
                />
                <Text
                  style={[styles.popupRatingText, { color: mapColors.text }]}
                >
                  {selectedRestroom.rating.toFixed(1)}
                </Text>
                <Text
                  style={[styles.popupReviews, { color: mapColors.textLight }]}
                >
                  ({selectedRestroom.reviews.length})
                </Text>
              </View>

              {selectedRestroom.distance && (
                <Text
                  style={[styles.popupDistance, { color: mapColors.textLight }]}
                >
                  {selectedRestroom.distance.toFixed(1)} км
                </Text>
              )}
            </View>

            <View style={styles.popupAmenities}>
              {selectedRestroom.accessibility && (
                <View
                  style={[
                    styles.popupAmenityBadge,
                    { backgroundColor: mapColors.surface },
                  ]}
                >
                  <Accessibility
                    size={12}
                    color={mapColors.success}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.popupAmenityText,
                      { color: mapColors.textLight },
                    ]}
                  >
                    Достъпно
                  </Text>
                </View>
              )}
              {selectedRestroom.isPaid && (
                <View
                  style={[
                    styles.popupAmenityBadge,
                    { backgroundColor: mapColors.surface },
                  ]}
                >
                  <Euro size={12} color={mapColors.warning} strokeWidth={2} />
                  <Text
                    style={[
                      styles.popupAmenityText,
                      { color: mapColors.textLight },
                    ]}
                  >
                    {typeof selectedRestroom.price === 'number'
                      ? selectedRestroom.price.toFixed(2)
                      : '0.00'}{' '}
                    лв
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.popupAmenityBadge,
                  { backgroundColor: mapColors.surface },
                ]}
              >
                <Clock size={12} color={mapColors.textLight} strokeWidth={2} />
                <Text
                  style={[
                    styles.popupAmenityText,
                    { color: mapColors.textLight },
                  ]}
                >
                  Отворено
                </Text>
              </View>
            </View>

            <View style={styles.popupActions}>
              <TouchableOpacity
                style={[
                  styles.popupActionButton,
                  { backgroundColor: mapColors.surface },
                ]}
                onPress={() => onRestroomPress(selectedRestroom)}
              >
                <Eye size={16} color={mapColors.text} strokeWidth={2} />
                <Text
                  style={[styles.popupActionText, { color: mapColors.text }]}
                >
                  Детайли
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.popupPrimaryButton,
                  { backgroundColor: mapColors.primary },
                ]}
                onPress={() => openInMaps(selectedRestroom)}
              >
                <Navigation2
                  size={16}
                  color={mapColors.background}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.popupPrimaryText,
                    { color: mapColors.background },
                  ]}
                >
                  Навигация
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: mapColors.background }]}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: userLocation?.latitude || 42.6977,
          longitude: userLocation?.longitude || 23.3219,
          latitudeDelta: INITIAL_DELTA,
          longitudeDelta: INITIAL_DELTA,
        }}
      >
        {filteredRestrooms.map((r) => (
          <Marker
            key={r.id}
            coordinate={{
              latitude: r.coordinates.latitude,
              longitude: r.coordinates.longitude,
            }}
            tappable
            onPress={() => handleMarkerPress(r)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <Pin restroom={r} />
          </Marker>
        ))}
        <EnhancedPopup />
      </MapView>
      <FloatingHeader />
      <EnhancedFilterPanel />
      <FloatingMapControls />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Map Background Styles - FULL SCREEN
  mapBackground: {
    flex: 1,
    width: width,
    height: height,
  },
  mapGradient: {
    flex: 1,
    position: 'relative',
  },
  streetPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  majorStreet: {
    position: 'absolute',
    height: 5,
    width: '100%',
    opacity: 0.8,
    borderRadius: 2,
  },
  minorStreet: {
    position: 'absolute',
    height: 1,
    width: '100%',
  },
  landmark: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  landmarkGradient: {
    flex: 1,
    borderRadius: 20,
    opacity: 0.6,
  },
  landmarkPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -10,
    left: -10,
    opacity: 0.4,
  },

  // Enhanced Marker Styles
  stunningMarker: {
    position: 'absolute',
    zIndex: 20,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: -1,
  },
  availabilityDot: {
    position: 'absolute',
    bottom: -6,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  // Enhanced User Location Styles
  userLocation: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    transform: [{ translateX: -16 }, { translateY: -16 }],
    zIndex: 15,
  },
  userLocationGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    top: -10,
    left: -10,
    opacity: 0.5,
  },
  userLocationPulse2: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    top: -20,
    left: -20,
    opacity: 0.3,
  },

  // Floating Header Styles
  floatingHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  floatingHeaderBlur: {
    marginTop: 50,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },

  // Enhanced Filter Panel Styles
  filterPanel: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  filterPanelBlur: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  filterPanelContent: {
    paddingVertical: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  filterChipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterChipBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },

  // Floating Map Controls Styles
  mapControls: {
    position: 'absolute',
    top: 180,
    right: 20,
    gap: 12,
    zIndex: 70,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  controlBlur: {
    flex: 1,
    borderRadius: 16,
  },
  controlContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Enhanced Popup Styles
  popup: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 90,
  },
  popupBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  popupContent: {
    padding: 20,
    borderRadius: 20,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  popupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  popupStatusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
  },
  popupTitleContent: {
    flex: 1,
    marginLeft: 12,
  },
  popupTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  popupAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  popupCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  popupRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  popupRatingText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  popupReviews: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  popupDistance: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  popupAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  popupAmenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  popupAmenityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  popupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  popupActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  popupActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  popupPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  popupPrimaryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
