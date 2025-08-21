import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Restroom } from '@/types/restroom';
import { MapPin, Star, TriangleAlert as AlertTriangle, Circle as XCircle, Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface PinProps {
  restroom?: Restroom;
  count?: number; // when used as a cluster
}

export default function Pin({ restroom, count }: PinProps) {
  const { theme } = useTheme();

  // Enhanced color system with better contrast
  const getMarkerStyle = () => {
    if (count) {
      return {
        gradient: theme === 'light' 
          ? ['#4F46E5', '#6366F1'] as const
          : ['#8B5CF6', '#A78BFA'] as const,
        icon: null,
        size: 44,
        borderColor: '#FFFFFF',
        shadowColor: '#4F46E5',
      };
    }

    if (!restroom) {
      return {
        gradient: ['#6B7280', '#9CA3AF'] as const,
        icon: MapPin,
        size: 36,
        borderColor: '#FFFFFF',
        shadowColor: '#6B7280',
      };
    }

    // Status-based styling
    if (restroom.availability === 'out_of_order') {
      return {
        gradient: ['#DC2626', '#EF4444'] as const,
        icon: XCircle,
        size: 36,
        borderColor: '#FFFFFF',
        shadowColor: '#DC2626',
      };
    }
    
    if (restroom.availability === 'occupied') {
      return {
        gradient: ['#D97706', '#F59E0B'] as const,
        icon: Clock,
        size: 36,
        borderColor: '#FFFFFF',
        shadowColor: '#D97706',
      };
    }
    
    // High-rated places get special treatment
    if (restroom.rating >= 4.5) {
      return {
        gradient: ['#059669', '#10B981'] as const,
        icon: Star,
        size: 38,
        borderColor: '#FFFFFF',
        shadowColor: '#059669',
      };
    }
    
    // Default available
    return {
      gradient: theme === 'light' 
        ? ['#4F46E5', '#6366F1'] as const
        : ['#8B5CF6', '#A78BFA'] as const,
      icon: MapPin,
      size: 36,
      borderColor: '#FFFFFF',
      shadowColor: '#4F46E5',
    };
  };

  const markerStyle = getMarkerStyle();
  const IconComponent = markerStyle.icon;

  return (
    <View style={styles.container}>
      {/* Main marker */}
      <View
        style={[
          styles.markerShadow,
          {
            width: markerStyle.size + 8,
            height: markerStyle.size + 8,
            borderRadius: (markerStyle.size + 8) / 2,
            backgroundColor: `${markerStyle.shadowColor}20`,
          },
        ]}
      />
      <LinearGradient 
        colors={markerStyle.gradient} 
        style={[
          styles.gradient,
          {
            width: markerStyle.size,
            height: markerStyle.size,
            borderRadius: markerStyle.size / 2,
            borderColor: markerStyle.borderColor,
            shadowColor: markerStyle.shadowColor,
          },
        ]}
      >
        {count ? (
          <Text style={[styles.count, { fontSize: count > 99 ? 12 : 14 }]}>
            {count > 99 ? '99+' : count}
          </Text>
        ) : IconComponent ? (
          <IconComponent 
            size={markerStyle.size === 38 ? 20 : 18} 
            color="#FFFFFF" 
            strokeWidth={2.5}
            {...(IconComponent === Star && { fill: '#FFFFFF' })}
          />
        ) : (
          <MapPin size={18} color="#FFFFFF" strokeWidth={2.5} />
        )}
      </LinearGradient>
      
      {/* Enhanced status indicator for high-rated places */}
      {restroom && restroom.rating >= 4.5 && (
        <View style={[styles.statusBadge, { backgroundColor: '#059669' }]}>
          <Star size={8} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
        </View>
      )}
      
      {/* Pointer */}
      <View 
        style={[
          styles.arrow, 
          { 
            borderTopColor: markerStyle.gradient[1],
            shadowColor: markerStyle.shadowColor,
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerShadow: {
    position: 'absolute',
    top: 2,
    opacity: 0.3,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowColor: '#000',
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowColor: '#000',
      },
    }),
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      },
    }),
  },
  count: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
});
