import { Stack, useRouter } from "expo-router";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { createContext, useContext, useRef, useState } from "react";
import { useGameStore } from "../store";

const { width, height } = Dimensions.get("window");

type TransitionContextType = {
  navigateWithTransition: (path: any, mode?: "wipe" | "shutter" | "zoom") => void;
};

const TransitionContext = createContext<TransitionContextType>({
  navigateWithTransition: () => {},
});
export const useTransition = () => useContext(TransitionContext);

export default function RootLayout() {
  const router = useRouter();
  
  // Animation Values
  const slideAnim = useRef(new Animated.Value(-width * 1.5)).current;
  const shutterTop = useRef(new Animated.Value(-height / 2)).current;
  const shutterBottom = useRef(new Animated.Value(height)).current;
  const fadeZoom = useRef(new Animated.Value(0)).current;

  const { theme } = useGameStore();
  const isLight = theme === 'light';

  const [activeMode, setActiveMode] = useState<"wipe" | "shutter" | "zoom" | null>(null); // 'wipe', 'shutter', 'zoom'

  const navigateWithTransition = (path: any, mode: "wipe" | "shutter" | "zoom" = 'wipe') => {
    setActiveMode(mode);

    if (mode === 'wipe') {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }).start(() => {
        router.push(path);
        Animated.timing(slideAnim, {
          toValue: width * 1.5,
          duration: 250,
          delay: 50,
          useNativeDriver: true,
        }).start(() => {
          slideAnim.setValue(-width * 1.5);
          setActiveMode(null);
        });
      });
    } 

    else if (mode === 'shutter') {
      // Top and Bottom bars meet in the middle
      Animated.parallel([
        Animated.timing(shutterTop, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(shutterBottom, { toValue: height / 2, duration: 250, useNativeDriver: true })
      ]).start(() => {
        router.push(path);
        Animated.parallel([
          Animated.timing(shutterTop, { toValue: -height / 2, duration: 200, delay: 100, useNativeDriver: true }),
          Animated.timing(shutterBottom, { toValue: height, duration: 200, delay: 100, useNativeDriver: true })
        ]).start(() => setActiveMode(null));
      });
    }

    else if (mode === 'zoom') {
      // Cinematic fade and scale up
      Animated.timing(fadeZoom, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        router.push(path);
        Animated.timing(fadeZoom, { toValue: 0, duration: 300, delay: 100, useNativeDriver: true }).start(() => setActiveMode(null));
      });
    }
  };

  return (
    <TransitionContext.Provider value={{ navigateWithTransition }}>
      <View style={{ flex: 1, backgroundColor: isLight ? '#FFFFFF' : '#050506' }}>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
        
        {/* 1. Tactical Wipe (Teal) */}
        {activeMode === 'wipe' && (
          <Animated.View style={[styles.wipeOverlay, { transform: [{ translateX: slideAnim }, { skewX: '-10deg' }], backgroundColor: isLight ? '#F5F5F5' : '#000000' }]} />
        )}

        {/* 2. Shutter (Orange/Purple) */}
        {activeMode === 'shutter' && (
          <>
            <Animated.View style={[styles.shutterBar, { top: 0, transform: [{ translateY: shutterTop }], backgroundColor: isLight ? '#8000FF' : '#FF6500' }]} />
            <Animated.View style={[styles.shutterBar, { top: 0, transform: [{ translateY: shutterBottom }], backgroundColor: isLight ? '#8000FF' : '#FF6500' }]} />
          </>
        )}

        {/* 3. Fade Zoom (Clean) */}
        {activeMode === 'zoom' && (
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: isLight ? '#FFFFFF' : '#050506', opacity: fadeZoom }]} />
        )}
      </View>
    </TransitionContext.Provider>
  );
}

const styles = StyleSheet.create({
  wipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', 
    zIndex: 9999,
    width: width * 1.3,
    left: -width * 0.15,
  },
  shutterBar: {
    position: 'absolute',
    width: width,
    height: height / 2,
    zIndex: 9999,
  }
});