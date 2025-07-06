import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star, Euro, Accessibility, Navigation, Layers, Filter } from 'lucide-react-native';
import { Restroom } from '@/types/restroom';

interface MapViewComponentProps {
  restrooms: Restroom[];
  onRestroomPress: (restroom: Restroom) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');

export function MapViewComponent({ restrooms, onRestroomPress, userLocation }: MapViewComponentProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getMarkerColor = (restroom: Restroom) => {
    if (restroom.availability === 'out_of_order') return '#EF4444';
    if (restroom.availability === 'occupied') return '#F59E0B';
    if (restroom.rating >= 4.5) return '#10B981';
    if (restroom.rating >= 4.0) return '#3B82F6';
    return '#6B7280';
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Свободно';
      case 'occupied': return 'Заето';
      case 'out_of_order': return 'Неработещо';
      default: return 'Неизвестно';
    }
  };

  const getBusinessTypeText = (businessType: string) => {
    switch (businessType) {
      case 'restaurant': return 'Ресторант';
      case 'cafe': return 'Кафе';
      case 'bar': return 'Бар';
      case 'public': return 'Обществено';
      case 'gas_station': return 'Бензиностанция';
      case 'mall': return 'Мол';
      default: return 'Други';
    }
  };

  const filteredRestrooms = restrooms.filter(restroom => {
    switch (selectedFilter) {
      case 'available': return restroom.availability === 'available';
      case 'high_rated': return restroom.rating >= 4.5;
      case 'free': return !restroom.isPaid;
      case 'accessible': return restroom.accessibility;
      default: return true;
    }
  });

  const sortedRestrooms = [...filteredRestrooms].sort((a, b) => {
    if (a.distance && b.distance) {
      return a.distance - b.distance;
    }
    return b.rating - a.rating;
  });

  const openInMaps = (restroom: Restroom) => {
    const { latitude, longitude } = restroom.coordinates;
    
    if (Platform.OS === 'ios') {
      const url = `maps://app?daddr=${latitude},${longitude}`;
      console.log('Opening iOS Maps:', url);
    } else if (Platform.OS === 'android') {
      const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${restroom.name})`;
      console.log('Opening Android Maps:', url);
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  };

  const RestroomGridItem = ({ restroom }: { restroom: Restroom }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => onRestroomPress(restroom)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.gridItemGradient}
      >
        <View style={styles.gridItemHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: getMarkerColor(restroom) }]} />
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => openInMaps(restroom)}
          >
            <Navigation size={16} color="#3B82F6" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.gridItemContent}>
          <MapPin size={24} color={getMarkerColor(restroom)} strokeWidth={2} />
          <Text style={styles.gridItemTitle} numberOfLines={2}>{restroom.name}</Text>
          
          <View style={styles.gridItemMeta}>
            <View style={styles.ratingContainer}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
              <Text style={styles.ratingText}>{restroom.rating.toFixed(1)}</Text>
            </View>
            {restroom.distance && (
              <Text style={styles.distanceText}>{restroom.distance.toFixed(1)} км</Text>
            )}
          </View>
          
          <View style={styles.amenitiesRow}>
            {restroom.accessibility && (
              <Accessibility size={12} color="#10B981" strokeWidth={2} />
            )}
            {restroom.isPaid && (
              <Euro size={12} color="#F59E0B" strokeWidth={2} />
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const RestroomListItem = ({ restroom }: { restroom: Restroom }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => onRestroomPress(restroom)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.listItemGradient}
      >
        <View style={styles.listItemHeader}>
          <View style={styles.listItemTitleContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getMarkerColor(restroom) }]} />
            <View style={styles.listItemTitleContent}>
              <Text style={styles.listItemTitle}>{restroom.name}</Text>
              <Text style={styles.listItemAddress}>{restroom.address}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => openInMaps(restroom)}
          >
            <Navigation size={20} color="#3B82F6" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.listItemMeta}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
            <Text style={styles.ratingText}>{restroom.rating.toFixed(1)}</Text>
          </View>
          
          <View style={styles.businessTypeContainer}>
            <Text style={styles.businessTypeText}>{getBusinessTypeText(restroom.businessType)}</Text>
          </View>
          
          {restroom.distance && (
            <Text style={styles.distanceText}>{restroom.distance.toFixed(1)} км</Text>
          )}
        </View>
        
        <View style={styles.amenitiesContainer}>
          {restroom.accessibility && (
            <View style={styles.amenityIcon}>
              <Accessibility size={12} color="#10B981" strokeWidth={2} />
            </View>
          )}
          {restroom.isPaid && (
            <View style={styles.amenityIcon}>
              <Euro size={12} color="#F59E0B" strokeWidth={2} />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with filters and view toggle */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Карта на тоалетни</Text>
          <Text style={styles.headerSubtitle}>
            {sortedRestrooms.length} от {restrooms.length} места
          </Text>
        </View>
        
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
            onPress={() => setViewMode('grid')}
          >
            <Layers size={20} color={viewMode === 'grid' ? '#FFFFFF' : '#BFDBFE'} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Filter size={20} color={viewMode === 'list' ? '#FFFFFF' : '#BFDBFE'} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filter buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'Всички', count: restrooms.length },
          { key: 'available', label: 'Свободни', count: restrooms.filter(r => r.availability === 'available').length },
          { key: 'high_rated', label: 'Високо оценени', count: restrooms.filter(r => r.rating >= 4.5).length },
          { key: 'free', label: 'Безплатни', count: restrooms.filter(r => !r.isPaid).length },
          { key: 'accessible', label: 'Достъпни', count: restrooms.filter(r => r.accessibility).length },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {sortedRestrooms.map((restroom) => (
              <RestroomGridItem key={restroom.id} restroom={restroom} />
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {sortedRestrooms.map((restroom) => (
              <RestroomListItem key={restroom.id} restroom={restroom} />
            ))}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.legendGradient}
        >
          <Text style={styles.legendTitle}>Легенда</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Отлично (4.5+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Добро (4.0+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Заето</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Неработещо</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#BFDBFE',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewToggleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  gridItem: {
    width: (width - 48) / 2,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridItemGradient: {
    padding: 16,
    borderRadius: 16,
    minHeight: 180,
  },
  gridItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemContent: {
    alignItems: 'center',
    flex: 1,
  },
  gridItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 18,
  },
  gridItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  listItem: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemGradient: {
    padding: 16,
    borderRadius: 16,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listItemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  listItemTitleContent: {
    flex: 1,
    marginLeft: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  listItemAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navigationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EBF8FF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  businessTypeContainer: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  businessTypeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  amenityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  legendGradient: {
    padding: 12,
    borderRadius: 12,
    minWidth: 160,
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  bottomPadding: {
    height: 100,
  },
});