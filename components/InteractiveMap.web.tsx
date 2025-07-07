import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface InteractiveMapProps {
  restrooms: any[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function InteractiveMap({ restrooms, userLocation }: InteractiveMapProps) {
  return (
    <View style={styles.container}>
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Map Not Available</Text>
        <Text style={styles.errorText}>
          Interactive maps are not available on web. Please use the mobile app for full map functionality.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFBEB',
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#92400E',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 24,
  },
});