import React, { useState, useRef, useEffect } from 'react';
import ClusteredMapView from 'react-native-map-clustering';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import darkStyle from '@/constants/mapStyle';
import lightStyle from '@/constants/mapStyleLight';
import Pin from '@/components/Pin';
import {
  ZoomIn,
  ZoomOut,
  Locate,
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
const INITIAL_DELTA = 0.02;

export function MapWithBottomSheet({
  restrooms,
  userLocation,
}: MapWithBottomSheetProps) {
  const { colors, theme } = useTheme();
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestrooms, setFilteredRestrooms] = useState<Restroom[]>(restrooms);
  const [mapRegion, setMapRegion] = useState({
    latitude: userLocation?.latitude || 42.6977,
    longitude: userLocation?.longitude || 23.3219,
    latitudeDelta: INITIAL_DELTA,
    longitudeDelta: INITIAL_DELTA,
  });

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
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
    console.log('Marker pressed:', restroom.name);
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
      console.log(`Opening Apple Maps to ${restroom.name}...`);
    } else if (Platform.OS === 'android') {
      console.log(`Opening Google Maps to ${restroom.name}...`);
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
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <ClusteredMapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={theme === 'light' ? lightStyle : darkStyle}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={mapRegion}
        onRegionChangeComplete={setMapRegion}
        clusterColor={colors.primary}
        clusterTextColor="#FFFFFF"
        clusterFontFamily="Inter-Bold"
        radius={60}
        maxZoom={16}
        minZoom={1}
        extent={512}
        nodeSize={64}
        onClusterPress={(cluster, markers) => {
          console.log('Cluster pressed with', markers.length, 'markers');
          if (markers.length === 1) {
            // Single marker - show bottom sheet
            const restroom = markers[0].properties.restroom;
            if (restroom) {
              handleMarkerPress(restroom);
            }
          } else {
            // Multiple markers - zoom in
            const coordinates = markers.map(marker => ({
              latitude: marker.geometry.coordinates[1],
              longitude: marker.geometry.coordinates[0],
            }));
            
            if (mapRef.current) {
              mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }
          }
        }}
        renderMarker={(marker) => {
          const restroom = marker.properties.restroom;
          return (
            <Marker
              key={restroom.id}
              coordinate={{
                latitude: marker.geometry.coordinates[1],
                longitude: marker.geometry.coordinates[0],
              }}
              onPress={() => handleMarkerPress(restroom)}
              tracksViewChanges={false}
            >
              <Pin restroom={restroom} />
            </Marker>
          );
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
            tracksViewChanges={false}
            properties={{ restroom }}
          >
            <Pin restroom={restroom} />
          </Marker>
        ))}
      </ClusteredMapView>

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