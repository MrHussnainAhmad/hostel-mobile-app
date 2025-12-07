// components/Card.tsx

import { COLORS } from '@/constants/colors';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
  disabled = false,
}) => {
  const cardStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  // If pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          cardStyles,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    // Subtle border for definition
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  
  elevated: {
    borderWidth: 0,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  
  outlined: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  
  disabled: {
    opacity: 0.6,
  },
});