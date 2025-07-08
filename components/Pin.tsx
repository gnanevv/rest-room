import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Restroom } from '@/types/restroom';
import ToiletIcon from '@/components/icons/ToiletIcon';
import { useTheme } from '@/hooks/useTheme';

interface PinProps {
  restroom?: Restroom;
  count?: number; // when used as a cluster
}

export default function Pin({ restroom, count }: PinProps) {
  const { theme } = useTheme();
  // Color palettes per status
  const statusColors: Record<string, readonly [string, string]> = {
    success: ['#10B981', '#34D399'] as const,
    warning: ['#F59E0B', '#FBBF24'] as const,
    error: ['#EF4444', '#F87171'] as const,
    default: theme === 'light'
      ? (['#4F46E5', '#818CF8'] as const)
      : (['#818CF8', '#A5B4FC'] as const),
  };

  let gradient: readonly [string, string] = statusColors.default;
  if (restroom) {
    if (restroom.availability === 'out_of_order') gradient = statusColors.error;
    else if (restroom.availability === 'occupied') gradient = statusColors.warning;
    else if (restroom.rating >= 4.5) gradient = statusColors.success;
  }

  const blue = gradient as readonly [string, string];

  return (
    <View style={styles.container}>
      <LinearGradient colors={blue} style={styles.gradient}>
        {count ? (
          <Text style={styles.count}>{count}</Text>
        ) : (
          <ToiletIcon size={18} color="#fff" />
        )}
      </LinearGradient>
      <View style={[styles.arrow, { borderTopColor: blue[1] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  gradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#3BA3FF',
    marginTop: -1,
  },
  count: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
});
