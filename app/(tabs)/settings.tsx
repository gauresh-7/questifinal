import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert, TextInput } from 'react-native';
import { useGameStore } from '../../store';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Settings() {
  const { user, theme, toggleTheme, logout, updateUsername } = useGameStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newName, setNewName] = useState(user?.username || '');

  useEffect(() => {
    if (user?.username) {
      setNewName(user.username);
    }
  }, [user?.username]);

  const isLight = theme === 'light';
  const styles = getStyles(theme);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const handleUpdateUsername = () => {
    if (newName.trim().length < 3) {
      Alert.alert('Invalid Name', 'Username must be at least 3 characters long.');
      return;
    }
    updateUsername(newName.trim());
    setIsEditingUsername(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>AESTHETIC_MODE</Text>
          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>{isLight ? 'DAY' : 'NIGHT'}</Text>
            <Switch
              value={isLight}
              onValueChange={toggleTheme}
              trackColor={{ false: 'rgba(255, 101, 0, 0.4)', true: 'rgba(128, 0, 255, 0.4)' }}
              thumbColor={isLight ? '#8000FF' : '#FF6500'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        <View style={[styles.settingRow, { marginTop: 16 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>IDENTITY_TAG</Text>
            {isEditingUsername ? (
              <TextInput
                style={styles.usernameInput}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                maxLength={20}
                placeholder="Enter new name..."
                placeholderTextColor={isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}
              />
            ) : (
              <Text style={styles.usernameValue}>@{user?.username.toLowerCase()}</Text>
            )}
          </View>
          <Pressable 
            onPress={isEditingUsername ? handleUpdateUsername : () => setIsEditingUsername(true)}
            style={({ pressed }) => [
              styles.editButton,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Text style={styles.editButtonText}>
              {isEditingUsername ? 'SAVE' : 'EDIT'}
            </Text>
          </Pressable>
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>TERMINATE_SESSION</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#FFFFFF' : '#050506',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)',
    },
    settingLabel: {
      color: isLight ? '#000000' : '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 1,
    },
    switchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    switchLabel: {
      color: isLight ? '#8000FF' : '#FF6500',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 2,
    },
    logoutButton: {
      marginTop: 20,
      backgroundColor: isLight ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 50, 50, 0.1)',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isLight ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 50, 50, 0.3)',
      alignItems: 'center',
    },
    logoutButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    logoutText: {
      color: isLight ? '#FF3B30' : '#FF453A',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 2,
    },
    usernameValue: {
      color: isLight ? '#8000FF' : '#FF6500',
      fontSize: 18,
      fontWeight: '900',
      marginTop: 4,
    },
    usernameInput: {
      color: isLight ? '#8000FF' : '#FF6500',
      fontSize: 18,
      fontWeight: '900',
      marginTop: 4,
      padding: 0,
    },
    editButton: {
      backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    },
    editButtonText: {
      color: isLight ? '#000000' : '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
  });
};
