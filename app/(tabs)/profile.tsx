// import React from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { User, Star, MapPin, Camera, Settings, CircleHelp as HelpCircle, Share2, Award, Heart, MessageCircle, Bell, Shield } from 'lucide-react-native';
// import { useTheme } from '@/hooks/useTheme';

// export default function ProfileScreen() {
//   const { colors, theme } = useTheme();

//   const userData = {
//     name: 'Мария Иванова',
//     level: 5,
//     reviewCount: 23,
//     photosCount: 47,
//     favoritesCount: 12,
//     helpfulVotes: 89,
//     joinedDate: 'Януари 2023',
//   };

//   const handleSettingsPress = () => {
//     Alert.alert('Настройки', 'Тук ще бъдат настройките на профила.');
//   };

//   const handleHelpPress = () => {
//     Alert.alert('Помощ', 'Тук ще бъде раздела за помощ.');
//   };

//   const handleSharePress = () => {
//     Alert.alert('Сподели', 'Сподели приложението с приятели.');
//   };

//   const menuItems = [
//     {
//       icon: Star,
//       label: 'Моите отзиви',
//       value: `${userData.reviewCount} отзива`,
//       color: '#F59E0B',
//       onPress: () => Alert.alert('Отзиви', 'Вижте всички ваши отзиви.')
//     },
//     {
//       icon: Camera,
//       label: 'Моите снимки',
//       value: `${userData.photosCount} снимки`,
//       color: '#8B5CF6',
//       onPress: () => Alert.alert('Снимки', 'Вижте всички ваши снимки.')
//     },
//     {
//       icon: Heart,
//       label: 'Любими места',
//       value: `${userData.favoritesCount} места`,
//       color: '#EF4444',
//       onPress: () => Alert.alert('Любими', 'Вижте любимите си места.')
//     },
//     {
//       icon: Award,
//       label: 'Достижения',
//       value: 'Ниво 5',
//       color: '#10B981',
//       onPress: () => Alert.alert('Достижения', 'Вижте всички ваши достижения.')
//     },
//     {
//       icon: Bell,
//       label: 'Известия',
//       value: '',
//       color: '#6B7280',
//       onPress: () => Alert.alert('Известия', 'Настройки за известия.')
//     },
//     {
//       icon: Shield,
//       label: 'Поверителност',
//       value: '',
//       color: '#6B7280',
//       onPress: () => Alert.alert('Поверителност', 'Настройки за поверителност.')
//     },
//     {
//       icon: Settings,
//       label: 'Настройки',
//       value: '',
//       color: '#6B7280',
//       onPress: handleSettingsPress
//     },
//     {
//       icon: HelpCircle,
//       label: 'Помощ',
//       value: '',
//       color: '#6B7280',
//       onPress: handleHelpPress
//     },
//     {
//       icon: Share2,
//       label: 'Сподели приложението',
//       value: '',
//       color: '#6B7280',
//       onPress: handleSharePress
//     },
//   ];

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <LinearGradient
//         colors={theme === 'light' ? ['#7C3AED', '#A855F7'] : ['#4F46E5', '#7C3AED']}
//         style={styles.header}
//       >
//         <View style={styles.profileInfo}>
//           <View style={styles.avatarContainer}>
//             <LinearGradient
//               colors={['#FFFFFF', '#F3F4F6']}
//               style={styles.avatar}
//             >
//               <User size={48} color="#7C3AED" strokeWidth={2} />
//             </LinearGradient>
//           </View>
//           <View style={styles.userInfo}>
//             <Text style={styles.userName}>{userData.name}</Text>
//             <View style={styles.levelContainer}>
//               <Award size={16} color="#FEF3C7" strokeWidth={2} />
//               <Text style={styles.userLevel}>Ниво {userData.level}</Text>
//             </View>
//             <Text style={styles.joinDate}>Член от {userData.joinedDate}</Text>
//           </View>
//         </View>
//       </LinearGradient>

//       <View style={[styles.statsContainer, {
//         backgroundColor: colors.surface,
//         borderBottomColor: colors.border,
//       }]}>
//         <View style={styles.statItem}>
//           <Text style={[styles.statNumber, { color: colors.text }]}>{userData.reviewCount}</Text>
//           <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Отзива</Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={[styles.statNumber, { color: colors.text }]}>{userData.photosCount}</Text>
//           <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Снимки</Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={[styles.statNumber, { color: colors.text }]}>{userData.helpfulVotes}</Text>
//           <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Полезни гласа</Text>
//         </View>
//       </View>

//       <ScrollView
//         style={[styles.scrollView, { backgroundColor: colors.background }]}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
//           {menuItems.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={[styles.menuItem, { borderBottomColor: colors.border }]}
//               onPress={item.onPress}
//               activeOpacity={0.8}
//             >
//               <View style={styles.menuItemLeft}>
//                 <View style={[styles.menuIcon, { backgroundColor: colors.background }]}>
//                   <item.icon size={20} color={item.color} strokeWidth={2} />
//                 </View>
//                 <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
//               </View>
//               {item.value && <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{item.value}</Text>}
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={[styles.badgeContainer, { backgroundColor: colors.surface }]}>
//           <Text style={[styles.badgeTitle, { color: colors.text }]}>Последни постижения</Text>
//           <View style={styles.badgeRow}>
//             <View style={[styles.badge, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//             }]}>
//               <Star size={24} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
//               <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Първи отзив</Text>
//             </View>
//             <View style={[styles.badge, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//             }]}>
//               <Camera size={24} color="#8B5CF6" strokeWidth={2} />
//               <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Фотограф</Text>
//             </View>
//             <View style={[styles.badge, {
//               backgroundColor: colors.background,
//               borderColor: colors.border,
//             }]}>
//               <MessageCircle size={24} color="#10B981" strokeWidth={2} />
//               <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Полезен</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.bottomPadding} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingTop: 60,
//     paddingBottom: 24,
//     paddingHorizontal: 16,
//   },
//   profileInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   avatarContainer: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 24,
//     fontFamily: 'Inter-Bold',
//     color: '#FFFFFF',
//     marginBottom: 4,
//   },
//   levelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginBottom: 4,
//   },
//   userLevel: {
//     fontSize: 16,
//     fontFamily: 'Inter-SemiBold',
//     color: '#FEF3C7',
//   },
//   joinDate: {
//     fontSize: 14,
//     fontFamily: 'Inter-Regular',
//     color: '#E9D5FF',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontFamily: 'Inter-Bold',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 14,
//     fontFamily: 'Inter-Medium',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   menuContainer: {
//     marginTop: 16,
//     paddingHorizontal: 16,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   menuIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   menuLabel: {
//     fontSize: 16,
//     fontFamily: 'Inter-Medium',
//   },
//   menuValue: {
//     fontSize: 14,
//     fontFamily: 'Inter-Regular',
//   },
//   badgeContainer: {
//     marginTop: 16,
//     paddingHorizontal: 16,
//     paddingVertical: 20,
//   },
//   badgeTitle: {
//     fontSize: 18,
//     fontFamily: 'Inter-SemiBold',
//     marginBottom: 16,
//   },
//   badgeRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   badge: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   badgeText: {
//     fontSize: 12,
//     fontFamily: 'Inter-Medium',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   bottomPadding: {
//     height: 100,
//   },
// });
