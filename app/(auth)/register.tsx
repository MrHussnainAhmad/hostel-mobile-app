// screens/RegisterScreen.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ArrowRight, ChevronLeft, Lock, Mail, User } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { authApi } from "@/api/auth";
import { Button, Input, RoleSelector } from "@/components/ui";
import { COLORS, OPACITY } from "@/constants/colors";
import { useAuthStore } from "@/stores/authStore";
import { RegisterFormData, registerSchema } from "@/utils/validation";

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const slowServerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "STUDENT",
      fullName: "",
    },
  });

  const selectedRole = watch("role");

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (slowServerTimeoutRef.current) {
        clearTimeout(slowServerTimeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);

      // Start 10-second timer for slow server notification
      slowServerTimeoutRef.current = setTimeout(() => {
        Toast.show({
          type: "info",
          text1: "Ahhh, Here we go slow server",
          text2: "Just few more seconds. Sorry, we're working to change server but it costs 🥴",
          visibilityTime: 5000,
        });
      }, 10000);

      const payload = {
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === "STUDENT" && { fullName: data.fullName }),
      };

      const response = await authApi.register(payload);

      // Clear the slow server timeout
      if (slowServerTimeoutRef.current) {
        clearTimeout(slowServerTimeoutRef.current);
        slowServerTimeoutRef.current = null;
      }

      if (response.success && response.data) {
        const { user, token } = response.data;
        await setAuth(user, token);

        Toast.show({
          type: "success",
          text1: "Account Created!",
          text2: "Welcome to HostelsHub",
        });

        if (user.role === "STUDENT") {
          router.replace("/(app)/student");
        } else {
          router.replace("/(app)/manager");
        }
      }
    } catch (error: any) {
      // Clear the slow server timeout
      if (slowServerTimeoutRef.current) {
        clearTimeout(slowServerTimeoutRef.current);
        slowServerTimeoutRef.current = null;
      }

      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Back Button */}
        <Animated.View
          style={styles.backButtonContainer}
          entering={FadeIn.duration(300)}
        >
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} strokeWidth={1.5} />
          </Pressable>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header Section */}
          <Animated.View
            style={styles.header}
            entering={FadeInUp.duration(500).delay(100)}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.welcomeLabel}>Get started</Text>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                Join HostelsHub and find your perfect stay
              </Text>
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={styles.formSection}
            entering={FadeInDown.duration(500).delay(200)}
          >
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
            {selectedRole === "STUDENT" && (
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
                      leftIcon={<User size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.fullName?.message}
                    />
                  )}
                />
              </Animated.View>
            )}

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Mail size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Create a strong password"
                  secureTextEntry
                  autoComplete="password-new"
                  leftIcon={<Lock size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                icon={<ArrowRight size={18} color={COLORS.textInverse} strokeWidth={2} />}
              />
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {selectedRole === "STUDENT"
                  ? "🎓 Browse hostels, book rooms, and manage your stay easily."
                  : "🏢 List your hostels, manage rooms, and connect with students."}
              </Text>
            </View>
          </Animated.View>

          {/* Footer Section */}
          <Animated.View
            style={styles.footer}
            entering={FadeInUp.duration(500).delay(300)}
          >
            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && { opacity: OPACITY.pressed },
                ]}
              >
                <Text style={styles.loginLink}>Sign in</Text>
              </Pressable>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{" "}
              <Text
                style={styles.termsLink}
                onPress={() => router.push("/(auth)/legal?type=terms")}
              >
                Terms
              </Text>{" "}
              and{" "}
              <Text
                style={styles.termsLink}
                onPress={() => router.push("/(auth)/legal?type=privacy")}
              >
                Privacy Policy
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },

  // Back Button
  backButtonContainer: {
    position: "absolute",
    top: 8,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 42,
  },
  titleContainer: {
    alignItems: "center",
  },
  welcomeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Form
  formSection: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },

  // Info Box
  infoBox: {
    marginTop: 20,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: "center",
  },

  // Footer
  footer: {
    marginTop: 28,
    alignItems: "center",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  loginText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  loginButton: {
    paddingVertical: 4,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "500",
  },
});