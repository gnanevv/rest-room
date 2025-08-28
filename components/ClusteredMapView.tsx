import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import darkStyle from '@/constants/mapStyle';
import lightStyle from '@/constants/mapStyleLight';
import Pin from '@/components/Pin';
import { ZoomIn, ZoomOut, Locate, RefreshCw } from 'lucide-react-native';
import { Restroom } from '@/types/restroom';
import { useTheme } from '@/hooks/useTheme';
import { RestroomBottomSheet } from '@/components/RestroomBottomSheet';
import { AnimatedSearchBar } from '@/components/AnimatedSearchBar';
import { LinearGradient } from 'expo-linear-gradient';

interface ClusteredMapViewProps {
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

interface ClusterMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  pointCount?: number;
  clusterId?: number;
  restroom?: Restroom;
}

const { width, height } = Dimensions.get('window');
const INITIAL_DELTA = 0.02;

export function ClusteredMapView({
  restrooms,
  userLocation,
  initialRegion,
  onRefresh,
}: ClusteredMapViewProps) {
  const { colors, theme } = useTheme();
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestrooms, setFilteredRestrooms] = useState<Restroom[]>(restrooms);
  const [mapRegion, setMapRegion] = useState<Region>(
    initialRegion || {
      latitude: 42.6977,
      longitude: 23.3219,
      latitudeDelta: INITIAL_DELTA,
      longitudeDelta: INITIAL_DELTA,
    }
  );

  const mapRef = useRef<MapView | null>(null);

  // Animation values for cluster expansion
  const clusterScale = useSharedValue(1);

  // Safety check for restrooms
  if (!restrooms || !Array.isArray(restrooms)) {
    console.warn('ClusteredMapView: Invalid restrooms data');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  // Filter restrooms based on search
  useEffect(() => {
    try {
      if (!Array.isArray(restrooms)) {
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
            (restroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              restroom.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
              restroom.city.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredRestrooms(filtered);
      }
    } catch (error) {
      console.error('Error filtering restrooms:', error);
      setFilteredRestrooms([]);
    }
  }, [searchQuery, restrooms]);

  // Simple clustering logic based on proximity
  const clusteredMarkers = useMemo(() => {
    const validRestrooms = filteredRestrooms.filter(
      (restroom) =>
        restroom &&
        restroom.coordinates &&
        typeof restroom.coordinates.latitude === 'number' &&
        typeof restroom.coordinates.longitude === 'number' &&
        !isNaN(restroom.coordinates.latitude) &&
        !isNaN(restroom.coordinates.longitude)
    );

    // Simple clustering: group nearby restrooms
    const clusters: Array<{
      id: string;
      coordinate: { latitude: number; longitude: number };
      restrooms: Restroom[];
      isCluster: boolean;
    }> = [];
    const processed = new Set<string>();
    const clusterRadius = 0.005; // ~500m

    validRestrooms.forEach((restroom) => {
      if (processed.has(restroom.id)) return;

      const nearby = validRestrooms.filter((other) => {
        if (processed.has(other.id) || other.id === restroom.id) return false;
        
        const distance = Math.sqrt(
          Math.pow(restroom.coordinates.latitude - other.coordinates.latitude, 2) +
          Math.pow(restroom.coordinates.longitude - other.coordinates.longitude, 2)
        );
        
        return distance < clusterRadius;
      });

      if (nearby.length > 0) {
        // Create cluster
        const allRestrooms = [restroom, ...nearby];
        const centerLat = allRestrooms.reduce((sum, r) => sum + r.coordinates.latitude, 0) / allRestrooms.length;
        const centerLng = allRestrooms.reduce((sum, r) => sum + r.coordinates.longitude, 0) / allRestrooms.length;
        
        clusters.push({
          id: `cluster-${restroom.id}`,
          coordinate: { latitude: centerLat, longitude: centerLng },
          restrooms: allRestrooms,
          isCluster: true,
        });
        
        allRestrooms.forEach(r => processed.add(r.id));
      } else {
        // Individual marker
        clusters.push({
          id: restroom.id,
          coordinate: restroom.coordinates,
          restrooms: [restroom],
          isCluster: false,
        });
        processed.add(restroom.id);
      }
    });

    return clusters;
  }, [filteredRestrooms, mapRegion]);

  const handleMarkerPress = (restroom: Restroom) => {
    console.log('🎯 Marker pressed:', restroom.name);
    setSelectedRestroom(restroom);
  };

  const handleClusterPress = (cluster: any) => {
    if (!mapRef.current) return;

    try {
      // Animate cluster expansion
      clusterScale.value = withSpring(1.2, { damping: 15 }, () => {
        clusterScale.value = withSpring(1, { damping: 15 });
      });

      // Animate to the cluster location with appropriate zoom
      mapRef.current.animateCamera(
        {
          center: cluster.coordinate,
          zoom: 16,
        },
        { duration: 500 }
      );
    } catch (error) {
      console.error('Error handling cluster press:', error);
    }
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
      Alert.alert('Навигация', `Отваряне на Apple Maps към ${restroom.name}...`);
    } else if (Platform.OS === 'android') {
      Alert.alert('Навигация', `Отваряне на Google Maps към ${restroom.name}...`);
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  };

  // Cluster marker component
  const ClusterMarker = ({ cluster }: { cluster: any }) => {
    const pointCount = cluster.restrooms.length;
    const coordinate = cluster.coordinate;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: clusterScale.value }],
    }));

    // Determine cluster size and color based on point count
    const getClusterStyle = () => {
      if (pointCount >= 10) {
        return {
          size: 60,
          gradient: [colors.error, '#DC2626'] as const,
          textSize: 16,
        };
      } else if (pointCount >= 5) {
        return {
          size: 50,
          gradient: [colors.warning, '#D97706'] as const,
          textSize: 14,
        };
      } else {
        return {
          size: 40,
          gradient: [colors.primary, colors.primaryDark] as const,
          textSize: 12,
        };
      }
    };

    const clusterStyle = getClusterStyle();

    return (
      <Marker
        coordinate={coordinate}
        onPress={() => handleClusterPress(cluster)}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        <Animated.View style={[animatedStyle]}>
          <View
            style={[
              styles.clusterContainer,
              {
                width: clusterStyle.size,
                height: clusterStyle.size,
                borderRadius: clusterStyle.size / 2,
              },
            ]}
          >
            <LinearGradient
              colors={clusterStyle.gradient}
              style={[
                styles.clusterGradient,
                {
                  width: clusterStyle.size,
                  height: clusterStyle.size,
                  borderRadius: clusterStyle.size / 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.clusterText,
                  {
                    fontSize: clusterStyle.textSize,
                  },
                ]}
              >
                {pointCount}
              </Text>
            </LinearGradient>
            
            {/* Pulsing ring effect */}
            <View
              style={[
                styles.clusterPulse,
                {
                  width: clusterStyle.size + 20,
                  height: clusterStyle.size + 20,
                  borderRadius: (clusterStyle.size + 20) / 2,
                  borderColor: clusterStyle.gradient[0],
                },
              ]}
            />
          </View>
        </Animated.View>
      </Marker>
    );
  };

  // Individual restroom marker
  const RestroomMarker = ({ restroom }: { restroom: Restroom }) => (
    <Marker
      key={restroom.id}
      coordinate={{
        latitude: restroom.coordinates.latitude,
        longitude: restroom.coordinates.longitude,
      }}
      onPress={() => handleMarkerPress(restroom)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 1 }}
    >
      <Pin restroom={restroom} />
    </Marker>
  );

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

      {onRefresh && (
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            onRefresh();
            console.log('🔄 Refresh button pressed');
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
      )}
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
        {clusteredMarkers.map((cluster) => {
          if (cluster.isCluster && cluster.restrooms.length > 1) {
            return (
              <ClusterMarker
                key={cluster.id}
                cluster={cluster}
              />
            );
          } else {
            // This is an individual restroom
            const restroom = cluster.restrooms[0];
            return <RestroomMarker key={restroom.id} restroom={restroom} />;
          }
        })}
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

      {/* Cluster info overlay */}
      <View style={styles.clusterInfo}>
        <BlurView
          intensity={theme === 'light' ? 80 : 60}
          style={styles.clusterInfoBlur}
        >
          <View
            style={[
              styles.clusterInfoContent,
              { backgroundColor: `${colors.surface}95` },
            ]}
          >
            <Text style={[styles.clusterInfoText, { color: colors.text }]}>
              {filteredRestrooms.length} места
            </Text>
            <Text style={[styles.clusterInfoSubtext, { color: colors.textSecondary }]}>
              Приближете за детайли
            </Text>
          </View>
        </BlurView>
      </View>
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
  clusterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clusterGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clusterText: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  clusterPulse: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.3,
  },
  clusterInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    zIndex: 60,
  },
  clusterInfoBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  clusterInfoContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clusterInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  clusterInfoSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});