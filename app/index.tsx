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
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ICONS = [
  { name: 'bed-outline', lib: 'ion', x: 0.1, y: 0.12 },
  { name: 'home-outline', lib: 'ion', x: 0.88, y: 0.08 },
  { name: 'key-outline', lib: 'ion', x: 0.06, y: 0.38 },
  { name: 'door', lib: 'mci', x: 0.92, y: 0.32 },
  { name: 'wifi-outline', lib: 'ion', x: 0.1, y: 0.62 },
  { name: 'shield-checkmark-outline', lib: 'ion', x: 0.9, y: 0.58 },
  { name: 'location-outline', lib: 'ion', x: 0.08, y: 0.85 },
  { name: 'office-building', lib: 'mci', x: 0.92, y: 0.82 },
];

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(15)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const iconsOpacity = useRef(new Animated.Value(0)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimations();
    initAuth();
  }, []);

  const initAuth = async () => {
    await checkAuth();
    setReady(true);
  };

  const startAnimations = () => {
    // Icons fade in
    Animated.timing(iconsOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Icons floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloat, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(iconFloat, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.03,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text animation
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(textY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Progress bar
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1800,
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
      }, 2300);

      return () => clearTimeout(timer);
    }
  }, [ready, isLoading, isAuthenticated, user]);

  const floatY = iconFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.container}>
        {/* Background Icons */}
        <Animated.View
          style={[
            styles.iconsContainer,
            { opacity: iconsOpacity, transform: [{ translateY: floatY }] },
          ]}
        >
          {ICONS.map((icon, index) => (
            <View
              key={index}
              style={[
                styles.iconWrapper,
                {
                  left: width * icon.x - 12,
                  top: height * icon.y - 12,
                },
              ]}
            >
              {icon.lib === 'ion' ? (
                <Ionicons
                  name={icon.name as any}
                  size={24}
                  color={COLORS.border} // #E5E7EB-ish
                />
              ) : (
                <MaterialCommunityIcons
                  name={icon.name as any}
                  size={24}
                  color={COLORS.border}
                />
              )}
            </View>
          ))}
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={{
              transform: [
                { scale: Animated.multiply(logoScale, pulse) },
                { translateY: logoY },
              ],
            }}
          >
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Text */}
          <Animated.View
            style={[
              styles.textContainer,
              { opacity: textOpacity, transform: [{ translateY: textY }] },
            ]}
          >
            <View style={styles.divider} />
            <Text style={styles.tagline}>Find your perfect stay</Text>
          </Animated.View>
        </View>

        {/* Progress */}
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
  iconsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  iconWrapper: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 28,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginVertical: 14,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bottom: {
    position: 'absolute',
    bottom: 60,
    left: 60,
    right: 60,
  },
  track: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});