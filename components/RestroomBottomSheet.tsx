import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, Star, Euro, Accessibility, Clock, Users, Camera, Navigation2, X, Heart, Share, Phone, Globe, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Circle as XCircle, Wifi, Car, Baby, Droplets, Wind, Music, Shield, Zap, Coffee, Utensils, ShoppingBag, Fuel, Building, TrendingUp, Award, ThumbsUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Restroom } from '@/types/restroom';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface RestroomBottomSheetProps {
  restroom: Restroom | null;
  onClose: () => void;
  onNavigate: (restroom: Restroom) => void;
}

const { width, height } = Dimensions.get('window');

export function RestroomBottomSheet({
  restroom,
  onClose,
  onNavigate,
}: RestroomBottomSheetProps) {
  const { colors, theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedPosition = useSharedValue(0);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  useEffect(() => {
    if (restroom) {
      bottomSheetRef.current?.snapToIndex(1);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [restroom]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
    animatedPosition.value = index;
  }, [onClose]);

  const getStatusInfo = () => {
    if (!restroom) return { icon: CheckCircle, text: 'Unknown', color: colors.textSecondary };
    
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
      case 'restaurant': return { icon: Utensils, text: 'Ресторант' };
      case 'cafe': return { icon: Coffee, text: 'Кафе' };
      case 'bar': return { icon: Coffee, text: 'Бар' };
      case 'mall': return { icon: ShoppingBag, text: 'Мол' };
      case 'gas_station': return { icon: Fuel, text: 'Бензиностанция' };
      default: return { icon: Building, text: 'Обществено' };
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityMap: Record<string, any> = {
      'Тоалетна хартия': Droplets,
      'Сапун': Droplets,
      'Дезинфектант': Shield,
      'Сешоар': Wind,
      'Огледало': Users,
      'Пеленачка': Baby,
      'Климатик': Wind,
      'Музика': Music,
      'WiFi': Wifi,
      'Паркинг': Car,
      'Wheelchair accessible': Accessibility,
      'Baby changing station': Baby,
      'Hand sanitizer': Shield,
      'Premium toiletries': Star,
      'Air conditioning': Wind,
      'Mirror': Users,
    };
    return amenityMap[amenity] || CheckCircle;
  };

  const animatedBackdrop = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedPosition.value,
      [-1, 0, 1, 2],
      [0, 0.3, 0.5, 0.7],
      Extrapolate.CLAMP
    );
    return {
      opacity: withSpring(opacity),
    };
  });

  if (!restroom) return null;

  const statusInfo = getStatusInfo();
  const businessInfo = getBusinessTypeInfo();

  return (
    <>
      <Animated.View style={[styles.backdrop, animatedBackdrop]} />
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: 'transparent',
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.border,
          width: 48,
          height: 5,
        }}
      >
        <BottomSheetView style={styles.container}>
          <BlurView
            intensity={theme === 'light' ? 95 : 85}
            style={styles.blurContainer}
          >
            <LinearGradient
              colors={theme === 'light' 
                ? ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)']
                : ['rgba(15,23,42,0.95)', 'rgba(30,41,59,0.9)']
              }
              style={styles.gradient}
            >
              <BottomSheetScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* Header Section */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <LinearGradient
                      colors={[statusInfo.color, `${statusInfo.color}CC`]}
                      style={styles.statusIndicator}
                    >
                      <statusInfo.icon size={16} color="#FFFFFF" strokeWidth={2.5} />
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
                    style={[styles.closeButton, { backgroundColor: `${colors.surface}90` }]}
                    onPress={onClose}
                  >
                    <X size={18} color={colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {/* Status & Rating Cards */}
                <View style={styles.cardRow}>
                  <BlurView intensity={60} style={styles.card}>
                    <LinearGradient
                      colors={[`${statusInfo.color}20`, `${statusInfo.color}10`]}
                      style={styles.cardGradient}
                    >
                      <statusInfo.icon size={20} color={statusInfo.color} strokeWidth={2} />
                      <Text style={[styles.cardTitle, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </LinearGradient>
                  </BlurView>

                  <BlurView intensity={60} style={styles.card}>
                    <LinearGradient
                      colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                      style={styles.cardGradient}
                    >
                      <Star size={20} color={colors.warning} fill={colors.warning} strokeWidth={2} />
                      <Text style={[styles.cardTitle, { color: colors.warning }]}>
                        {restroom.rating.toFixed(1)}
                      </Text>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        ({restroom.reviews.length})
                      </Text>
                    </LinearGradient>
                  </BlurView>

                  {restroom.distance && (
                    <BlurView intensity={60} style={styles.card}>
                      <LinearGradient
                        colors={[`${colors.primary}20`, `${colors.primary}10`]}
                        style={styles.cardGradient}
                      >
                        <Navigation2 size={20} color={colors.primary} strokeWidth={2} />
                        <Text style={[styles.cardTitle, { color: colors.primary }]}>
                          {restroom.distance.toFixed(1)} км
                        </Text>
                      </LinearGradient>
                    </BlurView>
                  )}
                </View>

                {/* Quick Info Badges */}
                <View style={styles.badgeContainer}>
                  <BlurView intensity={50} style={styles.badge}>
                    <LinearGradient
                      colors={[`${businessInfo.icon === Building ? colors.secondary : colors.primary}30`, `${businessInfo.icon === Building ? colors.secondary : colors.primary}20`]}
                      style={styles.badgeGradient}
                    >
                      <businessInfo.icon size={14} color={businessInfo.icon === Building ? colors.secondary : colors.primary} strokeWidth={2} />
                      <Text style={[styles.badgeText, { color: businessInfo.icon === Building ? colors.secondary : colors.primary }]}>
                        {businessInfo.text}
                      </Text>
                    </LinearGradient>
                  </BlurView>

                  {restroom.isPaid && (
                    <BlurView intensity={50} style={styles.badge}>
                      <LinearGradient
                        colors={['rgba(245, 158, 11, 0.3)', 'rgba(245, 158, 11, 0.2)']}
                        style={styles.badgeGradient}
                      >
                        <Euro size={14} color={colors.warning} strokeWidth={2} />
                        <Text style={[styles.badgeText, { color: colors.warning }]}>
                          {typeof restroom.price === 'number' ? restroom.price.toFixed(2) : '0.00'} лв
                        </Text>
                      </LinearGradient>
                    </BlurView>
                  )}

                  {restroom.accessibility && (
                    <BlurView intensity={50} style={styles.badge}>
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.2)']}
                        style={styles.badgeGradient}
                      >
                        <Accessibility size={14} color={colors.success} strokeWidth={2} />
                        <Text style={[styles.badgeText, { color: colors.success }]}>
                          Достъпно
                        </Text>
                      </LinearGradient>
                    </BlurView>
                  )}

                  <BlurView intensity={50} style={styles.badge}>
                    <LinearGradient
                      colors={[`${colors.textSecondary}30`, `${colors.textSecondary}20`]}
                      style={styles.badgeGradient}
                    >
                      <Users size={14} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                        {restroom.checkInCount} посещения
                      </Text>
                    </LinearGradient>
                  </BlurView>
                </View>

                {/* Cleanliness Rating */}
                <BlurView intensity={60} style={styles.section}>
                  <LinearGradient
                    colors={[`${colors.surface}60`, `${colors.surface}40`]}
                    style={styles.sectionGradient}
                  >
                    <View style={styles.sectionHeader}>
                      <Droplets size={20} color={colors.success} strokeWidth={2} />
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Чистота и качество
                      </Text>
                    </View>
                    <View style={styles.cleanlinessRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          color={star <= restroom.cleanliness ? colors.success : colors.border}
                          fill={star <= restroom.cleanliness ? colors.success : 'transparent'}
                          strokeWidth={2}
                        />
                      ))}
                      <Text style={[styles.cleanlinessText, { color: colors.text }]}>
                        {restroom.cleanliness}/5
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                        <LinearGradient
                          colors={[colors.success, `${colors.success}CC`]}
                          style={[styles.progressFill, { width: `${(restroom.cleanliness / 5) * 100}%` }]}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>

                {/* Amenities Grid */}
                <BlurView intensity={60} style={styles.section}>
                  <LinearGradient
                    colors={[`${colors.surface}60`, `${colors.surface}40`]}
                    style={styles.sectionGradient}
                  >
                    <View style={styles.sectionHeader}>
                      <Award size={20} color={colors.primary} strokeWidth={2} />
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Удобства
                      </Text>
                    </View>
                    <View style={styles.amenitiesGrid}>
                      {restroom.amenities.map((amenity, index) => {
                        const AmenityIcon = getAmenityIcon(amenity);
                        return (
                          <BlurView key={index} intensity={40} style={styles.amenityChip}>
                            <LinearGradient
                              colors={[`${colors.primary}25`, `${colors.primary}15`]}
                              style={styles.amenityGradient}
                            >
                              <AmenityIcon size={16} color={colors.primary} strokeWidth={2} />
                              <Text style={[styles.amenityText, { color: colors.primary }]}>
                                {amenity}
                              </Text>
                            </LinearGradient>
                          </BlurView>
                        );
                      })}
                    </View>
                  </LinearGradient>
                </BlurView>

                {/* Photos Section */}
                {restroom.photos.length > 0 && (
                  <BlurView intensity={60} style={styles.section}>
                    <LinearGradient
                      colors={[`${colors.surface}60`, `${colors.surface}40`]}
                      style={styles.sectionGradient}
                    >
                      <View style={styles.sectionHeader}>
                        <Camera size={20} color={colors.secondary} strokeWidth={2} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                          Снимки ({restroom.photos.length})
                        </Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.photosContainer}>
                          {restroom.photos.map((photo, index) => (
                            <View key={index} style={styles.photoWrapper}>
                              <Image source={{ uri: photo }} style={styles.photo} />
                              <BlurView intensity={30} style={styles.photoOverlay}>
                                <Camera size={14} color="#FFFFFF" strokeWidth={2} />
                              </BlurView>
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    </LinearGradient>
                  </BlurView>
                )}

                {/* Recent Reviews */}
                <BlurView intensity={60} style={styles.section}>
                  <LinearGradient
                    colors={[`${colors.surface}60`, `${colors.surface}40`]}
                    style={styles.sectionGradient}
                  >
                    <View style={styles.sectionHeader}>
                      <ThumbsUp size={20} color={colors.warning} strokeWidth={2} />
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Последни отзиви
                      </Text>
                    </View>
                    {restroom.reviews.slice(0, 2).map((review) => (
                      <BlurView key={review.id} intensity={40} style={styles.reviewCard}>
                        <LinearGradient
                          colors={[`${colors.surface}50`, `${colors.surface}30`]}
                          style={styles.reviewGradient}
                        >
                          <View style={styles.reviewHeader}>
                            <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                              {review.userName}
                            </Text>
                            <View style={styles.reviewRating}>
                              <Star size={14} color={colors.warning} fill={colors.warning} strokeWidth={2} />
                              <Text style={[styles.reviewRatingText, { color: colors.warning }]}>
                                {review.rating}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                            {review.comment}
                          </Text>
                          <View style={styles.reviewFooter}>
                            <Text style={[styles.reviewDate, { color: colors.textTertiary }]}>
                              {new Date(review.createdAt).toLocaleDateString('bg-BG')}
                            </Text>
                            <View style={styles.reviewHelpful}>
                              <ThumbsUp size={12} color={colors.textTertiary} strokeWidth={2} />
                              <Text style={[styles.reviewHelpfulText, { color: colors.textTertiary }]}>
                                {review.helpful}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </BlurView>
                    ))}
                  </LinearGradient>
                </BlurView>

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <BlurView intensity={60} style={styles.actionBlur}>
                      <LinearGradient
                        colors={[`${colors.error}30`, `${colors.error}20`]}
                        style={styles.actionGradient}
                      >
                        <Heart size={20} color={colors.error} strokeWidth={2} />
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <BlurView intensity={60} style={styles.actionBlur}>
                      <LinearGradient
                        colors={[`${colors.textSecondary}30`, `${colors.textSecondary}20`]}
                        style={styles.actionGradient}
                      >
                        <Share size={20} color={colors.textSecondary} strokeWidth={2} />
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => onNavigate(restroom)}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.primaryGradient}
                    >
                      <Navigation2 size={20} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.primaryButtonText}>Навигация</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Bottom Padding */}
                <View style={styles.bottomPadding} />
              </BottomSheetScrollView>
            </LinearGradient>
          </BlurView>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  badge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sectionGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  cleanlinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cleanlinessText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  progressBar: {
    marginTop: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  amenityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  amenityText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  photoWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  photo: {
    width: 120,
    height: 90,
    borderRadius: 16,
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  reviewGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  reviewComment: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  reviewHelpful: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewHelpfulText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  actionBlur: {
    flex: 1,
    borderRadius: 28,
  },
  actionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
});