import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumInteractiveMapProps {
  restrooms: any[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function PremiumInteractiveMap({ restrooms, userLocation }: PremiumInteractiveMapProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.errorGradient}>
        <AlertTriangle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Premium Map Not Available</Text>
        <Text style={styles.errorText}>
          Premium interactive maps are not available on web. Please use the mobile app for full map functionality.
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorGradient: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});