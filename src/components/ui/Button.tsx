// components/Button.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from 'react-native';
import AppText from '../common/AppText';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: PressableProps['style'];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = true,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.button,
      styles[`button_${variant}`],
      styles[`button_${size}`],
      fullWidth && styles.fullWidth,
      isDisabled && styles.buttonDisabled,
      pressed && !isDisabled && { opacity: OPACITY.pressed },
      typeof style === 'function' ? style({ pressed }) : style,
    ],
    [variant, size, fullWidth, isDisabled, style]
  );

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    isDisabled && styles.textDisabled,
  ];

  const getLoaderColor = () => {
    if (variant === 'primary') return COLORS.textInverse;
    return COLORS.primary;
  };

  return (
    <Pressable
      style={getButtonStyle}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="small"
            color={getLoaderColor()}
          />
        </View>
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <AppText style={textStyles}>{title}</AppText>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  fullWidth: {
    width: '100%',
  },

  // Variants
  button_primary: {
    backgroundColor: COLORS.primary,
    // Subtle shadow for depth
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  button_secondary: {
    backgroundColor: COLORS.bgSecondary,
  },
  button_outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  button_ghost: {
    backgroundColor: COLORS.transparent,
  },

  // Sizes
  button_sm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  button_md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  button_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },

  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  loaderContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  text_primary: {
    color: COLORS.textInverse,
  },
  text_secondary: {
    color: COLORS.textPrimary,
  },
  text_outline: {
    color: COLORS.textPrimary,
  },
  text_ghost: {
    color: COLORS.primary,
  },

  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 15,
  },
  text_lg: {
    fontSize: 16,
  },

  textDisabled: {
    color: COLORS.buttonDisabledText,
  },
});