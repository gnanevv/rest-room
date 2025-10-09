import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { MapPin, Star, Euro, Accessibility, Navigation2, X, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Circle as XCircle, Building, Coffee, Utensils, ShoppingBag, Fuel, Heart, Share, Clock, Users, Camera, Sparkles } from 'lucide-react-native';
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
  const scaleAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(0);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['40%', '75%'], []);

  useEffect(() => {
    if (restroom) {
      bottomSheetRef.current?.snapToIndex(0);
      scaleAnimation.value = withSpring(1, { damping: 15, stiffness: 200 });
      slideAnimation.value = withTiming(1, { duration: 300 });
    } else {
      bottomSheetRef.current?.close();
      scaleAnimation.value = withTiming(0, { duration: 200 });
      slideAnimation.value = withTiming(0, { duration: 200 });
    }
  }, [restroom, scaleAnimation, slideAnimation]);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
    opacity: slideAnimation.value,
  }));

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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
        width: 60,
        height: 6,
        borderRadius: 3,
      }}
    >
      <BottomSheetScrollView style={styles.container}>
        <Animated.View style={[styles.content, { backgroundColor: colors.surface }, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <BlurView intensity={20} style={styles.statusIndicatorBlur}>
                <LinearGradient
                  colors={[statusInfo.color, `${statusInfo.color}CC`]}
                  style={styles.statusIndicator}
                >
                  <statusInfo.icon
                    size={20}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                  />
                </LinearGradient>
              </BlurView>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {restroom.name}
                </Text>
                <View style={styles.addressRow}>
                  <MapPin
                    size={16}
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
                { backgroundColor: `${colors.background}95` },
              ]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Enhanced Stats Cards */}
          <View style={styles.statsContainer}>
            <BlurView intensity={15} style={styles.statCard}>
              <View style={[styles.statCardContent, { backgroundColor: `${colors.surface}90` }]}>
                <LinearGradient
                  colors={[colors.warning, `${colors.warning}CC`]}
                  style={styles.statIcon}
                >
                  <Star size={18} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {restroom.rating.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Rating
                </Text>
              </View>
            </BlurView>

            <BlurView intensity={15} style={styles.statCard}>
              <View style={[styles.statCardContent, { backgroundColor: `${colors.surface}90` }]}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.statIcon}
                >
                  <businessInfo.icon size={18} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {businessInfo.text}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Type
                </Text>
              </View>
            </BlurView>

            {restroom.distance && (
              <BlurView intensity={15} style={styles.statCard}>
                <View style={[styles.statCardContent, { backgroundColor: `${colors.surface}90` }]}>
                  <LinearGradient
                    colors={[colors.secondary, `${colors.secondary}CC`]}
                    style={styles.statIcon}
                  >
                    <Navigation2 size={18} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {restroom.distance.toFixed(1)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    km away
                  </Text>
                </View>
              </BlurView>
            )}
          </View>

          {/* Enhanced Features Section */}
          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Features & Amenities
            </Text>
            <View style={styles.featuresGrid}>
              {restroom.isPaid && (
                <BlurView intensity={10} style={styles.featureCard}>
                  <View style={[styles.featureCardContent, { backgroundColor: `${colors.warning}15` }]}>
                    <Euro size={16} color={colors.warning} strokeWidth={2} />
                    <Text style={[styles.featureText, { color: colors.warning }]}>
                      {typeof restroom.price === 'number'
                        ? `${restroom.price.toFixed(2)} лв`
                        : 'Paid'}
                    </Text>
                  </View>
                </BlurView>
              )}
              
              {restroom.accessibility && (
                <BlurView intensity={10} style={styles.featureCard}>
                  <View style={[styles.featureCardContent, { backgroundColor: `${colors.success}15` }]}>
                    <Accessibility size={16} color={colors.success} strokeWidth={2} />
                    <Text style={[styles.featureText, { color: colors.success }]}>
                      Accessible
                    </Text>
                  </View>
                </BlurView>
              )}
              
              {!restroom.isPaid && (
                <BlurView intensity={10} style={styles.featureCard}>
                  <View style={[styles.featureCardContent, { backgroundColor: `${colors.success}15` }]}>
                    <CheckCircle size={16} color={colors.success} strokeWidth={2} />
                    <Text style={[styles.featureText, { color: colors.success }]}>
                      Free
                    </Text>
                  </View>
                </BlurView>
              )}

              {restroom.photos.length > 0 && (
                <BlurView intensity={10} style={styles.featureCard}>
                  <View style={[styles.featureCardContent, { backgroundColor: `${colors.info}15` }]}>
                    <Camera size={16} color={colors.info} strokeWidth={2} />
                    <Text style={[styles.featureText, { color: colors.info }]}>
                      {restroom.photos.length} Photos
                    </Text>
                  </View>
                </BlurView>
              )}

              <View style={styles.statItem}>
                <BlurView intensity={10} style={styles.featureCard}>
                  <View style={[styles.featureCardContent, { backgroundColor: `${colors.textSecondary}15` }]}>
                    <Users size={16} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      {restroom.checkInCount} visits
                    </Text>
                  </View>
                </BlurView>
              </View>
            </View>
          </View>

          {/* Enhanced Cleanliness Section */}
          <View style={styles.cleanlinessSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Cleanliness Rating
            </Text>
            <BlurView intensity={15} style={styles.cleanlinessCard}>
              <View style={[styles.cleanlinessCardContent, { backgroundColor: `${colors.surface}90` }]}>
                <View style={styles.cleanlinessRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
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
                </View>
                <Text style={[styles.cleanlinessText, { color: colors.text }]}>
                  {restroom.cleanliness}/5 - {restroom.cleanliness >= 4 ? 'Excellent' : restroom.cleanliness >= 3 ? 'Good' : 'Fair'}
                </Text>
              </View>
            </BlurView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <BlurView intensity={20} style={styles.secondaryButtonBlur}>
                <View style={[styles.secondaryButtonContent, { backgroundColor: `${colors.surface}95` }]}>
                  <Heart size={20} color={colors.error} strokeWidth={2} />
                </View>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                onNavigate(restroom);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.primaryButtonGradient}
              >
                <Navigation2 size={22} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.primaryButtonText}>Get Directions</Text>
                <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <BlurView intensity={20} style={styles.secondaryButtonBlur}>
                <View style={[styles.secondaryButtonContent, { backgroundColor: `${colors.surface}95` }]}>
                  <Share size={20} color={colors.primary} strokeWidth={2} />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  statusIndicatorBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
    lineHeight: 28,
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
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 16,
    gap: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureCardContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  cleanlinessSection: {
    marginBottom: 32,
  },
  cleanlinessCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cleanlinessCardContent: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  cleanlinessRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  cleanlinessText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButtonBlur: {
    flex: 1,
    borderRadius: 16,
  },
  secondaryButtonContent: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
});
