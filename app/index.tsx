// screens/SplashScreen.tsx

import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../src/components/common/AppText';

const { width, height } = Dimensions.get('window');

// Simplified icon set - fewer icons for cleaner look
const ICONS = [
  { name: 'bed-outline', lib: 'ion', x: 0.12, y: 0.15 },
  { name: 'home-outline', lib: 'ion', x: 0.88, y: 0.12 },
  { name: 'key-outline', lib: 'ion', x: 0.08, y: 0.45 },
  { name: 'wifi-outline', lib: 'ion', x: 0.92, y: 0.42 },
  { name: 'location-outline', lib: 'ion', x: 0.1, y: 0.75 },
  { name: 'shield-checkmark-outline', lib: 'ion', x: 0.9, y: 0.72 },
];

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  // Animation values - simplified
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(10)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const iconsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
    initAuth();
  }, []);

  const initAuth = async () => {
    await checkAuth();
    setReady(true);
  };

  const startAnimations = () => {
    // Icons fade in gently
    Animated.timing(iconsOpacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Logo entrance - simple fade and scale
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Text animation - delayed entry
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Progress bar - smooth linear progress
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    if (ready && !isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated && user) {
          router.replace(
            user.role === 'STUDENT'
              ? '/(app)/student'
              : user.role === 'MANAGER'
              ? '/(app)/manager'
              : '/(auth)/login'
          );
        } else {
          router.replace('/(auth)/login');
        }
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [ready, isLoading, isAuthenticated, user]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.container}>
        {/* Background Icons - Static, subtle */}
        <Animated.View
          style={[styles.iconsContainer, { opacity: iconsOpacity }]}
        >
          {ICONS.map((icon, index) => (
            <View
              key={index}
              style={[
                styles.iconWrapper,
                {
                  left: width * icon.x - 14,
                  top: height * icon.y - 14,
                },
              ]}
            >
              {icon.lib === 'ion' ? (
                <Ionicons
                  name={icon.name as any}
                  size={28}
                  color={COLORS.watermarkIcon}
                />
              ) : (
                <MaterialCommunityIcons
                  name={icon.name as any}
                  size={28}
                  color={COLORS.watermarkIcon}
                />
              )}
            </View>
          ))}
        </Animated.View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textY }],
              },
            ]}
          >
            <View style={styles.divider} />
            <AppText style={styles.tagline}>Find your perfect stay</AppText>
          </Animated.View>
        </View>

        {/* Progress Bar */}
        <Animated.View style={[styles.bottom, { opacity: textOpacity }]}>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.bar,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <AppText style={styles.loadingText}>Loading...</AppText>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  container: {
    flex: 1,
  },
  
  // Background icons
  iconsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  iconWrapper: {
    position: 'absolute',
  },
  
  // Main content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 140,
    height: 60,
  },
  
  textContainer: {
    alignItems: 'center',
  },
  divider: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  
  // Bottom progress
  bottom: {
    position: 'absolute',
    bottom: 80,
    left: 60,
    right: 60,
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.borderLight,
    borderRadius: 1,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});