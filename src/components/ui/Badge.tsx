// components/Badge.tsx

import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { 
    bg: COLORS.successLight, 
    text: COLORS.success,
    border: 'transparent',
  },
  error: { 
    bg: COLORS.errorLight, 
    text: COLORS.error,
    border: 'transparent',
  },
  warning: { 
    bg: COLORS.warningLight, 
    text: COLORS.warning,
    border: 'transparent',
  },
  info: { 
    bg: COLORS.infoLight, 
    text: COLORS.info,
    border: 'transparent',
  },
  default: { 
    bg: COLORS.bgSecondary, 
    text: COLORS.textSecondary,
    border: 'transparent',
  },
  primary: { 
    bg: COLORS.primaryLight, 
    text: COLORS.primary,
    border: 'transparent',
  },
};

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default',
  size = 'md',
  style,
}) => {
  const colors = variantColors[variant];

  return (
    <View 
      style={[
        styles.badge, 
        styles[`badge_${size}`],
        { 
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text 
        style={[
          styles.text, 
          styles[`text_${size}`],
          { color: colors.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // Size variants
  badge_sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badge_md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  text_sm: {
    fontSize: 10,
  },
  text_md: {
    fontSize: 11,
  },
});