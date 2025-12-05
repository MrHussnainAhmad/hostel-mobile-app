// components/ui/RoleSelector.tsx

import { Building2, Check, GraduationCap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '@/constants/colors';

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
      <Text style={styles.label}>I am a</Text>

      <View style={styles.optionsContainer}>
        {roles.map((role) => {
          const isSelected = value === role.id;
          const IconComponent = role.icon;

          return (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onChange(role.id)}
              activeOpacity={0.7}
            >
              <View style={styles.topRow}>
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

                <View style={styles.iconContainer}>
                  <IconComponent
                    size={22}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                  />
                </View>
              </View>

              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.roleLabel,
                    isSelected && styles.roleLabelSelected,
                  ]}
                >
                  {role.label}
                </Text>
                <Text style={styles.roleDescription}>
                  {role.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  optionsContainer: {
    flexDirection: 'row',
    columnGap: 12,
  },
  option: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionSelected: {
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.primaryLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
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
    padding: 6,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  roleLabelSelected: {
    color: COLORS.primaryDark,
  },
  roleDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
    marginLeft: 2,
  },
});