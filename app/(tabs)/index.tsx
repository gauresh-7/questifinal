import React, { useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Pressable, Dimensions, Platform, SafeAreaView } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing
} from "react-native-reanimated";
import { MotiView, MotiText } from 'moti';

import { useGameStore } from "../../store";
import { Redirect, useRouter } from "expo-router";

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.24;

export default function Index() {
  const router = useRouter();
  const { user, currentXp, nextLevelXp, level, theme, avatarType } = useGameStore();

  const xpPercentage = nextLevelXp > 0 ? (currentXp / nextLevelXp) * 100 : 0;
  const isLight = theme === 'light';
  const accent = isLight ? '#8000FF' : '#FF6500';
  const localStyles = getStyles(theme);

  // Animation Values
  const bloomScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // 1. Ambient Breathing Animation
    bloomScale.value = withRepeat(
      withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    // 2. Animate XP bar on load
    progressWidth.value = withSpring(xpPercentage, { damping: 15 });
  }, [xpPercentage]);

  const animatedBloomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bloomScale.value }],
    opacity: withTiming(bloomScale.value - 0.2)
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));


  const handlePress = (path: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path);
  };

  return (
    <View style={localStyles.container}>
      <StatusBar style={isLight ? "dark" : "light"} />

      {/* Dynamic Background Glow */}
      <View style={localStyles.glowPositioner} pointerEvents="none">
        <Animated.View style={[localStyles.ambientBloomInner, animatedBloomStyle]} />
        <View style={localStyles.subtleStreak} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- XP Card with Entrance Animation --- */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
            style={localStyles.glassLevelCard}
          >
            <View style={localStyles.levelHeader}>
              <View>
                <Text style={localStyles.welcomeLabel}>CHAMPION</Text>
                <MotiText
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 300 }}
                  style={localStyles.welcomeText}
                >
                  {user.username.toUpperCase()}
                </MotiText>
              </View>
              <View style={localStyles.xpBadge}>
                <Text style={localStyles.xpScoreText}>{currentXp}</Text>
                <Image style={localStyles.profileIconSmall} source={require('../../assets/images/userIcon.png')} />
              </View>
            </View>

            <View style={localStyles.progressBarContainer}>
              <Animated.View style={[localStyles.progressBarFill, animatedProgressStyle]} />
            </View>

            <Text style={localStyles.progressText}>
              LEVEL {level}  •  {currentXp} / {nextLevelXp} XP
            </Text>
          </MotiView>

          <View style={localStyles.mainBodyRow}>
            {/* Avatar with subtle scale-in */}
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 200 }}
              style={localStyles.glassAvatarWrapper}
            >
              <Image
                source={
                  avatarType === 'WIZARD1' ? require('../../assets/images/wizard1.png') :
                  avatarType === 'WIZARD2' ? require('../../assets/images/wizard2.png') :
                  avatarType === 'WIZARD3' ? require('../../assets/images/wizard3.png') :
                  require('../../assets/images/userIcon.png')
                }
                style={localStyles.avatarImage}
                contentFit="cover"
              />
            </MotiView>

            <View style={localStyles.buttonColumn}>
              {['Quests', 'Focus'].map((label, index) => (
                <MotiView
                  key={label}
                  from={{ translateX: 50, opacity: 0 }}
                  animate={{ translateX: 0, opacity: 1 }}
                  transition={{ delay: 400 + (index * 100) }}
                  style={{ width: '100%' }}
                >
                  <Pressable
                    style={({ pressed }) => [
                      localStyles.actionButton,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }
                    ]}
                    onPress={() => handlePress(label === 'Quests' ? "/(tabs)/tasks" : "/timer")}
                  >
                    {({ pressed, hovered }) => (
                      <>
                        <View style={[
                          localStyles.glassIconCircle,
                          hovered && { backgroundColor: isLight ? 'rgba(128, 0, 255, 0.1)' : 'rgba(255, 101, 0, 0.15)', borderColor: accent }
                        ]}>
                          <Image
                            style={[
                              label === 'Quests' ? localStyles.questIconInner : localStyles.focusIconInner,
                              hovered && { tintColor: accent }
                            ]}
                            source={label === 'Quests' ? require('../../assets/images/questIcon.png') : require('../../assets/images/clock icon.png')}
                            contentFit="contain"
                          />
                        </View>
                        <Text style={[localStyles.buttonLabel, hovered && { color: accent }]}>{label}</Text>
                      </>
                    )}
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </View>

          {/* Stats Rows with Staggered Entrance */}
          <View style={localStyles.statsContainer}>
            {[
              { label: 'IDENTITY_TAG', value: `@${user.username.toLowerCase()}` },
              { label: 'CLASS', value: avatarType.startsWith('WIZARD') ? 'WIZARD' : 'KNIGHT' }
            ].map((item, i) => (
              <MotiView
                key={item.label}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 700 + (i * 100) }}
                style={localStyles.etchedStatRow}
              >
                <Text style={localStyles.statLabel}>{item.label}</Text>
                <Text style={localStyles.statValue}>{item.value}</Text>
              </MotiView>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  const primaryText = isLight ? '#000000' : '#FFFFFF';
  const accent = isLight ? '#8000FF' : '#FF6500';
  const bg = isLight ? '#FFFFFF' : '#050506';

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: bg },
    topSpacing: { height: Platform.OS === 'ios' ? 40 : 50 },
    glowPositioner: { position: 'absolute', top: 200, right: -100, width: 300, height: 300, zIndex: -1 },
    ambientBloomInner: { width: 250, height: 250, borderRadius: 125, backgroundColor: isLight ? 'rgba(128, 0, 255, 0.15)' : 'rgba(255, 101, 0, 0.15)' },
    subtleStreak: { position: 'absolute', width: height, height: 1, backgroundColor: isLight ? 'rgba(128, 0, 255, 0.2)' : 'rgba(255, 101, 0, 0.2)', transform: [{ rotate: '45deg' }] },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    glassLevelCard: { backgroundColor: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)', padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)' },
    levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    welcomeLabel: { color: isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    welcomeText: { color: accent, fontSize: 32, fontWeight: '900' },
    xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    xpScoreText: { color: primaryText, fontSize: 14, fontWeight: '800' },
    profileIconSmall: { width: 20, height: 20, borderRadius: 10 },
    progressBarContainer: { height: 6, backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 20, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: accent }, 
    progressText: { color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', marginTop: 10, textAlign: 'center' },
    mainBodyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    glassAvatarWrapper: { width: '58%', aspectRatio: 1, backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', borderRadius: 24, borderWidth: 1, borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
    avatarInner: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
    avatarImage: { width: '100%', height: '100%', borderRadius: 24 },
    buttonColumn: { width: '35%', gap: 20, alignItems: 'center' },
    actionButton: { alignItems: 'center', width: '100%' },
    glassIconCircle: { width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2, borderWidth: 1, borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)', backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    questIconInner: { width: '50%', height: '50%', tintColor: isLight ? '#000000' : undefined },
    buttonLabel: { color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    focusIconInner: { width: '50%', height: '50%', tintColor: isLight ? '#000000' : undefined },
    statsContainer: { marginTop: 25, gap: 10 },
    etchedStatRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)' },
    statLabel: { color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '800' },
    statValue: { color: primaryText, fontSize: 14, fontWeight: '600' }
  });
};
