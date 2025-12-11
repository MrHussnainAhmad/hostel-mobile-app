// components/EmptyState.tsx

import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <View style={styles.container}>
      {/* Icon with subtle background */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
      </View>

      {/* Title */}
      <AppText style={styles.title}>{title}</AppText>

      {/* Description */}
      {description && (
        <AppText style={styles.description}>{description}</AppText>
      )}

      {/* Action button */}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconWrapper: {
    marginBottom: 24,
  },
  
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  
  action: {
    marginTop: 32,
    width: '100%',
    maxWidth: 200,
  },
});