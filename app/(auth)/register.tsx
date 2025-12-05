// screens/RegisterScreen.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  ChevronLeft,
  Lock,
  Mail,
  User,
} from 'lucide-react-native';
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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { authApi } from '@/api/auth';
import { Button, Input, RoleSelector } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { RegisterFormData, registerSchema } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'STUDENT',
      fullName: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);

      const payload = {
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === 'STUDENT' && { fullName: data.fullName }),
      };

      const response = await authApi.register(payload);

      if (response.success && response.data) {
        const { user, token } = response.data;
        await setAuth(user, token);

        Toast.show({
          type: 'success',
          text1: 'Account Created!',
          text2: 'Welcome to HostelsHub',
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
        text1: 'Registration Failed',
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
          {/* Decorative Background */}
          <View style={styles.bgDecoration}>
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
            <View style={styles.bgCircle3} />
          </View>

          {/* Back Button */}
          <Animated.View
            style={styles.backButtonContainer}
            entering={FadeIn.duration(400)}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
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
                <Text style={styles.welcomeLabel}>Get started</Text>
                <Text style={styles.title}>Create your account</Text>
                <Text style={styles.subtitle}>
                  Join thousands of students and managers using HostelsHub.
                </Text>
              </View>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              style={styles.formCard}
              entering={FadeInDown.duration(600).delay(200)}
            >
              {/* Form Header */}
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Basic details</Text>
                <View style={styles.formDivider} />
              </View>

              {/* Role Selector */}
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <RoleSelector
                    value={value}
                    onChange={onChange}
                    error={errors.role?.message}
                  />
                )}
              />

              {/* Full Name - Only for Students */}
              {selectedRole === 'STUDENT' && (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  layout={Layout.springify()}
                >
                  <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Full name"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        leftIcon={
                          <User size={18} color={COLORS.textMuted} />
                        }
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.fullName?.message}
                      />
                    )}
                  />
                </Animated.View>
              )}

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
                    placeholder="Create a strong password"
                    secureTextEntry
                    autoComplete="password-new"
                    leftIcon={<Lock size={18} color={COLORS.textMuted} />}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              {/* Submit Button */}
              <Button
                title="Create account"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                icon={<ArrowRight size={18} color={COLORS.textInverse} />}
                style={styles.button}
              />

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  {selectedRole === 'STUDENT'
                    ? '🎓 Students can browse hostels, submit complaints, and manage their stay.'
                    : '🏢 Managers can list hostels, manage rooms, and handle student requests.'}
                </Text>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View
              style={styles.footer}
              entering={FadeInUp.duration(600).delay(400)}
            >
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                style={styles.footerLinkButton}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Sign in</Text>
                <ChevronLeft
                  size={16}
                  color={COLORS.primary}
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Terms */}
            <Animated.View
              style={styles.terms}
              entering={FadeInUp.duration(600).delay(500)}
            >
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
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
    height: 320,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.55,
  },
  bgCircle2: {
    position: 'absolute',
    top: 50,
    left: -80,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.35,
  },
  bgCircle3: {
    position: 'absolute',
    top: 210,
    right: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },

  // Back Button
  backButtonContainer: {
    position: 'absolute',
    top: 12,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,

  },
  logo: {
    width: 100,
    height: 50,
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
  button: {
    marginTop: 8,
  },

  // Info Box
  infoBox: {
    marginTop: 18,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 18,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Terms
  terms: {
    paddingHorizontal: 16,
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