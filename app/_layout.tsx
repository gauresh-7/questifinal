import { Stack } from "expo-router";
import { useGameStore } from "../store";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const { theme } = useGameStore();
  const isLight = theme === 'light';

  return (
    <>
      <StatusBar style={isLight ? "dark" : "light"} />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: isLight ? '#FFFFFF' : '#050506' },
          headerStyle: { backgroundColor: isLight ? '#F5F5F5' : '#050506' },
          headerTintColor: isLight ? '#000000' : '#FFFFFF',
        }} 
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="timer" 
          options={{ 
            headerShown: true, 
            title: 'FOCUS MODE',
            headerTitleStyle: { fontWeight: '900' }
          }} 
        />
        <Stack.Screen 
          name="userAuth" 
          options={{ 
            headerShown: false,
            animation: 'fade'
          }} 
        />
      </Stack>
    </>
  );
}