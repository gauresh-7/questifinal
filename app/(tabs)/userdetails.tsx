import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useGameStore } from "../../store";

const { width, height } = Dimensions.get('window');

const UserDetails = () => {
    const { user, level, currentXp, nextLevelXp, theme } = useGameStore();

    const isLight = theme === 'light';
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* --- 1. Tactical Micro-Grid --- */}
            <View style={styles.gridContainer} pointerEvents="none">
                {[...Array(Math.floor(height / 40))].map((_, i) => (
                    <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 40 }]} />
                ))}
                {[...Array(Math.floor(width / 40))].map((_, i) => (
                    <View key={`v-${i}`} style={[styles.gridLineV, { left: i * 40 }]} />
                ))}
            </View>

            {/* --- 2. Enhanced Radiant Glow --- */}
            <View style={styles.glowSource} />
            
            {/* 3. Liquid Glass Avatar Card */}
            <View style={styles.glassCard}>
                <View style={styles.avatarInner}>
                    <Image 
                      source={require('../../assets/images/player_avatar.png')} 
                      style={styles.avatarImage} 
                      contentFit="cover"
                      contentPosition="right"
                    />
                </View>
            </View>

            {/* 4. Glass Detail Rows */}
            <View style={styles.detailsContainer}>
                {[
                    { label: 'Name', value: user?.username.toUpperCase() || 'UNKNOWN' },
                    { label: 'Class', value: 'Knight' },
                    { label: 'Level', value: level.toString() },
                    { label: 'Next Ascension', value: `${nextLevelXp - currentXp} XP` },
                ].map((item, index) => (
                    <View key={index} style={styles.glassDetailRow}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const getStyles = (theme: 'dark' | 'light') => {
    const isLight = theme === 'light';
    const primaryText = isLight ? '#000000' : '#FFFFFF';
    const accent = isLight ? '#8000FF' : '#FF6500';
    const bg = isLight ? '#FFFFFF' : '#070708';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: bg, 
            alignItems: 'center',
            paddingTop: 40,
        },
        gridContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: isLight ? 0.08 : 0.05, 
        },
        gridLineH: {
            position: 'absolute',
            width: '100%',
            height: 0.5, 
            backgroundColor: isLight ? '#000000' : 'rgba(255, 255, 255, 0.4)',
        },
        gridLineV: {
            position: 'absolute',
            height: '100%',
            width: 0.5, 
            backgroundColor: isLight ? '#000000' : 'rgba(255, 255, 255, 0.4)',
        },
        glowSource: {
            position: 'absolute',
            bottom: 120,
            left: -80,
            width: 250,
            height: 250,
            borderRadius: 125,
            backgroundColor: isLight ? 'rgba(128, 0, 255, 0.15)' : 'rgba(255, 101, 0, 0.15)', 
            ...Platform.select({
                ios: {
                    shadowColor: accent,
                    shadowOpacity: 0.8,
                    shadowRadius: 100,
                },
                android: {
                    elevation: 30, 
                }
            }),
        },
        glassCard: {
            width: width * 0.8,
            height: width * 0.8,
            backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255, 255, 255, 0.02)',
            borderRadius: 24,
            padding: 1,
            marginBottom: 40,
            borderWidth: 1.5,
            borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.15)', 
        },
        avatarInner: {
            flex: 1,
            backgroundColor: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255, 255, 255, 0.01)',
            borderRadius: 23,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
            borderRadius: 23,
        },
        detailsContainer: {
            width: '100%',
            paddingHorizontal: 25,
            gap: 12,
        },
        glassDetailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255, 255, 255, 0.04)',
            paddingVertical: 18,
            paddingHorizontal: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255, 255, 255, 0.08)',
        },
        label: {
            color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255, 255, 255, 0.35)',
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        value: {
            color: primaryText,
            fontSize: 17,
            fontWeight: '600',
        }
    });
};

export default UserDetails;
