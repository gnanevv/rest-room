import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star, Euro, Accessibility, Navigation2, X, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Circle as XCircle, Building, Coffee, Utensils, ShoppingBag, Fuel } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Restroom } from '@/types/restroom';

interface RestroomBottomSheetProps {
  restroom: Restroom | null;
  onClose: () => void;
  onNavigate: (restroom: Restroom) => void;
}

export function RestroomBottomSheet({
  restroom,
  onClose,
  onNavigate,
}: RestroomBottomSheetProps) {
  const { colors, theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['35%', '60%'], []);

  useEffect(() => {
    if (restroom) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [restroom]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const getStatusInfo = () => {
    if (!restroom)
      return {
        icon: CheckCircle,
        text: 'Unknown',
        color: colors.textSecondary,
      };

    if (restroom.availability === 'out_of_order') {
      return { icon: XCircle, text: 'Неработещо', color: colors.error };
    }
    if (restroom.availability === 'occupied') {
      return { icon: AlertTriangle, text: 'Заето', color: colors.warning };
    }
    return { icon: CheckCircle, text: 'Свободно', color: colors.success };
  };

  const getBusinessTypeInfo = () => {
    if (!restroom) return { icon: Building, text: 'Unknown' };

    switch (restroom.businessType) {
      case 'restaurant':
        return { icon: Utensils, text: 'Ресторант' };
      case 'cafe':
        return { icon: Coffee, text: 'Кафе' };
      case 'bar':
        return { icon: Coffee, text: 'Бар' };
      case 'mall':
        return { icon: ShoppingBag, text: 'Мол' };
      case 'gas_station':
        return { icon: Fuel, text: 'Бензиностанция' };
      default:
        return { icon: Building, text: 'Обществено' };
    }
  };

  if (!restroom) return null;

  const statusInfo = getStatusInfo();
  const businessInfo = getBusinessTypeInfo();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      style={{ elevation: 100, zIndex: 100 }}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: colors.surface,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
        width: 48,
        height: 5,
      }}
    >
      <BottomSheetView style={styles.container}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={[statusInfo.color, `${statusInfo.color}CC`]}
                style={styles.statusIndicator}
              >
                <statusInfo.icon
                  size={18}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {restroom.name}
                </Text>
                <View style={styles.addressRow}>
                  <MapPin
                    size={14}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                  <Text
                    style={[styles.address, { color: colors.textSecondary }]}
                  >
                    {restroom.address}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: colors.background },
              ]}
              onPress={onClose}
            >
              <X size={18} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star
                size={16}
                color={colors.warning}
                fill={colors.warning}
                strokeWidth={2}
              />
              <Text style={[styles.statText, { color: colors.text }]}>
                {restroom.rating.toFixed(1)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <businessInfo.icon
                size={16}
                color={colors.primary}
                strokeWidth={2}
              />
              <Text style={[styles.statText, { color: colors.text }]}>
                {businessInfo.text}
              </Text>
            </View>
            
            {restroom.distance && (
              <View style={styles.statItem}>
                <Navigation2
                  size={16}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {restroom.distance.toFixed(1)} км
                </Text>
              </View>
            )}
          </View>

          {/* Key Features */}
          <View style={styles.featuresRow}>
            {restroom.isPaid && (
              <View style={[styles.featureBadge, { backgroundColor: colors.background }]}>
                <Euro size={14} color={colors.warning} strokeWidth={2} />
                <Text style={[styles.featureText, { color: colors.warning }]}>
                  {typeof restroom.price === 'number'
                    ? restroom.price.toFixed(2)
                    : '0.00'} лв
                </Text>
              </View>
            )}
            
            {restroom.accessibility && (
              <View style={[styles.featureBadge, { backgroundColor: colors.background }]}>
                <Accessibility size={14} color={colors.success} strokeWidth={2} />
                <Text style={[styles.featureText, { color: colors.success }]}>
                  Достъпно
                </Text>
              </View>
            )}
            
            {!restroom.isPaid && (
              <View style={[styles.featureBadge, { backgroundColor: colors.background }]}>
                <CheckCircle size={14} color={colors.success} strokeWidth={2} />
                <Text style={[styles.featureText, { color: colors.success }]}>
                  Безплатно
                </Text>
              </View>
            )}
          </View>

          {/* Cleanliness */}
          <View style={styles.cleanlinessSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Чистота
            </Text>
            <View style={styles.cleanlinessRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  color={
                    star <= restroom.cleanliness
                      ? colors.warning
                      : colors.border
                  }
                  fill={
                    star <= restroom.cleanliness
                      ? colors.warning
                      : 'transparent'
                  }
                  strokeWidth={2}
                />
              ))}
              <Text style={[styles.cleanlinessText, { color: colors.text }]}>
                {restroom.cleanliness}/5
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onNavigate(restroom)}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.actionGradient}
            >
              <Navigation2 size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionText}>Навигация</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  cleanlinessSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  cleanlinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cleanlinessText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
