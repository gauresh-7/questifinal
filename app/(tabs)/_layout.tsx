import { Tabs } from 'expo-router';
import { useGameStore } from '../../store';
import { Image } from 'expo-image';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { theme } = useGameStore();
  const isLight = theme === 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isLight ? '#F5F5F5' : '#050506',
          borderBottomColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isLight ? '#000000' : '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '900',
        },
        tabBarStyle: {
          backgroundColor: isLight ? '#F5F5F5' : '#050506',
          borderTopColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: isLight ? '#8000FF' : '#FF6500',
        tabBarInactiveTintColor: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          headerShown: false, // Hide header on home as it has a custom look
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('../../assets/images/Home.png')} 
              style={{ width: 22, height: 22, tintColor: color }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'QUESTS',
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('../../assets/images/questIcon.png')} 
              style={{ width: 22, height: 22, tintColor: color }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="userdetails"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('../../assets/images/userIcon.png')} 
              style={{ width: 22, height: 22, tintColor: color }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SYSTEM_CONFIG',
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('../../assets/images/settings.png')} 
              style={{ width: 22, height: 22, tintColor: color }} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
