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
import { MapPin, Star, Euro, Accessibility, Clock, Users, Camera, Navigation2, X, Heart, Share, ChevronUp, ChevronDown, Key, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Restroom } from '@/types/restroom';

interface RestroomBottomSheetProps {
  restroom: Restroom;
  onClose: () => void;
  onNavigate: () => void;
}

const { height: screenHeight } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 280;
const EXPANDED_HEIGHT = screenHeight * 0.85;

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
    // Animate in with spring effect
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: screenHeight - COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 80,
        friction: 8,
      }),
      Animated.spring(sheetHeight, {
        toValue: COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 80,
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
      
      if (velocity > 0.8 || currentY > screenHeight - COLLAPSED_HEIGHT / 2) {
        closeSheet();
      } else if (velocity < -0.8 || currentY < screenHeight - EXPANDED_HEIGHT / 2) {
        expandSheet();
      } else {
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
        tension: 80,
        friction: 8,
      }),
      Animated.spring(sheetHeight, {
        toValue: EXPANDED_HEIGHT,
        useNativeDriver: false,
        tension: 80,
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
        tension: 80,
        friction: 8,
      }),
      Animated.spring(sheetHeight, {
        toValue: COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 80,
        friction: 8,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.spring(translateY, {
      toValue: screenHeight,
      useNativeDriver: false,
      tension: 80,
      friction: 8,
    }).start(() => {
      onClose();
    });
  };

  const getStatusBadge = () => {
    const { availability, rating } = restroom;
    
    if (availability === 'out_of_order') {
      return {
        icon: XCircle,
        text: 'Неработещо',
        colors: ['#EF4444', '#DC2626'],
        textColor: '#FFFFFF'
      };
    }
    
    if (availability === 'occupied') {
      return {
        icon: AlertTriangle,
        text: 'Заето',
        colors: ['#F59E0B', '#D97706'],
        textColor: '#FFFFFF'
      };
    }
    
    if (rating < 3) {
      return {
        icon: AlertTriangle,
        text: 'Лош рейтинг',
        colors: ['#EF4444', '#DC2626'],
        textColor: '#FFFFFF'
      };
    }
    
    return {
      icon: CheckCircle,
      text: 'Свободно',
      colors: ['#10B981', '#059669'],
      textColor: '#FFFFFF'
    };
  };

  const statusBadge = getStatusBadge();

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
        intensity={theme === 'light' ? 95 : 80}
        style={styles.blur}
      >
        <LinearGradient
          colors={theme === 'light' 
            ? ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.98)']
            : ['rgba(15,23,42,0.95)', 'rgba(30,41,59,0.98)']
          }
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Drag Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Header with glassmorphism */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <LinearGradient
                  colors={statusBadge.colors}
                  style={styles.statusIndicator}
                >
                  <statusBadge.icon size={12} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
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
                style={[styles.closeButton, { backgroundColor: `${colors.background}80` }]}
                onPress={closeSheet}
              >
                <X size={18} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Premium Status Badges */}
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={statusBadge.colors}
                style={styles.statusBadge}
              >
                <statusBadge.icon size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={[styles.statusText, { color: statusBadge.textColor }]}>
                  {statusBadge.text}
                </Text>
              </LinearGradient>

              {restroom.isPaid && (
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.statusBadge}
                >
                  <Euro size={14} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.statusText}>
                    {typeof restroom.price === 'number' ? restroom.price.toFixed(2) : '0.00'} лв
                  </Text>
                </LinearGradient>
              )}

              {restroom.accessibility && (
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.statusBadge}
                >
                  <Accessibility size={14} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.statusText}>Достъпно</Text>
                </LinearGradient>
              )}

              {restroom.businessType === 'private' && (
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.statusBadge}
                >
                  <Key size={14} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.statusText}>Нужен ключ</Text>
                </LinearGradient>
              )}
            </View>

            {/* Rating & Distance */}
            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.ratingBadge}
                >
                  <Star size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.ratingText}>{restroom.rating.toFixed(1)}</Text>
                </LinearGradient>
                <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                  ({restroom.reviews.length} отзива)
                </Text>
              </View>

              {restroom.distance && (
                <View style={[styles.distanceBadge, { backgroundColor: `${colors.primary}20` }]}>
                  <Text style={[styles.distanceText, { color: colors.primary }]}>
                    {restroom.distance.toFixed(1)} км
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons with glassmorphism */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]}
              >
                <Heart size={18} color={colors.error} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.textSecondary}15` }]}
              >
                <Share size={18} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onNavigate}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF']}
                  style={styles.primaryGradient}
                >
                  <Navigation2 size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.primaryButtonText}>Навигация</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Expandable Content */}
            {isExpanded && (
              <ScrollView
                style={styles.expandedContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Cleanliness Rating */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Чистота и качество
                  </Text>
                  <View style={styles.cleanlinessRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        color={star <= restroom.cleanliness ? '#10B981' : colors.border}
                        fill={star <= restroom.cleanliness ? '#10B981' : colors.border}
                        strokeWidth={2}
                      />
                    ))}
                    <Text style={[styles.cleanlinessText, { color: colors.text }]}>
                      {restroom.cleanliness}/5
                    </Text>
                  </View>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Удобства
                  </Text>
                  <View style={styles.amenitiesGrid}>
                    {restroom.amenities.map((amenity, index) => (
                      <View
                        key={index}
                        style={[styles.amenityChip, { backgroundColor: `${colors.primary}15` }]}
                      >
                        <Text style={[styles.amenityText, { color: colors.primary }]}>
                          {amenity}
                        </Text>
                      </View>
                    ))}
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
                      style={[styles.reviewItem, { 
                        backgroundColor: `${colors.surface}50`,
                        borderColor: `${colors.border}30`
                      }]}
                    >
                      <View style={styles.reviewHeader}>
                        <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                          {review.userName}
                        </Text>
                        <View style={styles.reviewRating}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
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
              </ScrollView>
            )}

            {/* Expand/Collapse Indicator */}
            <TouchableOpacity
              style={styles.expandIndicator}
              onPress={isExpanded ? collapseSheet : expandSheet}
            >
              <View style={[styles.expandButton, { backgroundColor: `${colors.primary}20` }]}>
                {isExpanded ? (
                  <ChevronDown size={20} color={colors.primary} strokeWidth={2.5} />
                ) : (
                  <ChevronUp size={20} color={colors.primary} strokeWidth={2.5} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },
  blur: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  gradient: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  expandedContent: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  cleanlinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cleanlinessText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  amenityText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  photo: {
    width: 140,
    height: 100,
    borderRadius: 16,
  },
  reviewItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    backdropFilter: 'blur(10px)',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
});