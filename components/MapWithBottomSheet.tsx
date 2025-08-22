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
} from 'react-native';
import { BlurView } from 'expo-blur';
import SuperCluster from 'react-native-maps-super-cluster';
import darkStyle from '@/constants/mapStyle';
import lightStyle from '@/constants/mapStyleLight';
import Pin from '@/components/Pin';
import { ZoomIn, ZoomOut, Locate } from 'lucide-react-native';
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
  const [mapRegion, setMapRegion] = useState<Region>({
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
      const filtered = restrooms.filter(
        (restroom) =>
          restroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restroom.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restroom.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestrooms(filtered);
    }
  }, [searchQuery, restrooms]);

  const handleMarkerPress = (restroom: Restroom) => {
    console.log('🎯 Marker pressed:', restroom.name);
    setSelectedRestroom(restroom);
  };

  const handleClusterPress = (cluster: any) => {
    const { coordinate, pointCount, clusterId } = cluster;
    
    if (pointCount === 1) {
      // Single marker in cluster - show details
      const restroom = cluster.properties?.restroom;
      if (restroom) {
        handleMarkerPress(restroom);
      }
    } else {
      // Multiple markers - zoom in
      if (mapRef.current) {
        const newDelta = mapRegion.latitudeDelta * 0.5;
        mapRef.current.animateToRegion({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: newDelta,
          longitudeDelta: newDelta,
        }, 500);
      }
    }
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

  // Transform restrooms for SuperCluster
  const clusterData = filteredRestrooms.map((restroom) => ({
    geometry: {
      type: 'Point' as const,
      coordinates: [restroom.coordinates.longitude, restroom.coordinates.latitude],
    },
    properties: {
      restroom,
      point_count: 1,
    },
  }));

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

      <SuperCluster
        data={clusterData}
        radius={60}
        maxZoom={16}
        minZoom={3}
        extent={512}
        nodeSize={64}
        region={mapRegion}
        onExplode={handleClusterPress}
        onImplode={handleClusterPress}
        onClusterPress={handleClusterPress}
        preserveClusterPressBehavior={false}
        edgePadding={{ top: 100, left: 50, bottom: 100, right: 50 }}
        animationEnabled={true}
        layoutAnimationConf={{
          type: 'spring',
          property: 'scaleXY',
          springDamping: 0.7,
          duration: 300,
        }}
        renderCluster={(cluster) => {
          const { coordinate, pointCount } = cluster;
          return (
            <Marker
              key={`cluster-${cluster.clusterId}`}
              coordinate={coordinate}
              onPress={() => handleClusterPress(cluster)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Pin count={pointCount} />
            </Marker>
          );
        }}
      >
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          customMapStyle={theme === 'light' ? lightStyle : darkStyle}
          showsUserLocation
          showsMyLocationButton={false}
          initialRegion={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {filteredRestrooms.map((restroom) => (
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
      </SuperCluster>

      <AnimatedSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        suggestions={restrooms}
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