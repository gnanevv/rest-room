import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Star, MapPin, Camera, Settings, CircleHelp as HelpCircle, Share2, Award, Heart, MessageCircle, Bell, Shield } from 'lucide-react-native';

export default function ProfileScreen() {
  const userData = {
    name: 'Мария Иванова',
    level: 5,
    reviewCount: 23,
    photosCount: 47,
    favoritesCount: 12,
    helpfulVotes: 89,
    joinedDate: 'Януари 2023',
  };

  const handleSettingsPress = () => {
    Alert.alert('Настройки', 'Тук ще бъдат настройките на профила.');
  };

  const handleHelpPress = () => {
    Alert.alert('Помощ', 'Тук ще бъде раздела за помощ.');
  };

  const handleSharePress = () => {
    Alert.alert('Сподели', 'Сподели приложението с приятели.');
  };

  const menuItems = [
    { 
      icon: Star, 
      label: 'Моите отзиви', 
      value: `${userData.reviewCount} отзива`,
      color: '#F59E0B',
      onPress: () => Alert.alert('Отзиви', 'Вижте всички ваши отзиви.')
    },
    { 
      icon: Camera, 
      label: 'Моите снимки', 
      value: `${userData.photosCount} снимки`,
      color: '#8B5CF6',
      onPress: () => Alert.alert('Снимки', 'Вижте всички ваши снимки.')
    },
    { 
      icon: Heart, 
      label: 'Любими места', 
      value: `${userData.favoritesCount} места`,
      color: '#EF4444',
      onPress: () => Alert.alert('Любими', 'Вижте любимите си места.')
    },
    { 
      icon: Award, 
      label: 'Достижения', 
      value: 'Ниво 5',
      color: '#10B981',
      onPress: () => Alert.alert('Достижения', 'Вижте всички ваши достижения.')
    },
    { 
      icon: Bell, 
      label: 'Известия', 
      value: '',
      color: '#6B7280',
      onPress: () => Alert.alert('Известия', 'Настройки за известия.')
    },
    { 
      icon: Shield, 
      label: 'Поверителност', 
      value: '',
      color: '#6B7280',
      onPress: () => Alert.alert('Поверителност', 'Настройки за поверителност.')
    },
    { 
      icon: Settings, 
      label: 'Настройки', 
      value: '',
      color: '#6B7280',
      onPress: handleSettingsPress
    },
    { 
      icon: HelpCircle, 
      label: 'Помощ', 
      value: '',
      color: '#6B7280',
      onPress: handleHelpPress
    },
    { 
      icon: Share2, 
      label: 'Сподели приложението', 
      value: '',
      color: '#6B7280',
      onPress: handleSharePress
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#A855F7']}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F3F4F6']}
              style={styles.avatar}
            >
              <User size={48} color="#7C3AED" strokeWidth={2} />
            </LinearGradient>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <View style={styles.levelContainer}>
              <Award size={16} color="#FEF3C7" strokeWidth={2} />
              <Text style={styles.userLevel}>Ниво {userData.level}</Text>
            </View>
            <Text style={styles.joinDate}>Член от {userData.joinedDate}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.reviewCount}</Text>
          <Text style={styles.statLabel}>Отзива</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.photosCount}</Text>
          <Text style={styles.statLabel}>Снимки</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.helpfulVotes}</Text>
          <Text style={styles.statLabel}>Полезни гласа</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={20} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeTitle}>Последни постижения</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Star size={24} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
              <Text style={styles.badgeText}>Първи отзив</Text>
            </View>
            <View style={styles.badge}>
              <Camera size={24} color="#8B5CF6" strokeWidth={2} />
              <Text style={styles.badgeText}>Фотограф</Text>
            </View>
            <View style={styles.badge}>
              <MessageCircle size={24} color="#10B981" strokeWidth={2} />
              <Text style={styles.badgeText}>Полезен</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FEF3C7',
  },
  joinDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E9D5FF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  menuValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  badgeContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  badgeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});