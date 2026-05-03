import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useGameStore } from '../store';

const { width } = Dimensions.get('window');

type AudioType = 'MUTE' | 'BETA_WAVES' | 'RAIN' | 'BROWN_NOISE';

const AUDIO_SOURCES: Record<Exclude<AudioType, 'MUTE'>, any> = {
  BETA_WAVES: require('../assets/betawaves.mp3'),
  RAIN: require('../assets/rain.mp3'),
  BROWN_NOISE: require('../assets/brownnoise.wav'),
};

type Mode = 'FOCUS' | 'BREAK';

const TimerApp = () => {
  const [focusMinutes, setFocusMinutes] = useState('45');
  const [breakMinutes, setBreakMinutes] = useState('15');
  const [mode, setMode] = useState<Mode>('FOCUS');
  const [isWarmup, setIsWarmup] = useState(false);
  const [sprintDifficulty, setSprintDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [selectedAudio, setSelectedAudio] = useState<AudioType>('MUTE');
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { theme, addFocusXp, checkAndRecordWarmup } = useGameStore();
  const isLight = theme === 'light';
  const localStyles = getStyles(theme);

  const activeAccent = isWarmup ? '#76ABAE' : (mode === 'BREAK' ? '#00FF96' : (isLight ? '#8000FF' : '#FF6500'));

  useEffect(() => {
    let isMounted = true;
    
    async function loadAudio() {
      if (soundRef.current) {
        const oldSound = soundRef.current;
        soundRef.current = null;
        await oldSound.unloadAsync();
      }

      if (selectedAudio === 'MUTE') return;

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const source = AUDIO_SOURCES[selectedAudio as keyof typeof AUDIO_SOURCES];
        const { sound } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: isActive, isLooping: true, volume: 1.0 }
        );
        
        if (isMounted) {
          soundRef.current = sound;
        } else {
          sound.unloadAsync();
        }
      } catch (error) {
        console.log('Audio load error:', error);
      }
    }

    loadAudio();

    return () => {
      isMounted = false;
    };
  }, [selectedAudio]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (isWarmup) {
              setIsWarmup(false);
              return (parseInt(focusMinutes) || 0) * 60;
            }

            if (mode === 'FOCUS') {
              addFocusXp(parseInt(focusMinutes) || 0, sprintDifficulty);
              setMode('BREAK');
              setShowPopup(true);
              setTimeout(() => setShowPopup(false), 4000);
              return (parseInt(breakMinutes) || 0) * 60;
            } else {
              setMode('FOCUS');
              setIsActive(false);
              return (parseInt(focusMinutes) || 0) * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, isWarmup, mode, sprintDifficulty]);

  useEffect(() => {
    if (soundRef.current) {
      if (isActive && selectedAudio !== 'MUTE') {
        soundRef.current.playAsync().catch(() => {});
      } else {
        soundRef.current.pauseAsync().catch(() => {});
      }
    }
  }, [isActive, selectedAudio]);

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIgnite = () => {
    Keyboard.dismiss();
    if (!isActive && mode === 'FOCUS' && !isWarmup) {
      const needsWarmup = checkAndRecordWarmup();
      if (needsWarmup) {
        setIsWarmup(true);
        setSecondsLeft(180); // 3 Minute Warmup
      }
    }
    setIsActive(!isActive);
  };

  return (
    <View style={localStyles.container}>
      <View style={[localStyles.bgGlow, { opacity: isActive ? 0.3 : 0.1, top: 100, left: -50, backgroundColor: activeAccent }]} />

      {showPopup && (
        <View style={localStyles.popupContainer}>
          <Text style={localStyles.popupText}>EXP TRACKED. COMMENCING REST.</Text>
        </View>
      )}

      <View style={localStyles.glassCard}>
        <LinearGradient colors={isLight ? ['rgba(0,0,0,0.06)', 'transparent'] : ['rgba(255,255,255,0.12)', 'transparent']} style={localStyles.specularHighlight} />

        <Text style={[localStyles.label, { color: activeAccent }]}>
          {isWarmup ? 'SYSTEM CALIBRATION' : (mode === 'FOCUS' ? 'FOCUS SESSION' : 'BREAK SESSION')}
        </Text>

        {isWarmup && (
          <Text style={localStyles.warmupMessage}>PREPARE YOUR ENVIRONMENT</Text>
        )}

        <View style={[localStyles.timerOuterRing, { borderColor: isWarmup ? 'rgba(118, 171, 174, 0.4)' : 'rgba(255, 255, 255, 0.1)' }]}>
          <LinearGradient
            colors={isActive ? (isWarmup ? ['#76ABAE', '#31363F'] : mode === 'FOCUS' ? (isLight ? ['#8000FF', '#BF80FF'] : ['#FF6500', '#FF2D00']) : ['#00FF96', '#00CC7A']) : (isLight ? ['#E0E0E0', '#CCCCCC'] : ['#333', '#111'])}
            style={localStyles.timerCircle}
          >
            <View style={localStyles.innerCore}>
              <Text style={[localStyles.timerText, isActive && localStyles.glowText, isWarmup && { textShadowColor: '#76ABAE' }]}>
                {formatTime()}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Difficulty Selector */}
        <Text style={[localStyles.inputLabel, { marginTop: 0, marginBottom: 10, textAlign: 'center', opacity: 0.8 }]}>SPRINT DIFFICULTY</Text>
        <View style={localStyles.difficultyRow}>
          {(["EASY", "MEDIUM", "HARD"] as Array<'EASY' | 'MEDIUM' | 'HARD'>).map((option) => (
            <Pressable
              key={option}
              onPress={() => !isActive && !isWarmup && setSprintDifficulty(option)}
              style={({ pressed, hovered }) => [
                localStyles.difficultyChip,
                sprintDifficulty === option && localStyles.difficultyChipActive,
                pressed && !isActive && !isWarmup && { transform: [{ scale: 0.95 }] },
                hovered && !isActive && !isWarmup && sprintDifficulty !== option && { borderColor: activeAccent, backgroundColor: isLight ? 'rgba(128, 0, 255, 0.05)' : 'rgba(255, 101, 0, 0.1)' },
                (isActive || isWarmup) && { opacity: sprintDifficulty === option ? 1 : 0.3 }
              ]}
            >
              <Text style={[
                localStyles.difficultyText,
                sprintDifficulty === option && { color: activeAccent }
              ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Ambience Selector */}
        <Text style={[localStyles.inputLabel, { marginTop: 0, marginBottom: 10, textAlign: 'center', opacity: 0.8 }]}>AMBIENCE</Text>
        <View style={localStyles.difficultyRow}>
          {(["MUTE", "BETA_WAVES", "RAIN", "BROWN_NOISE"] as AudioType[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => setSelectedAudio(option)}
              style={({ pressed, hovered }) => [
                localStyles.difficultyChip,
                selectedAudio === option && localStyles.difficultyChipActive,
                pressed && { transform: [{ scale: 0.95 }] },
                hovered && selectedAudio !== option && { borderColor: activeAccent, backgroundColor: isLight ? 'rgba(128, 0, 255, 0.05)' : 'rgba(255, 101, 0, 0.1)' }
              ]}
            >
              <Text style={[
                localStyles.difficultyText,
                selectedAudio === option && { color: activeAccent }
              ]}>
                {option.replace('_', ' ')}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={localStyles.inputsWrapper}>
          <View style={localStyles.inputContainer}>
            <TextInput
              style={[localStyles.input, (isActive || isWarmup) && { opacity: 0.3 }]}
              keyboardType="number-pad"
              value={focusMinutes}
              onChangeText={(val) => {
                setFocusMinutes(val);
                if (!isActive) setSecondsLeft((parseInt(val) || 0) * 60);
              }}
              editable={!isActive && !isWarmup}
            />
            <Text style={[localStyles.inputLabel, mode === 'FOCUS' && { color: activeAccent, opacity: 1 }]}>FOCUS MINS</Text>
          </View>
          <View style={localStyles.inputContainer}>
            <TextInput
              style={[localStyles.input, (isActive || isWarmup) && { opacity: 0.3 }]}
              keyboardType="number-pad"
              value={breakMinutes}
              onChangeText={setBreakMinutes}
              editable={!isActive && !isWarmup}
            />
            <Text style={[localStyles.inputLabel, mode === 'BREAK' && { color: activeAccent, opacity: 1 }]}>BREAK MINS</Text>
          </View>
        </View>

        <View style={localStyles.buttonRow}>
          <Pressable style={localStyles.mainButton} onPress={handleIgnite}>
            <LinearGradient
              colors={isActive ? ['#333', '#222'] : (isWarmup ? ['#76ABAE', '#31363F'] : mode === 'FOCUS' ? (isLight ? ['#A64DFF', '#8000FF'] : ['#FF8533', '#FF6500']) : ['#00FF96', '#00CC7A'])}
              style={localStyles.buttonGradient}
            >
              <Text style={localStyles.buttonText}>{isActive ? 'HALT' : (isWarmup ? 'RESUME' : 'IGNITE')}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => {
            if (isWarmup) {
              setIsWarmup(false);
              setIsActive(true);
              setSecondsLeft((parseInt(focusMinutes) || 0) * 60);
            } else {
              setIsActive(false);
              setIsWarmup(false);
              setMode('FOCUS');
              setSecondsLeft((parseInt(focusMinutes) || 0) * 60);
            }
          }}>
            <Text style={localStyles.resetText}>{isWarmup ? 'SKIP WARMUP' : 'RESET SYSTEM'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: isLight ? '#EEE' : '#050505', justifyContent: 'center', alignItems: 'center' },
    bgGlow: { position: 'absolute', width: width, height: width, borderRadius: width / 2 },
    glassCard: { width: width * 0.9, paddingVertical: 50, borderRadius: 40, alignItems: 'center', backgroundColor: isLight ? 'rgba(255,255,255,0.8)' : '#222831', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    specularHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%' },
    label: { fontSize: 10, letterSpacing: 5, fontWeight: '900', marginBottom: 10 },
    warmupMessage: { color: '#76ABAE', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 25 },
    timerOuterRing: { padding: 10, borderRadius: 120, borderWidth: 1, marginBottom: 40 },
    timerCircle: { width: 210, height: 210, borderRadius: 105, padding: 2 },
    innerCore: { flex: 1, borderRadius: 105, backgroundColor: isLight ? '#FFF' : '#0a0a0c', justifyContent: 'center', alignItems: 'center' },
    timerText: { color: isLight ? '#000' : '#EEE', fontSize: 54, fontWeight: '200' },
    glowText: { textShadowRadius: 15 },
    difficultyRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    difficultyChip: { borderWidth: 1, borderColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' },
    difficultyChipActive: { borderColor: isLight ? '#8000FF' : '#FF6500', backgroundColor: isLight ? 'rgba(128, 0, 255, 0.1)' : 'rgba(255, 101, 0, 0.2)' },
    difficultyText: { color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    inputsWrapper: { flexDirection: 'row', gap: 30, marginBottom: 40 },
    inputContainer: { alignItems: 'center' },
    input: { color: isLight ? '#000' : '#EEE', fontSize: 32, fontWeight: '800', width: 80, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
    inputLabel: { fontSize: 9, letterSpacing: 2, marginTop: 10, fontWeight: '700', opacity: 0.4, color: isLight ? '#000' : '#EEE' },
    buttonRow: { width: '100%', alignItems: 'center', gap: 20 },
    mainButton: { width: '75%', height: 58, borderRadius: 16, overflow: 'hidden' },
    buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 4 },
    resetText: { color: '#76ABAE', fontSize: 10, fontWeight: '800', letterSpacing: 2, padding: 10 },
    popupContainer: { position: 'absolute', top: 60, padding: 16, backgroundColor: '#00FF96', borderRadius: 12, zIndex: 100 },
    popupText: { color: '#000', fontWeight: '900', fontSize: 12 }
  });
};

export default TimerApp;