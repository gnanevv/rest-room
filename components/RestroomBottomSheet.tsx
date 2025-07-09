import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  MapPin,
  Star,
  Euro,
  Accessibility,
  Clock,
  Users,
  Camera,
  Navigation2,
  X,
  Heart,
  Share,
  Phone,
  Globe,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Restroom } from '@/types/restroom';

interface RestroomBottomSheetProps {
  restroom: Restroom;
  onClose: () => void;
  onNavigate: () => void;
}

const { height: screenHeight } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 200;
const EXPANDED_HEIGHT = screenHeight * 0.8;

export function RestroomBottomSheet({
  restroom,
  onClose,
  onNavigate,
}: RestroomBottomSheetProps) {
  const { colors, theme } = useTheme();
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const [isExpanded, setIsExpanded] = React.useState(false);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: screenHeight - COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(sheetHeight, {
        toValue: COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, []);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      const newY = screenHeight - COLLAPSED_HEIGHT + gestureState.dy;
      if (newY >= screenHeight - EXPANDED_HEIGHT && newY <= screenHeight) {
        translateY.setValue(newY);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const velocity = gestureState.vy;
      const currentY = (translateY as any)._value;
      
      if (velocity > 0.5 || currentY > screenHeight - COLLAPSED_HEIGHT / 2) {
        // Close sheet
        closeSheet();
      } else if (velocity < -0.5 || currentY < screenHeight - EXPANDED_HEIGHT / 2) {
        // Expand sheet
        expandSheet();
      } else {
        // Snap to nearest position
        const midPoint = screenHeight - (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;
        if (currentY > midPoint) {
          collapseSheet();
        } else {
          expandSheet();
        }
      }
    },
  });

  const expandSheet = () => {
    setIsExpanded(true);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: screenHeight - EXPANDED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(sheetHeight, {
        toValue: EXPANDED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  const collapseSheet = () => {
    setIsExpanded(false);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: screenHeight - COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(sheetHeight, {
        toValue: COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.spring(translateY, {
      toValue: screenHeight,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start(() => {
      onClose();
    });
  };

  const getAvailabilityColor = () => {
    switch (restroom.availability) {
      case 'available': return colors.success;
      case 'occupied': return colors.warning;
      case 'out_of_order': return colors.error;
      default: return colors.secondary;
    }
  };

  const getAvailabilityText = () => {
    switch (restroom.availability) {
      case 'available': return 'Свободно';
      case 'occupied': return 'Заето';
      case 'out_of_order': return 'Неработещо';
      default: return 'Неизвестно';
    }
  };

  const getBusinessTypeText = () => {
    switch (restroom.businessType) {
      case 'restaurant': return 'Ресторант';
      case 'cafe': return 'Кафе';
      case 'bar': return 'Бар';
      case 'public': return 'Обществено';
      case 'gas_station': return 'Бензиностанция';
      case 'mall': return 'Мол';
      default: return 'Други';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          height: sheetHeight,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <BlurView
        intensity={theme === 'light' ? 90 : 70}
        style={styles.blur}
      >
        <View
          style={[
            styles.content,
            { backgroundColor: colors.surface },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.border },
              ]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getAvailabilityColor() },
                ]}
              />
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {restroom.name}
                </Text>
                <View style={styles.addressRow}>
                  <MapPin size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.address, { color: colors.textSecondary }]}>
                    {restroom.address}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.background }]}
              onPress={closeSheet}
            >
              <X size={18} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.warning} fill={colors.warning} strokeWidth={2} />
              <Text style={[styles.rating, { color: colors.text }]}>
                {restroom.rating.toFixed(1)}
              </Text>
              <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                ({restroom.reviews.length})
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getAvailabilityColor() },
              ]}
            >
              <Text style={styles.statusText}>{getAvailabilityText()}</Text>
            </View>

            {restroom.distance && (
              <Text style={[styles.distance, { color: colors.textSecondary }]}>
                {restroom.distance.toFixed(1)} км
              </Text>
            )}
          </View>

          {/* Amenities */}
          <View style={styles.amenities}>
            {restroom.accessibility && (
              <View style={[styles.amenityBadge, { backgroundColor: colors.background }]}>
                <Accessibility size={14} color={colors.success} strokeWidth={2} />
                <Text style={[styles.amenityText, { color: colors.success }]}>
                  Достъпно
                </Text>
              </View>
            )}
            {restroom.isPaid && (
              <View style={[styles.amenityBadge, { backgroundColor: colors.background }]}>
                <Euro size={14} color={colors.warning} strokeWidth={2} />
                <Text style={[styles.amenityText, { color: colors.warning }]}>
                  {typeof restroom.price === 'number' ? restroom.price.toFixed(2) : '0.00'} лв
                </Text>
              </View>
            )}
            <View style={[styles.amenityBadge, { backgroundColor: colors.background }]}>
              <Users size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.amenityText, { color: colors.textSecondary }]}>
                {restroom.checkInCount}
              </Text>
            </View>
            {restroom.photos.length > 0 && (
              <View style={[styles.amenityBadge, { backgroundColor: colors.background }]}>
                <Camera size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.amenityText, { color: colors.textSecondary }]}>
                  {restroom.photos.length}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background }]}
            >
              <Heart size={16} color={colors.error} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background }]}
            >
              <Share size={16} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onNavigate}
            >
              <Navigation2 size={16} color={colors.background} strokeWidth={2} />
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                Навигация
              </Text>
            </TouchableOpacity>
          </View>

          {/* Expandable Content */}
          {isExpanded && (
            <ScrollView
              style={styles.expandedContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Business Type */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Тип заведение
                </Text>
                <View style={[styles.businessTypeBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.businessTypeText, { color: colors.primary }]}>
                    {getBusinessTypeText()}
                  </Text>
                </View>
              </View>

              {/* Cleanliness Rating */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Чистота
                </Text>
                <View style={styles.cleanlinessRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color={star <= restroom.cleanliness ? colors.success : colors.border}
                      fill={star <= restroom.cleanliness ? colors.success : colors.border}
                      strokeWidth={2}
                    />
                  ))}
                  <Text style={[styles.cleanlinessText, { color: colors.textSecondary }]}>
                    {restroom.cleanliness}/5
                  </Text>
                </View>
              </View>

              {/* Photos */}
              {restroom.photos.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Снимки
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.photosContainer}>
                      {restroom.photos.map((photo, index) => (
                        <Image
                          key={index}
                          source={{ uri: photo }}
                          style={styles.photo}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Recent Reviews */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Последни отзиви
                </Text>
                {restroom.reviews.slice(0, 3).map((review) => (
                  <View
                    key={review.id}
                    style={[styles.reviewItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={styles.reviewHeader}>
                      <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                        {review.userName}
                      </Text>
                      <View style={styles.reviewRating}>
                        <Star size={12} color={colors.warning} fill={colors.warning} strokeWidth={2} />
                        <Text style={[styles.reviewRatingText, { color: colors.textSecondary }]}>
                          {review.rating}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                      {review.comment}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Last Updated */}
              <View style={styles.section}>
                <View style={styles.lastUpdated}>
                  <Clock size={14} color={colors.textTertiary} strokeWidth={2} />
                  <Text style={[styles.lastUpdatedText, { color: colors.textTertiary }]}>
                    Обновено: {new Date(restroom.lastUpdated).toLocaleDateString('bg-BG')}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Expand/Collapse Indicator */}
          <TouchableOpacity
            style={styles.expandIndicator}
            onPress={isExpanded ? collapseSheet : expandSheet}
          >
            {isExpanded ? (
              <ChevronDown size={20} color={colors.textSecondary} strokeWidth={2} />
            ) : (
              <ChevronUp size={20} color={colors.textSecondary} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  blur: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
    marginRight: 12,
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
  quickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  amenityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  expandedContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  businessTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  businessTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  cleanlinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cleanlinessText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photo: {
    width: 120,
    height: 80,
    borderRadius: 12,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  expandIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});