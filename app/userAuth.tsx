import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useGameStore } from '../store';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { width, height } = Dimensions.get('window');

// Your Google OAuth Client IDs
const WEB_CLIENT_ID = '211357533398-seaqbouc0vmue2eg9i3oh2dql5geojco.apps.googleusercontent.com';

// Configure Google Sign-In for Native
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

export default function UserAuth() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, theme } = useGameStore();
  const router = useRouter();

  const isLight = theme === 'light';
  const styles = getStyles(theme);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      if (Platform.OS === 'web') {
        // Web Flow
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const firebaseToken = await user.getIdToken();
        login(user.displayName || 'Player', user.uid, firebaseToken);
        router.replace('/');
      } else {
        // Native Flow (Android/iOS)
        await GoogleSignin.hasPlayServices();
        const { data } = await GoogleSignin.signIn();
        
        if (data?.idToken) {
          const credential = GoogleAuthProvider.credential(data.idToken);
          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;
          const firebaseToken = await user.getIdToken();
          
          login(user.displayName || 'Player', user.uid, firebaseToken);
          router.replace('/');
        } else {
          throw new Error('No ID token received from Google');
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === '7') {
        setErrorMsg('Network error. Check your connection.');
      } else if (error.code === '12501') {
        setErrorMsg('Sign-in cancelled.');
      } else {
        setErrorMsg(error.message || 'Google Sign-In failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isLight ? 'dark' : 'light'} />

      {/* Background Grid & Effects */}
      <View style={styles.gridContainer} pointerEvents="none">
        {[...Array(Math.floor(height / 40))].map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 40 }]} />
        ))}
        {[...Array(Math.floor(width / 40))].map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: i * 40 }]} />
        ))}
      </View>
      <View style={styles.glowSourceTop} />
      <View style={styles.glowSourceBottom} />

      <View style={styles.content}>
        {/* Header Text */}
        <View style={styles.header}>
          <Text style={styles.subHeading}>SYSTEM_ACCESS</Text>
          <Text style={styles.heading}>INITIALIZE</Text>
        </View>

        {/* Action Container */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>GOOGLE_NATIVE_AUTH</Text>

          {errorMsg ? (
            <Text style={{ color: 'red', marginBottom: 10, fontSize: 12 }}>{errorMsg}</Text>
          ) : null}

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              styles.loginButtonActive,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>GOOGLE SIGN-IN</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  const primaryText = isLight ? '#000000' : '#FFFFFF';
  const accent = isLight ? '#8000FF' : '#FF6500';
  const bg = isLight ? '#FFFFFF' : '#050506';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bg,
    },
    gridContainer: {
      ...StyleSheet.absoluteFillObject,
      opacity: isLight ? 0.08 : 0.05,
      zIndex: -2,
    },
    gridLineH: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: isLight ? '#000000' : '#FFFFFF',
    },
    gridLineV: {
      position: 'absolute',
      height: '100%',
      width: 1,
      backgroundColor: isLight ? '#000000' : '#FFFFFF',
    },
    glowSourceTop: {
      position: 'absolute',
      top: -100,
      left: -50,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: isLight ? 'rgba(128, 0, 255, 0.15)' : 'rgba(255, 101, 0, 0.15)',
      zIndex: -1,
    },
    glowSourceBottom: {
      position: 'absolute',
      bottom: -150,
      right: -100,
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: isLight ? 'rgba(128, 0, 255, 0.08)' : 'rgba(255, 101, 0, 0.08)',
      zIndex: -1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 30,
      justifyContent: 'center',
      paddingBottom: 50,
    },
    header: {
      marginBottom: 50,
    },
    subHeading: {
      color: isLight ? 'rgba(128, 0, 255, 0.8)' : 'rgba(255, 101, 0, 0.8)',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 4,
      marginBottom: 8,
    },
    heading: {
      color: primaryText,
      fontSize: 42,
      fontWeight: '900',
      letterSpacing: -1,
    },
    formContainer: {
      backgroundColor: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    },
    inputLabel: {
      color: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
      marginBottom: 10,
    },
    loginButton: {
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    loginButtonActive: {
      backgroundColor: accent,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 2,
    },
  });
};
