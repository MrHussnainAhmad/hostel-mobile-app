// screens/LoginScreen.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronRight, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { authApi } from '@/api/auth';
import { Button, Input } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { LoginFormData, loginSchema } from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await authApi.login(data);

      if (response.success && response.data) {
        const { user, token } = response.data;

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
          Toast.show({
            type: 'error',
            text1: 'Access Denied',
            text2: 'Admin accounts cannot access mobile app',
          });
          return;
        }

        await setAuth(user, token);

        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: `Logged in as ${user.email}`,
        });

        if (user.role === 'STUDENT') {
          router.replace('/(app)/student');
        } else {
          router.replace('/(app)/manager');
        }
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <View style={styles.container}>
          {/* Decorative Background (refined, softer) */}
          <View style={styles.bgDecoration}>
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              style={styles.header}
              entering={FadeInUp.duration(600).delay(100)}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.welcomeLabel}>Welcome back</Text>
                <Text style={styles.title}>Sign in to your account</Text>
                <Text style={styles.subtitle}>
                  Manage your hostel bookings, rooms and requests in one place.
                </Text>
              </View>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              style={styles.formCard}
              entering={FadeInDown.duration(600).delay(200)}
            >
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Sign in</Text>
                <View style={styles.formDivider} />
              </View>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email address"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    leftIcon={<Mail size={18} color={COLORS.textMuted} />}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry
                    autoComplete="password"
                    leftIcon={<Lock size={18} color={COLORS.textMuted} />}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotButton}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <Button
                title="Sign in"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                icon={<ArrowRight size={18} color={COLORS.textInverse} />}
                style={styles.button}
              />
            </Animated.View>

            {/* Footer */}
            <Animated.View
              style={styles.footer}
              entering={FadeInUp.duration(600).delay(350)}
            >
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register')}
                  style={styles.footerLinkButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLink}>Create account</Text>
                  <ChevronRight size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.termsText}>
                By signing in, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  keyboardAvoider: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // Background Decoration
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.45,
  },
  bgCircle2: {
    position: 'absolute',
    top: 40,
    left: -70,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: {
    width: 100,
    height: 100,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  welcomeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  formHeader: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  formDivider: {
    height: 2,
    width: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
  },

  // Footer
  footer: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 2,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});