import { useState, useEffect, useCallback } from 'react';
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

  /**
   * Search for restrooms near a specific location
   */
  const searchNearby = useCallback(
    async (latitude: number, longitude: number, radius: number = 5000) => {
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

        setRealRestrooms(sortedRestrooms);
        console.log(`✅ Found ${sortedRestrooms.length} restrooms`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('❌ Error searching for restrooms:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Refresh data using current user location
   */
  const refreshData = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await searchNearby(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('❌ Error refreshing data:', err);
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
