// components/ui/Badge.tsx

import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: COLORS.successLight, text: COLORS.success },
  error: { bg: COLORS.errorLight, text: COLORS.error },
  warning: { bg: COLORS.warningLight, text: COLORS.warning },
  info: { bg: COLORS.infoLight, text: COLORS.info },
  default: { bg: COLORS.bgSecondary, text: COLORS.textSecondary },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const colors = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});