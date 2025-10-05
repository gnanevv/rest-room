import { useState, useEffect, useCallback, useRef } from 'react';
import { Restroom } from '@/types/restroom';
import { placesService } from '@/lib/placesService';
import * as Location from 'expo-location';

interface UseRealRestroomsReturn {
  realRestrooms: Restroom[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  searchNearby: (
    latitude: number,
    longitude: number,
    radius?: number
  ) => Promise<void>;
}

export function useRealRestrooms(): UseRealRestroomsReturn {
  const [realRestrooms, setRealRestrooms] = useState<Restroom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Search for restrooms near a specific location
   */
  const searchNearby = useCallback(
    async (latitude: number, longitude: number, radius: number = 5000) => {
      if (!isMountedRef.current) return;
      
      setIsLoading(true);
      setError(null);

      try {
        console.log(
          `🔍 Searching for restrooms near ${latitude}, ${longitude} within ${radius}m`
        );

        const restrooms = await placesService.searchNearby(
          latitude,
          longitude,
          radius
        );

        if (restrooms.length === 0) {
          console.log('ℹ️ No real restrooms found. This could be due to:');
          console.log('   - Missing API key (check .env file)');
          console.log('   - No places in the area');
          console.log('   - API quota exceeded');
          console.log('   - Network issues');
        }

        // Calculate distances from the search location
        const restroomsWithDistance = restrooms.map((restroom) => ({
          ...restroom,
          distance: placesService.calculateDistance(
            latitude,
            longitude,
            restroom.coordinates.latitude,
            restroom.coordinates.longitude
          ),
        }));

        // Sort by distance
        const sortedRestrooms = restroomsWithDistance.sort(
          (a, b) => a.distance - b.distance
        );

        if (isMountedRef.current) {
          setRealRestrooms(sortedRestrooms);
        }
        console.log(`✅ Found ${sortedRestrooms.length} restrooms`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        if (isMountedRef.current) {
          setError(errorMessage);
        }
        console.error('❌ Error searching for restrooms:', err);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  /**
   * Refresh data using current user location
   */
  const refreshData = useCallback(async () => {
    try {
      // Try to get current location
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        // Web platform
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await searchNearby(position.coords.latitude, position.coords.longitude);
          },
          async (error) => {
            console.warn('Web geolocation failed:', error);
            // Fallback to Sofia
            await searchNearby(42.6977, 23.3219);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
        );
      } else {
        // Mobile platform
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission denied, using Sofia as fallback');
          await searchNearby(42.6977, 23.3219);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await searchNearby(location.coords.latitude, location.coords.longitude);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('❌ Error refreshing data:', err);
      
      // Fallback to Sofia if everything fails
      try {
        await searchNearby(42.6977, 23.3219);
      } catch (fallbackError) {
        console.error('❌ Even fallback search failed:', fallbackError);
      }
    }
  }, [searchNearby]);

  /**
   * Initial data load
   */
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    realRestrooms,
    isLoading,
    error,
    refreshData,
    searchNearby,
  };
}
