import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useGameStore } from '../../store';

export default function Settings() {
  const { theme, toggleTheme } = useGameStore();

  const isLight = theme === 'light';
  const styles = getStyles(theme);

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
  });
};
