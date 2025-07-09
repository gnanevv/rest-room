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
  StatusBar,
  PanResponder,
  TextInput,
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
import { RestroomBottomSheet } from '@/components/RestroomBottomSheet';
import { AnimatedSearchBar } from '@/components/AnimatedSearchBar';

interface MapWithBottomSheetProps {
  restrooms: Restroom[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');
const INITIAL_DELTA = 0.02; // ~1-2km

export function MapWithBottomSheet({
  restrooms,
  userLocation,
}: MapWithBottomSheetProps) {
  const { colors, theme } = useTheme();
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestrooms, setFilteredRestrooms] = useState<Restroom[]>(restrooms);

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    // Filter restrooms based on search query
    if (searchQuery.trim() === '') {
      setFilteredRestrooms(restrooms);
    } else {
      const filtered = restrooms.filter(restroom =>
        restroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restroom.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restroom.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestrooms(filtered);
    }
  }, [searchQuery, restrooms]);

  const handleMarkerPress = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
  };

  const closeBottomSheet = () => {
    setSelectedRestroom(null);
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((cam) => {
      const newZoom = Math.min((cam.zoom ?? 14) + 1, 20);
      cam.zoom = newZoom;
      mapRef.current?.animateCamera(cam, { duration: 300 });
    });
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((cam) => {
      const newZoom = Math.max((cam.zoom ?? 14) - 1, 3);
      cam.zoom = newZoom;
      mapRef.current?.animateCamera(cam, { duration: 300 });
    });
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          zoom: 15,
        },
        { duration: 400 }
      );
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

  // Floating Map Controls
  const FloatingMapControls = () => (
    <View style={styles.mapControls}>
      <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
        <BlurView
          intensity={theme === 'light' ? 70 : 50}
          style={styles.controlBlur}
        >
          <View
            style={[
              styles.controlContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <ZoomIn size={18} color={colors.primary} strokeWidth={2} />
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
              { backgroundColor: colors.surface },
            ]}
          >
            <ZoomOut size={18} color={colors.primary} strokeWidth={2} />
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
              { backgroundColor: colors.surface },
            ]}
          >
            <Locate size={18} color={colors.primary} strokeWidth={2} />
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={theme === 'light' ? lightStyle : darkStyle}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: userLocation?.latitude || 42.6977,
          longitude: userLocation?.longitude || 23.3219,
          latitudeDelta: INITIAL_DELTA,
          longitudeDelta: INITIAL_DELTA,
        }}
      >
        {filteredRestrooms.map((restroom) => (
          <Marker
            key={restroom.id}
            coordinate={{
              latitude: restroom.coordinates.latitude,
              longitude: restroom.coordinates.longitude,
            }}
            onPress={() => handleMarkerPress(restroom)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <Pin restroom={restroom} />
          </Marker>
        ))}
      </MapView>

      <AnimatedSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        suggestions={restrooms}
        onSuggestionPress={handleMarkerPress}
      />

      <FloatingMapControls />

      {selectedRestroom && (
        <RestroomBottomSheet
          restroom={selectedRestroom}
          onClose={closeBottomSheet}
          onNavigate={() => openInMaps(selectedRestroom)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 120,
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
});