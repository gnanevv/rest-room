import React, { useState, useRef, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Text,
} from 'react-native';
import { BlurView } from 'expo-blur';

import darkStyle from '@/constants/mapStyle';
import lightStyle from '@/constants/mapStyleLight';
import Pin from '@/components/Pin';
import { ZoomIn, ZoomOut, Locate, RefreshCw } from 'lucide-react-native';
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
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRefresh?: () => void;
}

const { width, height } = Dimensions.get('window');
const INITIAL_DELTA = 0.02;

export function MapWithBottomSheet({
  restrooms,
  userLocation,
  initialRegion,
  onRefresh,
}: MapWithBottomSheetProps) {
  try {
    // IMMEDIATE safety check - if restrooms is undefined/null, return early
    if (!restrooms) {
      console.warn(
        'MapWithBottomSheet: restrooms prop is undefined/null, rendering fallback'
      );
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Loading map...</Text>
        </View>
      );
    }

    // Additional safety check for the restrooms array structure
    try {
      if (!Array.isArray(restrooms)) {
        console.warn(
          'MapWithBottomSheet: restrooms prop is not an array:',
          restrooms
        );
        return (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text>Invalid data format</Text>
          </View>
        );
      }
    } catch (error) {
      console.error(
        'MapWithBottomSheet: Error checking restrooms prop:',
        error
      );
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Error loading map</Text>
        </View>
      );
    }

    const { colors, theme } = useTheme();
    const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(
      null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRestrooms, setFilteredRestrooms] =
      useState<Restroom[]>(restrooms);
    const [mapRegion, setMapRegion] = useState<Region>(
      initialRegion || {
        latitude: 42.6977, // Sofia fallback
        longitude: 23.3219,
        latitudeDelta: INITIAL_DELTA,
        longitudeDelta: INITIAL_DELTA,
      }
    );

    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
      try {
        if (!Array.isArray(restrooms)) {
          console.warn('Restrooms is not an array in useEffect:', restrooms);
          setFilteredRestrooms([]);
          return;
        }

        if (searchQuery.trim() === '') {
          setFilteredRestrooms(restrooms);
        } else {
          const filtered = restrooms.filter(
            (restroom) =>
              restroom &&
              restroom.name &&
              restroom.address &&
              restroom.city &&
              (restroom.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                restroom.address
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                restroom.city.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setFilteredRestrooms(filtered);
        }
      } catch (error) {
        console.error('Error in useEffect for filtering restrooms:', error);
        setFilteredRestrooms([]);
      }
    }, [searchQuery, restrooms]);

    const handleMarkerPress = (restroom: Restroom) => {
      console.log('🎯 Marker pressed:', restroom.name);
      setSelectedRestroom(restroom);
    };

    const closeBottomSheet = () => {
      console.log('🔽 Closing bottom sheet');
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
      if (
        userLocation &&
        typeof userLocation.latitude === 'number' &&
        typeof userLocation.longitude === 'number' &&
        mapRef.current
      ) {
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

    const FloatingMapControls = () => (
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
          <BlurView
            intensity={theme === 'light' ? 80 : 60}
            style={styles.controlBlur}
          >
            <View
              style={[
                styles.controlContent,
                { backgroundColor: `${colors.surface}95` },
              ]}
            >
              <ZoomIn size={18} color={colors.primary} strokeWidth={2} />
            </View>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
          <BlurView
            intensity={theme === 'light' ? 80 : 60}
            style={styles.controlBlur}
          >
            <View
              style={[
                styles.controlContent,
                { backgroundColor: `${colors.surface}95` },
              ]}
            >
              <ZoomOut size={18} color={colors.primary} strokeWidth={2} />
            </View>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <BlurView
            intensity={theme === 'light' ? 80 : 60}
            style={styles.controlBlur}
          >
            <View
              style={[
                styles.controlContent,
                { backgroundColor: `${colors.surface}95` },
              ]}
            >
              <Locate size={18} color={colors.primary} strokeWidth={2} />
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Refresh button for real data */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (onRefresh) {
              onRefresh();
              console.log('🔄 Refresh button pressed');
            }
          }}
        >
          <BlurView
            intensity={theme === 'light' ? 80 : 60}
            style={styles.controlBlur}
          >
            <View
              style={[
                styles.controlContent,
                { backgroundColor: `${colors.surface}95` },
              ]}
            >
              <RefreshCw size={18} color={colors.primary} strokeWidth={2} />
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
          initialRegion={mapRegion}
          onRegionChangeComplete={(region) => {
            if (
              region &&
              typeof region.latitude === 'number' &&
              typeof region.longitude === 'number' &&
              typeof region.latitudeDelta === 'number' &&
              typeof region.longitudeDelta === 'number'
            ) {
              setMapRegion(region);
            }
          }}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {filteredRestrooms
            .filter(
              (restroom) =>
                restroom &&
                restroom.coordinates &&
                typeof restroom.coordinates.latitude === 'number' &&
                typeof restroom.coordinates.longitude === 'number' &&
                !isNaN(restroom.coordinates.latitude) &&
                !isNaN(restroom.coordinates.longitude)
            )
            .map((restroom) => (
              <Marker
                key={restroom.id}
                coordinate={{
                  latitude: restroom.coordinates.latitude,
                  longitude: restroom.coordinates.longitude,
                }}
                onPress={() => {
                  console.log('🎯 Marker pressed:', restroom.name);
                  handleMarkerPress(restroom);
                }}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 1 }}
              >
                <Pin restroom={restroom} />
              </Marker>
            ))}
        </MapView>

        <AnimatedSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          suggestions={restrooms.filter(
            (restroom) =>
              restroom && restroom.name && restroom.address && restroom.city
          )}
          onSuggestionPress={handleMarkerPress}
        />

        <FloatingMapControls />

        <RestroomBottomSheet
          restroom={selectedRestroom}
          onClose={closeBottomSheet}
          onNavigate={openInMaps}
        />
      </View>
    );
  } catch (error) {
    console.error('MapWithBottomSheet: Critical error in component:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Something went wrong loading the map</Text>
        <Text style={{ fontSize: 12, marginTop: 8 }}>
          {(error as Error)?.message || 'Unknown error'}
        </Text>
      </View>
    );
  }
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  controlBlur: {
    flex: 1,
    borderRadius: 16,
  },
  controlContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
