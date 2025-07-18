import { Tabs } from 'expo-router';
import { MapPin, List as ListIcon, Plus } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { 
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        }],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Карта',
          tabBarIcon: ({ size, color }) => (
            <MapPin size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Добави',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size + 4} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Списък',
          tabBarIcon: ({ size, color }) => (
            <ListIcon size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  tabBarItem: {
    paddingTop: 8,
  },
});