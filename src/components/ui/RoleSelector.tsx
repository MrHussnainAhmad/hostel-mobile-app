// components/RoleSelector.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { Building2, Check, GraduationCap } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RoleSelectorProps {
  value: 'STUDENT' | 'MANAGER';
  onChange: (value: 'STUDENT' | 'MANAGER') => void;
  error?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const roles = [
    {
      id: 'STUDENT' as const,
      label: 'Student',
      description: 'Find and book hostels',
      icon: GraduationCap,
    },
    {
      id: 'MANAGER' as const,
      label: 'Manager',
      description: 'List and manage hostels',
      icon: Building2,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>I am a</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {roles.map((role) => {
          const isSelected = value === role.id;
          const IconComponent = role.icon;

          return (
            <Pressable
              key={role.id}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => onChange(role.id)}
            >
              {/* Top row: Check + Icon */}
              <View style={styles.topRow}>
                {/* Radio/Check indicator */}
                <View
                  style={[
                    styles.checkContainer,
                    isSelected && styles.checkContainerSelected,
                  ]}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      color={COLORS.textInverse}
                      strokeWidth={3}
                    />
                  )}
                </View>

                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected,
                  ]}
                >
                  <IconComponent
                    size={20}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                    strokeWidth={1.5}
                  />
                </View>
              </View>

              {/* Text content */}
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.roleLabel,
                    isSelected && styles.roleLabelSelected,
                  ]}
                >
                  {role.label}
                </Text>
                <Text 
                  style={[
                    styles.roleDescription,
                    isSelected && styles.roleDescriptionSelected,
                  ]}
                >
                  {role.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  
  option: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    // Subtle shadow when selected
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  checkContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkContainerSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconContainerSelected: {
    backgroundColor: COLORS.white,
  },
  
  textContainer: {
    alignItems: 'flex-start',
  },
  
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  
  roleLabelSelected: {
    color: COLORS.primaryDark,
  },
  
  roleDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },
  
  roleDescriptionSelected: {
    color: COLORS.textSecondary,
  },
  
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginTop: 8,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
});