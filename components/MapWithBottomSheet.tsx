import React, { useState, useRef, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { ClusteredMapView } from '@/components/ClusteredMapView';
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

    return (
      <ClusteredMapView
        restrooms={restrooms}
        userLocation={userLocation}
        initialRegion={initialRegion}
        onRefresh={onRefresh}
      />
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

const styles = StyleSheet.create({});
