// components/LoadingScreen.tsx

import { COLORS } from '@/constants/colors';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
  variant?: 'default' | 'overlay';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message,
  variant = 'default',
}) => {
  if (variant === 'overlay') {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {message && <Text style={styles.overlayMessage}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loader */}
      <View style={styles.loaderWrapper}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
      
      {/* Message */}
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  loaderWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  
  message: {
    marginTop: 20,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  
  // Overlay variant
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  
  overlayContent: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 32,
    paddingVertical: 28,
    borderRadius: 20,
    alignItems: 'center',
    // Subtle shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  
  overlayMessage: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});