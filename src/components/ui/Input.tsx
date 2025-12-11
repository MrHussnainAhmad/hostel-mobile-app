// components/Input.tsx

import { COLORS } from '@/constants/colors';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle
} from 'react-native';
import AppText from '../common/AppText';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return COLORS.inputBorder;
  };

  const getBackgroundColor = () => {
    if (error) return COLORS.errorLight;
    return COLORS.inputBg;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText
          style={[
            styles.label,
            isFocused && styles.labelFocused,
            error && styles.labelError,
          ]}
        >
          {label}
        </AppText>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* FIXED: Replaced broken AppTextInput with proper TextInput wrapped for Urdu font */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={COLORS.inputPlaceholder}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          selectionColor={COLORS.primary}
          {...props}
        />

        {secureTextEntry && (
          <Pressable
            style={styles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={COLORS.textMuted} />
            ) : (
              <Eye size={20} color={COLORS.textMuted} />
            )}
          </Pressable>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <AppText style={styles.errorText}>{error}</AppText>}

      {hint && !error && <AppText style={styles.hintText}>{hint}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  labelError: {
    color: COLORS.error,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    backgroundColor: COLORS.inputBg,
  },

  inputWrapperFocused: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {},
    }),
  },

  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    letterSpacing: 0.1,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },

  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginTop: 6,
    marginLeft: 4,
    letterSpacing: 0.1,
  },

  hintText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
});
