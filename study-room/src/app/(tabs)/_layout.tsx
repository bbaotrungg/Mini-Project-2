import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../ui';
export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: 'white', borderTopColor: colors.border }, tabBarLabelStyle: { fontWeight: '700', fontSize: 12 } }}>
    <Tabs.Screen name="index" options={{ title: 'Discover', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23 }}>⌕</Text> }} />
    <Tabs.Screen name="bookings" options={{ title: 'My Bookings', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 21 }}>▤</Text> }} />
    <Tabs.Screen name="profile" options={{ title: 'My Session', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>◉</Text> }} />
  </Tabs>;
}
